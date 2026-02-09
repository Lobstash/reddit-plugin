#!/usr/bin/env node

import { config } from 'dotenv';
config({ path: '/root/.openclaw/.env' });
import axios, { AxiosResponse } from 'axios';

// Configuration
const CONFIG = {
  REDDIT_API_BASE: 'https://www.reddit.com/api/v1',
  REDDIT_OAUTH_BASE: 'https://oauth.reddit.com',
  USER_AGENT: `openclaw-reddit-plugin/1.0.0 by ${process.env.REDDIT_USERNAME}`
};

interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

interface RedditPost {
  id: string;
  title: string;
  subreddit: string;
  score: number;
  num_comments: number;
  url: string;
  permalink: string;
  created_utc: number;
  author: string;
  selftext?: string;
}

interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  created_utc: number;
  permalink: string;
  parent_id: string;
  link_id: string;
}

class RedditCLI {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    const requiredEnvVars = ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_USERNAME', 'REDDIT_PASSWORD'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`${envVar} environment variable required`);
      }
    }
  }

  private async authenticate(): Promise<void> {
    // Check if token is still valid (with 5 minute buffer)
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 300000) {
      return;
    }

    try {
      const auth = Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64');
      
      const response: AxiosResponse<RedditTokenResponse> = await axios.post(
        `${CONFIG.REDDIT_API_BASE}/access_token`,
        new URLSearchParams({
          grant_type: 'password',
          username: process.env.REDDIT_USERNAME!,
          password: process.env.REDDIT_PASSWORD!
        }),
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'User-Agent': CONFIG.USER_AGENT,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Authentication failed: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
      }
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  private async makeRequest(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', endpoint: string, data?: any): Promise<any> {
    await this.authenticate();

    try {
      const url = endpoint.startsWith('http') ? endpoint : `${CONFIG.REDDIT_OAUTH_BASE}${endpoint}`;
      
      const config: any = {
        method,
        url,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'User-Agent': CONFIG.USER_AGENT
        }
      };

      if (data) {
        if (method === 'GET') {
          config.params = data;
        } else {
          config.data = data;
          config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      }

      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API request failed: ${error.response.status} - ${error.response.data?.message || JSON.stringify(error.response.data)}`);
      }
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  // Command implementations
  async post(subreddit: string, title: string, content: string, flair?: string): Promise<void> {
    const isUrl = content.startsWith('http://') || content.startsWith('https://');
    
    const data = new URLSearchParams({
      api_type: 'json',
      sr: subreddit,
      title,
      kind: isUrl ? 'link' : 'self',
      ...(isUrl ? { url: content } : { text: content })
    });

    if (flair) {
      data.append('flair_text', flair);
    }

    const result = await this.makeRequest('POST', '/api/submit', data);
    
    if (result.json?.errors?.length) {
      throw new Error(`Post failed: ${result.json.errors.join(', ')}`);
    }

    console.log(JSON.stringify({
      success: true,
      post_id: result.json?.data?.id,
      url: result.json?.data?.url,
      permalink: `https://reddit.com${result.json?.data?.permalink}`,
      message: `Posted to r/${subreddit}`
    }));
  }

  async comment(thingId: string, text: string): Promise<void> {
    const data = new URLSearchParams({
      api_type: 'json',
      parent: thingId,
      text
    });

    const result = await this.makeRequest('POST', '/api/comment', data);
    
    if (result.json?.errors?.length) {
      throw new Error(`Comment failed: ${result.json.errors.join(', ')}`);
    }

    console.log(JSON.stringify({
      success: true,
      comment_id: result.json?.data?.things?.[0]?.data?.id,
      permalink: result.json?.data?.things?.[0]?.data?.permalink,
      message: 'Comment posted successfully'
    }));
  }

  async reply(thingId: string, text: string): Promise<void> {
    return this.comment(thingId, text);
  }

  async vote(thingId: string, direction: 1 | 0 | -1): Promise<void> {
    const data = new URLSearchParams({
      id: thingId,
      dir: direction.toString()
    });

    await this.makeRequest('POST', '/api/vote', data);
    
    const action = direction === 1 ? 'upvoted' : direction === -1 ? 'downvoted' : 'unvoted';
    console.log(JSON.stringify({
      success: true,
      message: `Successfully ${action} ${thingId}`
    }));
  }

  async upvote(thingId: string): Promise<void> {
    return this.vote(thingId, 1);
  }

  async downvote(thingId: string): Promise<void> {
    return this.vote(thingId, -1);
  }

  async save(thingId: string): Promise<void> {
    const data = new URLSearchParams({
      id: thingId
    });

    await this.makeRequest('POST', '/api/save', data);
    
    console.log(JSON.stringify({
      success: true,
      message: `Successfully saved ${thingId}`
    }));
  }

  async delete(thingId: string): Promise<void> {
    const data = new URLSearchParams({
      id: thingId
    });

    await this.makeRequest('POST', '/api/del', data);
    
    console.log(JSON.stringify({
      success: true,
      message: `Successfully deleted ${thingId}`
    }));
  }

  async edit(thingId: string, text: string): Promise<void> {
    const data = new URLSearchParams({
      api_type: 'json',
      thing_id: thingId,
      text
    });

    const result = await this.makeRequest('POST', '/api/editusertext', data);
    
    if (result.json?.errors?.length) {
      throw new Error(`Edit failed: ${result.json.errors.join(', ')}`);
    }

    console.log(JSON.stringify({
      success: true,
      message: `Successfully edited ${thingId}`
    }));
  }

  async search(query: string, subreddit?: string, sort?: string, time?: string): Promise<void> {
    const params: any = {
      q: query,
      type: 'sr,link',
      sort: sort || 'relevance',
      limit: 25
    };

    if (subreddit) {
      params.restrict_sr = 'true';
    }

    if (time && ['hour', 'day', 'week', 'month', 'year', 'all'].includes(time)) {
      params.t = time;
    }

    const endpoint = subreddit ? `/r/${subreddit}/search` : '/search';
    const result = await this.makeRequest('GET', endpoint, params);

    const posts = result.data?.children?.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      subreddit: child.data.subreddit,
      score: child.data.score,
      num_comments: child.data.num_comments,
      url: child.data.url,
      permalink: `https://reddit.com${child.data.permalink}`,
      created_utc: child.data.created_utc,
      author: child.data.author
    })) || [];

    console.log(JSON.stringify({
      query,
      subreddit: subreddit || 'all',
      total_results: posts.length,
      posts
    }));
  }

  async getSubredditPosts(subreddit: string, sort: 'hot' | 'new' | 'top', time?: string, limit: number = 25): Promise<void> {
    const params: any = {
      limit: Math.min(limit, 100)
    };

    if (sort === 'top' && time && ['hour', 'day', 'week', 'month', 'year', 'all'].includes(time)) {
      params.t = time;
    }

    const endpoint = `/r/${subreddit}/${sort}`;
    const result = await this.makeRequest('GET', endpoint, params);

    const posts = result.data?.children?.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      subreddit: child.data.subreddit,
      score: child.data.score,
      num_comments: child.data.num_comments,
      url: child.data.url,
      permalink: `https://reddit.com${child.data.permalink}`,
      created_utc: child.data.created_utc,
      author: child.data.author,
      selftext: child.data.selftext || undefined
    })) || [];

    console.log(JSON.stringify({
      subreddit,
      sort,
      time,
      limit,
      total_results: posts.length,
      posts
    }));
  }

  async getUserProfile(username?: string): Promise<void> {
    const user = username || process.env.REDDIT_USERNAME;
    const result = await this.makeRequest('GET', `/user/${user}/about`);

    console.log(JSON.stringify({
      username: result.data.name,
      id: result.data.id,
      comment_karma: result.data.comment_karma,
      link_karma: result.data.link_karma,
      total_karma: result.data.total_karma,
      created_utc: result.data.created_utc,
      verified: result.data.verified,
      is_gold: result.data.is_gold,
      is_mod: result.data.is_mod
    }));
  }

  async getUserPosts(username?: string, limit: number = 25): Promise<void> {
    const user = username || process.env.REDDIT_USERNAME;
    const result = await this.makeRequest('GET', `/user/${user}/submitted`, { limit: Math.min(limit, 100) });

    const posts = result.data?.children?.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      subreddit: child.data.subreddit,
      score: child.data.score,
      num_comments: child.data.num_comments,
      url: child.data.url,
      permalink: `https://reddit.com${child.data.permalink}`,
      created_utc: child.data.created_utc
    })) || [];

    console.log(JSON.stringify({
      username: user,
      total_posts: posts.length,
      posts
    }));
  }

  async getUserComments(username?: string, limit: number = 25): Promise<void> {
    const user = username || process.env.REDDIT_USERNAME;
    const result = await this.makeRequest('GET', `/user/${user}/comments`, { limit: Math.min(limit, 100) });

    const comments = result.data?.children?.map((child: any) => ({
      id: child.data.id,
      body: child.data.body,
      score: child.data.score,
      subreddit: child.data.subreddit,
      permalink: `https://reddit.com${child.data.permalink}`,
      created_utc: child.data.created_utc,
      parent_id: child.data.parent_id,
      link_id: child.data.link_id
    })) || [];

    console.log(JSON.stringify({
      username: user,
      total_comments: comments.length,
      comments
    }));
  }

  async getInbox(): Promise<void> {
    const result = await this.makeRequest('GET', '/message/inbox');

    const messages = result.data?.children?.map((child: any) => ({
      id: child.data.id,
      subject: child.data.subject,
      body: child.data.body,
      author: child.data.author,
      created_utc: child.data.created_utc,
      new: child.data.new,
      was_comment: child.data.was_comment,
      permalink: child.data.permalink ? `https://reddit.com${child.data.permalink}` : null
    })) || [];

    console.log(JSON.stringify({
      total_messages: messages.length,
      unread_count: messages.filter(m => m.new).length,
      messages
    }));
  }

  async sendMessage(to: string, subject: string, body: string): Promise<void> {
    const data = new URLSearchParams({
      api_type: 'json',
      to,
      subject,
      text: body
    });

    const result = await this.makeRequest('POST', '/api/compose', data);
    
    if (result.json?.errors?.length) {
      throw new Error(`Send message failed: ${result.json.errors.join(', ')}`);
    }

    console.log(JSON.stringify({
      success: true,
      message: `Message sent to u/${to}`,
      subject
    }));
  }

  async getKarma(): Promise<void> {
    const result = await this.makeRequest('GET', '/api/v1/me/karma');

    const karma = result.data?.map((item: any) => ({
      subreddit: item.sr,
      comment_karma: item.comment_karma,
      link_karma: item.link_karma
    })) || [];

    const totalCommentKarma = karma.reduce((sum: number, item: any) => sum + item.comment_karma, 0);
    const totalLinkKarma = karma.reduce((sum: number, item: any) => sum + item.link_karma, 0);

    console.log(JSON.stringify({
      total_comment_karma: totalCommentKarma,
      total_link_karma: totalLinkKarma,
      total_karma: totalCommentKarma + totalLinkKarma,
      karma_breakdown: karma
    }));
  }

  async subscribe(subreddit: string): Promise<void> {
    const data = new URLSearchParams({
      action: 'sub',
      sr_name: subreddit
    });

    await this.makeRequest('POST', '/api/subscribe', data);
    
    console.log(JSON.stringify({
      success: true,
      message: `Successfully subscribed to r/${subreddit}`
    }));
  }

  async unsubscribe(subreddit: string): Promise<void> {
    const data = new URLSearchParams({
      action: 'unsub',
      sr_name: subreddit
    });

    await this.makeRequest('POST', '/api/subscribe', data);
    
    console.log(JSON.stringify({
      success: true,
      message: `Successfully unsubscribed from r/${subreddit}`
    }));
  }

  async getFlairs(subreddit: string): Promise<void> {
    const result = await this.makeRequest('GET', `/r/${subreddit}/api/link_flair_v2`);

    const flairs = result?.map((flair: any) => ({
      id: flair.id,
      text: flair.text,
      css_class: flair.css_class,
      mod_only: flair.mod_only
    })) || [];

    console.log(JSON.stringify({
      subreddit,
      total_flairs: flairs.length,
      flairs
    }));
  }

  async getMultireddit(subreddits: string[], limit: number = 25): Promise<void> {
    const subredditList = subreddits.join('+');
    const result = await this.makeRequest('GET', `/r/${subredditList}/hot`, { limit: Math.min(limit, 100) });

    const posts = result.data?.children?.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      subreddit: child.data.subreddit,
      score: child.data.score,
      num_comments: child.data.num_comments,
      url: child.data.url,
      permalink: `https://reddit.com${child.data.permalink}`,
      created_utc: child.data.created_utc,
      author: child.data.author
    })) || [];

    console.log(JSON.stringify({
      subreddits,
      total_results: posts.length,
      posts
    }));
  }
}

// CLI Argument Parsing
async function main() {
  try {
    const reddit = new RedditCLI();
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command) {
      console.error(JSON.stringify({ error: 'No command specified. Use --help for available commands.' }));
      process.exit(1);
    }

    switch (command) {
      case 'post':
        if (args.length < 4) {
          throw new Error('Usage: post <subreddit> <title> <text_or_url> [flair]');
        }
        await reddit.post(args[1], args[2], args[3], args[4]);
        break;

      case 'comment':
        if (args.length < 3) {
          throw new Error('Usage: comment <thing_id> <text>');
        }
        await reddit.comment(args[1], args[2]);
        break;

      case 'reply':
        if (args.length < 3) {
          throw new Error('Usage: reply <thing_id> <text>');
        }
        await reddit.reply(args[1], args[2]);
        break;

      case 'upvote':
        if (args.length < 2) {
          throw new Error('Usage: upvote <thing_id>');
        }
        await reddit.upvote(args[1]);
        break;

      case 'downvote':
        if (args.length < 2) {
          throw new Error('Usage: downvote <thing_id>');
        }
        await reddit.downvote(args[1]);
        break;

      case 'save':
        if (args.length < 2) {
          throw new Error('Usage: save <thing_id>');
        }
        await reddit.save(args[1]);
        break;

      case 'delete':
        if (args.length < 2) {
          throw new Error('Usage: delete <thing_id>');
        }
        await reddit.delete(args[1]);
        break;

      case 'edit':
        if (args.length < 3) {
          throw new Error('Usage: edit <thing_id> <text>');
        }
        await reddit.edit(args[1], args[2]);
        break;

      case 'search':
        if (args.length < 2) {
          throw new Error('Usage: search <query> [subreddit] [sort] [time]');
        }
        await reddit.search(args[1], args[2], args[3], args[4]);
        break;

      case 'subreddit-hot':
        if (args.length < 2) {
          throw new Error('Usage: subreddit-hot <subreddit> [limit]');
        }
        await reddit.getSubredditPosts(args[1], 'hot', undefined, parseInt(args[2]) || 25);
        break;

      case 'subreddit-new':
        if (args.length < 2) {
          throw new Error('Usage: subreddit-new <subreddit> [limit]');
        }
        await reddit.getSubredditPosts(args[1], 'new', undefined, parseInt(args[2]) || 25);
        break;

      case 'subreddit-top':
        if (args.length < 2) {
          throw new Error('Usage: subreddit-top <subreddit> [time] [limit]');
        }
        await reddit.getSubredditPosts(args[1], 'top', args[2] || 'all', parseInt(args[3]) || 25);
        break;

      case 'user-profile':
        await reddit.getUserProfile(args[1]);
        break;

      case 'user-posts':
        await reddit.getUserPosts(args[1], parseInt(args[2]) || 25);
        break;

      case 'user-comments':
        await reddit.getUserComments(args[1], parseInt(args[2]) || 25);
        break;

      case 'inbox':
        await reddit.getInbox();
        break;

      case 'message-send':
        if (args.length < 4) {
          throw new Error('Usage: message-send <to> <subject> <body>');
        }
        await reddit.sendMessage(args[1], args[2], args[3]);
        break;

      case 'karma':
        await reddit.getKarma();
        break;

      case 'subscribe':
        if (args.length < 2) {
          throw new Error('Usage: subscribe <subreddit>');
        }
        await reddit.subscribe(args[1]);
        break;

      case 'unsubscribe':
        if (args.length < 2) {
          throw new Error('Usage: unsubscribe <subreddit>');
        }
        await reddit.unsubscribe(args[1]);
        break;

      case 'flair-list':
        if (args.length < 2) {
          throw new Error('Usage: flair-list <subreddit>');
        }
        await reddit.getFlairs(args[1]);
        break;

      case 'multireddit':
        if (args.length < 2) {
          throw new Error('Usage: multireddit <comma_separated_subreddits> [limit]');
        }
        const subreddits = args[1].split(',').map(s => s.trim());
        await reddit.getMultireddit(subreddits, parseInt(args[2]) || 25);
        break;

      case '--help':
      case 'help':
        console.log(JSON.stringify({
          commands: [
            'post <subreddit> <title> <text_or_url> [flair] - Submit a post',
            'comment <thing_id> <text> - Comment on a post',
            'reply <thing_id> <text> - Reply to a comment',
            'upvote <thing_id> - Upvote a post/comment',
            'downvote <thing_id> - Downvote a post/comment',
            'save <thing_id> - Save a post/comment',
            'delete <thing_id> - Delete own post/comment',
            'edit <thing_id> <text> - Edit own post/comment',
            'search <query> [subreddit] [sort] [time] - Search posts',
            'subreddit-hot <subreddit> [limit] - Get hot posts',
            'subreddit-new <subreddit> [limit] - Get new posts',
            'subreddit-top <subreddit> [time] [limit] - Get top posts',
            'user-profile [username] - Get user profile',
            'user-posts [username] [limit] - Get user posts',
            'user-comments [username] [limit] - Get user comments',
            'inbox - Get inbox messages',
            'message-send <to> <subject> <body> - Send private message',
            'karma - Get karma breakdown',
            'subscribe <subreddit> - Subscribe to subreddit',
            'unsubscribe <subreddit> - Unsubscribe from subreddit',
            'flair-list <subreddit> - List available flairs',
            'multireddit <subreddits> [limit] - Get posts from multiple subreddits'
          ]
        }));
        break;

      default:
        throw new Error(`Unknown command: ${command}. Use --help for available commands.`);
    }
  } catch (error: any) {
    console.error(JSON.stringify({ error: error.message }));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { RedditCLI };
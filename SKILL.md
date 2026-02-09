# Reddit CLI Skill

A comprehensive CLI for interacting with Reddit - post, comment, search, vote, message and manage your Reddit presence.

## Current Status

✅ **Working Features:**
- Authentication via OAuth2 (password grant)
- Post submission (text and link posts)
- Commenting and replying
- Voting (upvote/downvote)
- Saving and deleting posts/comments
- Editing own posts/comments
- Searching posts across subreddits
- Browsing subreddit posts (hot, new, top)
- User profile and post/comment history
- Inbox management and private messaging
- Karma breakdown by subreddit
- Subreddit subscription management
- Flair listing
- Multi-subreddit browsing

All core Reddit functionality is fully implemented and working.

## Installation & Setup

```bash
cd /root/.openclaw/workspace/skills/reddit/
npm install
```

## Environment Requirements

Requires these variables in `/root/.openclaw/.env` file:
- `REDDIT_CLIENT_ID` - Reddit app client ID
- `REDDIT_CLIENT_SECRET` - Reddit app client secret
- `REDDIT_USERNAME` - Your Reddit username
- `REDDIT_PASSWORD` - Your Reddit password

See `setup.md` for detailed setup instructions.

## Usage

All commands output structured JSON for easy parsing. Use the shell wrapper or direct invocation:

```bash
# Via shell wrapper (recommended)
./reddit <command> [args]

# Direct invocation
npx ts-node cli.ts <command> [args]
```

## Commands Reference

### Posting & Content Creation

#### `reddit post <subreddit> <title> <text_or_url> [flair]`
Submit a post to a subreddit (automatically detects text vs link posts).

**Examples:**
```bash
reddit post "programming" "My first React app" "Check out what I built today..."
reddit post "news" "Breaking News" "https://example.com/article" "Politics"
```

#### `reddit comment <thing_id> <text>`
Comment on a post.

**Example:**
```bash
reddit comment "t3_abc123" "Great post! Thanks for sharing."
```

#### `reddit reply <thing_id> <text>`
Reply to a comment (same as comment command).

**Example:**
```bash
reddit reply "t1_def456" "I agree with your point about..."
```

### Voting & Interactions

#### `reddit upvote <thing_id>`
Upvote a post or comment.

#### `reddit downvote <thing_id>`
Downvote a post or comment.

#### `reddit save <thing_id>`
Save a post or comment for later.

**Example:**
```bash
reddit upvote "t3_abc123"
reddit save "t1_def456"
```

### Content Management

#### `reddit delete <thing_id>`
Delete your own post or comment.

#### `reddit edit <thing_id> <text>`
Edit your own post or comment.

**Example:**
```bash
reddit edit "t3_abc123" "Updated post content with corrections..."
```

### Discovery & Search

#### `reddit search <query> [subreddit] [sort] [time]`
Search posts across Reddit or within a specific subreddit.

**Examples:**
```bash
reddit search "machine learning"
reddit search "python tips" "programming" "top" "week"
```

#### `reddit subreddit-hot <subreddit> [limit]`
Get hot posts from a subreddit.

#### `reddit subreddit-new <subreddit> [limit]`
Get new posts from a subreddit.

#### `reddit subreddit-top <subreddit> [time] [limit]`
Get top posts from a subreddit (time: hour/day/week/month/year/all).

**Examples:**
```bash
reddit subreddit-hot "programming" 10
reddit subreddit-top "technology" "week" 25
```

#### `reddit multireddit <comma_separated_subreddits> [limit]`
Get posts from multiple subreddits at once.

**Example:**
```bash
reddit multireddit "programming,webdev,javascript" 20
```

### User Management

#### `reddit user-profile [username]`
Get user profile information (defaults to your own profile).

#### `reddit user-posts [username] [limit]`
Get a user's recent posts.

#### `reddit user-comments [username] [limit]`
Get a user's recent comments.

**Examples:**
```bash
reddit user-profile "spez"
reddit user-posts "gallowboob" 50
```

### Messaging & Communication

#### `reddit inbox`
Get your inbox messages and replies.

#### `reddit message-send <to> <subject> <body>`
Send a private message to another user.

**Example:**
```bash
reddit message-send "username" "Hello!" "Thanks for the helpful comment."
```

### Account Statistics

#### `reddit karma`
Get karma breakdown by subreddit.

**Example output:**
```json
{
  "total_comment_karma": 1337,
  "total_link_karma": 420,
  "total_karma": 1757,
  "karma_breakdown": [
    {
      "subreddit": "programming",
      "comment_karma": 500,
      "link_karma": 200
    }
  ]
}
```

### Subreddit Management

#### `reddit subscribe <subreddit>`
Subscribe to a subreddit.

#### `reddit unsubscribe <subreddit>`
Unsubscribe from a subreddit.

#### `reddit flair-list <subreddit>`
List available post flairs for a subreddit.

**Examples:**
```bash
reddit subscribe "artificial"
reddit flair-list "programming"
```

## Common Workflows

### 1. Daily Reddit Check
```bash
# Check inbox
reddit inbox

# Browse favorite subreddits
reddit subreddit-hot "programming" 10
reddit subreddit-new "technology" 5

# Check karma
reddit karma
```

### 2. Content Sharing
```bash
# Post to multiple relevant subreddits
reddit post "programming" "New Python library I built" "https://github.com/user/repo"
reddit post "python" "Created a new automation tool" "https://github.com/user/repo"

# Engage with comments
reddit comment "t3_abc123" "Thanks for the feedback!"
```

### 3. Research & Discovery
```bash
# Search for specific topics
reddit search "OpenAI GPT" "artificial" "top" "week"

# Browse multiple related subreddits
reddit multireddit "MachineLearning,artificial,singularity"

# Check specific users' content
reddit user-posts "research_bot" 20
```

### 4. Community Management
```bash
# Subscribe to new subreddits
reddit subscribe "webdev"

# Check available flairs before posting
reddit flair-list "webdev"

# Send welcome messages to new contributors
reddit message-send "newuser" "Welcome!" "Thanks for joining our community!"
```

## Error Handling

All errors are returned as JSON to stderr:
```json
{
  "error": "Authentication failed: 401 - invalid credentials"
}
```

Common error scenarios:
- Invalid credentials (check environment variables)
- Rate limiting (Reddit has strict rate limits)
- Insufficient permissions (some subreddits require karma)
- Invalid thing_ids (format: t1_ for comments, t3_ for posts)

## Key Features

- **Full OAuth2 Integration**: Secure authentication with automatic token refresh
- **Complete CRUD Operations**: Create, read, update, delete posts and comments
- **Advanced Search**: Query across subreddits with sorting and time filters
- **Batch Operations**: Multi-subreddit browsing and bulk content management
- **Real-time Messaging**: Inbox monitoring and private messaging
- **Analytics**: Comprehensive karma and engagement tracking
- **Moderation Support**: Flair management and community tools

## Security Notes

- Credentials are loaded from environment variables only
- OAuth tokens are automatically refreshed as needed
- User-Agent header properly identifies the client
- Rate limiting is handled gracefully with appropriate error messages
- All API calls use HTTPS endpoints

## Reddit API Details

- **Authentication**: OAuth2 password grant flow
- **Base URLs**: 
  - Auth: `https://www.reddit.com/api/v1`
  - API: `https://oauth.reddit.com`
- **Rate Limits**: 60 requests per minute for OAuth apps
- **Thing IDs**: Posts (t3_), Comments (t1_), Users (t2_), Messages (t4_)
- **Required Headers**: Authorization, User-Agent

## Troubleshooting

**Authentication Issues:**
1. Verify all environment variables are set correctly
2. Check that Reddit app is configured as "script" type
3. Ensure username/password are correct (not email)

**API Errors:**
1. Check rate limiting (wait 1 minute between heavy operations)
2. Verify thing_id format (t3_ for posts, t1_ for comments)
3. Ensure you have permission to post in target subreddit

**Common Reddit Restrictions:**
- New accounts have posting limitations
- Some subreddits require minimum karma
- Private subreddits need membership approval
- Shadowbanned accounts may appear to work but don't actually post
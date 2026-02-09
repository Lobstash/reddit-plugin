# Reddit CLI Plugin for OpenClaw

A comprehensive Reddit CLI plugin that enables you to manage your Reddit presence directly from the command line. Post, comment, vote, search, message, and automate your Reddit interactions with ease.

![OpenClaw Reddit Plugin](https://img.shields.io/badge/OpenClaw-Reddit%20Plugin-orange?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green?style=for-the-badge)

## 🚀 Features

- **Complete Reddit API Integration** - Full OAuth2 authentication with automatic token refresh
- **Content Management** - Create, edit, delete posts and comments
- **Social Interactions** - Upvote, downvote, save, and reply to content  
- **Advanced Search** - Search across subreddits with filtering and sorting
- **User Analytics** - Track karma, post history, and engagement metrics
- **Messaging System** - Send and receive private messages
- **Community Management** - Subscribe/unsubscribe, manage flairs
- **Multi-subreddit Support** - Browse multiple communities simultaneously
- **JSON Output** - Structured data perfect for automation and scripting

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- A Reddit account
- Reddit API credentials (client ID and secret)

## 🔧 Installation

### Option 1: Deploy with PinchKit (Recommended)

Deploy this plugin instantly to your OpenClaw instance:

[![Deploy to PinchKit](https://img.shields.io/badge/Deploy%20to-PinchKit-blueviolet?style=for-the-badge&logo=rocket)](https://pinchkit.com/deploy?repo=jugs-eth/reddit-plugin&utm_source=github&utm_medium=readme&utm_campaign=reddit)

PinchKit will:
- ✅ Automatically clone and install the plugin
- ✅ Set up the environment and dependencies  
- ✅ Configure the skill for immediate use
- ✅ Provide setup guidance for Reddit API credentials

### Option 2: Manual Installation

```bash
# Clone to your OpenClaw skills directory
cd /root/.openclaw/workspace/skills/
git clone https://github.com/jugs-eth/reddit-plugin.git reddit
cd reddit

# Install dependencies
npm install

# Set up environment variables (see Setup section below)
```

## ⚙️ Setup

### 1. Create Reddit App

1. Go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"  
3. Fill in the details:
   - **Name**: `openclaw-reddit-plugin` (or any name you prefer)
   - **App type**: Select **"script"** 
   - **Description**: OpenClaw Reddit automation
   - **About URL**: (leave blank or add your website)
   - **Redirect URI**: `http://localhost:8080` (required but not used)
4. Click "Create app"

### 2. Get Credentials

After creating the app, you'll see:
- **Client ID**: The string directly under the app name (looks like: `abcd1234wxyz`)
- **Client Secret**: The longer string labeled "secret" 

### 3. Configure Environment Variables

Add these to your `/root/.openclaw/.env` file:

```bash
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here  
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
```

⚠️ **Important**: Use your Reddit username, not your email address.

## 🎯 Usage

The plugin provides a comprehensive set of commands for Reddit interaction:

### Basic Usage

```bash
# Via shell wrapper (recommended)
./reddit <command> [arguments]

# Direct invocation  
npx ts-node cli.ts <command> [arguments]
```

## 📚 Commands

### Content Creation

#### Post to Subreddit
```bash
# Text post
reddit post "programming" "My coding journey" "Just wanted to share my experience learning Python..."

# Link post with flair
reddit post "technology" "AI Breakthrough" "https://example.com/ai-news" "News"
```

#### Comment and Reply
```bash
# Comment on a post
reddit comment "t3_abc123" "Great article! Thanks for sharing."

# Reply to a comment
reddit reply "t1_def456" "I completely agree with your analysis."
```

### Voting and Interactions

```bash
# Vote on content
reddit upvote "t3_abc123"
reddit downvote "t1_def456" 

# Save content for later
reddit save "t3_abc123"
```

### Content Management

```bash
# Edit your own posts/comments
reddit edit "t3_abc123" "Updated content with corrections..."

# Delete your own content
reddit delete "t1_def456"
```

### Discovery and Search

```bash
# Search across all of Reddit
reddit search "machine learning"

# Search within specific subreddit
reddit search "python tips" "programming" "top" "week"

# Browse subreddit content
reddit subreddit-hot "technology" 25
reddit subreddit-new "programming" 10
reddit subreddit-top "artificial" "month" 50
```

### Multi-Subreddit Browsing

```bash
# Get posts from multiple subreddits at once
reddit multireddit "programming,webdev,javascript" 30
```

### User Information

```bash
# Get user profile (defaults to your own)
reddit user-profile
reddit user-profile "spez"

# Get user's posts and comments
reddit user-posts "gallowboob" 25
reddit user-comments "AutoModerator" 10
```

### Messaging

```bash
# Check your inbox
reddit inbox

# Send a private message
reddit message-send "username" "Subject Here" "Message body content..."
```

### Account Analytics

```bash
# Get karma breakdown by subreddit
reddit karma
```

### Community Management

```bash
# Manage subscriptions
reddit subscribe "artificial"
reddit unsubscribe "funny"

# List available post flairs
reddit flair-list "programming"
```

## 📊 Example Output

All commands return structured JSON for easy parsing and automation:

```json
{
  "success": true,
  "post_id": "abc123",
  "url": "https://reddit.com/r/programming/comments/abc123/my_first_react_app/",
  "permalink": "https://reddit.com/r/programming/comments/abc123/my_first_react_app/",
  "message": "Posted to r/programming"
}
```

```json
{
  "query": "python machine learning",
  "subreddit": "all", 
  "total_results": 25,
  "posts": [
    {
      "id": "abc123",
      "title": "Best Python ML Libraries in 2024",
      "subreddit": "MachineLearning",
      "score": 1337,
      "num_comments": 89,
      "url": "https://reddit.com/r/MachineLearning/comments/abc123/...",
      "permalink": "https://reddit.com/r/MachineLearning/comments/abc123/...",
      "created_utc": 1641234567,
      "author": "ml_expert"
    }
  ]
}
```

## 🔄 Common Workflows

### Daily Reddit Management
```bash
# Morning routine
reddit inbox                           # Check messages
reddit subreddit-hot "programming" 10  # Browse favorite subs
reddit karma                          # Check karma growth

# Evening engagement  
reddit search "interesting topics" "" "top" "day"
reddit comment "t3_abc123" "Great insights!"
```

### Content Publishing
```bash
# Research phase
reddit search "topic keywords" "target_subreddit"
reddit flair-list "target_subreddit"

# Publishing
reddit post "target_subreddit" "Post Title" "Content or URL" "Appropriate Flair"

# Follow-up engagement
reddit user-posts  # Check your recent posts for comments
```

### Community Research
```bash
# Multi-community discovery
reddit multireddit "programming,webdev,javascript,reactjs"

# User research
reddit user-profile "influential_user"
reddit user-posts "influential_user" 50
reddit user-comments "influential_user" 50
```

## 🛡️ Security Features

- **Environment Variable Configuration** - Credentials never hardcoded
- **OAuth2 Token Management** - Automatic token refresh and secure storage
- **Rate Limit Compliance** - Built-in respect for Reddit's API limits
- **Proper User-Agent** - Identifies as `openclaw-reddit-plugin/1.0.0`
- **HTTPS Only** - All API communications encrypted

## ⚠️ Rate Limiting

Reddit enforces strict rate limits:
- **60 requests per minute** for OAuth applications
- **1 request per second** recommended for sustained usage
- The plugin handles rate limiting gracefully with informative error messages

## 🐛 Troubleshooting

### Authentication Issues
```bash
# Verify environment variables
echo $REDDIT_CLIENT_ID
echo $REDDIT_USERNAME

# Common fixes:
# - Use username, not email address
# - Ensure app type is "script" 
# - Double-check client ID and secret
```

### API Errors
- **429 Too Many Requests**: Wait 60 seconds between heavy operations
- **403 Forbidden**: Check if you have permission to post in target subreddit
- **401 Unauthorized**: Verify credentials and app configuration

### Thing ID Format
- Posts: `t3_abc123`
- Comments: `t1_def456`  
- Users: `t2_user123`
- Messages: `t4_msg789`

## 🔧 Advanced Configuration

### Custom User-Agent
The plugin automatically uses `openclaw-reddit-plugin/1.0.0 by ${REDDIT_USERNAME}` as required by Reddit's API terms.

### Environment File Location
By default, the plugin looks for environment variables in `/root/.openclaw/.env`. This can be customized by modifying the dotenv config path in `cli.ts`.

## 📈 Integration with OpenClaw

This plugin integrates seamlessly with OpenClaw's skill system:

- **Automatic Discovery** - OpenClaw recognizes the plugin via `SKILL.md`
- **JSON Output** - All responses are structured for easy parsing
- **Error Handling** - Consistent error formatting for automation
- **Shell Wrapper** - Simple command execution via the `reddit` wrapper script

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`  
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Reddit API team for comprehensive documentation
- OpenClaw community for plugin architecture
- TypeScript and Node.js communities for excellent tooling

## 🚀 Deploy with PinchKit

Ready to automate your Reddit presence? Deploy this plugin instantly:

[![Deploy to PinchKit](https://img.shields.io/badge/Deploy%20to-PinchKit-blueviolet?style=for-the-badge&logo=rocket)](https://pinchkit.com/deploy?repo=jugs-eth/reddit-plugin&utm_source=github&utm_medium=readme&utm_campaign=reddit)

PinchKit handles all the setup complexity, so you can start managing Reddit from the command line in minutes, not hours.

---

**Made with ❤️ for the OpenClaw community**
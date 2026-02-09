# Reddit CLI Plugin Setup Guide

Complete step-by-step instructions for setting up the OpenClaw Reddit CLI plugin.

## Prerequisites

- ✅ A Reddit account
- ✅ Node.js 18.0.0 or higher installed
- ✅ OpenClaw running on your system

## Step 1: Create a Reddit App

### 1.1 Navigate to Reddit Apps Page

Go to: [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)

You'll need to be logged into your Reddit account.

### 1.2 Create New App

1. Click **"Create App"** or **"Create Another App"** button
2. Fill out the form with these details:

   - **Name**: `openclaw-reddit-plugin` (or any descriptive name)
   - **App type**: **⚠️ IMPORTANT: Select "script" ⚠️**
   - **Description**: `OpenClaw Reddit automation plugin`
   - **About URL**: Leave blank (optional)
   - **Redirect URI**: `http://localhost:8080` (required but not used)

3. Click **"Create app"** button

### 1.3 Record Your Credentials

After creating the app, you'll see:

```
📱 openclaw-reddit-plugin
   personal use script
   by /u/yourusername
   
   abc123defg456    ← This is your CLIENT_ID
   
   edit   delete
   
   secret: xyz789secretkey123456    ← This is your CLIENT_SECRET
```

**Important Notes:**
- **Client ID**: The short string directly under your app name (e.g., `abc123defg456`)
- **Client Secret**: The longer string after "secret:" (e.g., `xyz789secretkey123456`)
- **App Type**: Must be "script" for password-based authentication

## Step 2: Configure Environment Variables

### 2.1 Open Your Environment File

```bash
nano /root/.openclaw/.env
```

### 2.2 Add Reddit Configuration

Add these four lines to your `.env` file:

```bash
# Reddit API Configuration
REDDIT_CLIENT_ID=abc123defg456
REDDIT_CLIENT_SECRET=xyz789secretkey123456
REDDIT_USERNAME=yourusername
REDDIT_PASSWORD=yourpassword
```

**⚠️ Critical Requirements:**
- Use your **Reddit username**, NOT your email address
- Use your actual **Reddit password** (the same one you use to log into reddit.com)
- Replace the example values with your actual credentials from Step 1.3

### 2.3 Save and Exit

```bash
# In nano: Ctrl+X, then Y, then Enter
# Or in vim: :wq
```

### 2.4 Verify Environment Variables

```bash
# Test that variables are loaded (should show your values)
source /root/.openclaw/.env
echo "Client ID: $REDDIT_CLIENT_ID"
echo "Username: $REDDIT_USERNAME"
```

## Step 3: Install Plugin Dependencies

### 3.1 Navigate to Plugin Directory

```bash
cd /root/.openclaw/workspace/skills/reddit/
```

### 3.2 Install Node.js Dependencies

```bash
npm install
```

Expected output:
```
added XX packages, and audited XX packages in Xs
found 0 vulnerabilities
```

### 3.3 Verify TypeScript Compilation

```bash
npx tsc --noEmit
```

If successful, you should see no output. If there are errors, check that all dependencies installed correctly.

## Step 4: Test the Installation

### 4.1 Test Authentication

```bash
# Test basic authentication and get your karma
./reddit karma
```

Expected output (example):
```json
{
  "total_comment_karma": 1234,
  "total_link_karma": 567,
  "total_karma": 1801,
  "karma_breakdown": [
    {
      "subreddit": "programming",
      "comment_karma": 500,
      "link_karma": 100
    }
  ]
}
```

### 4.2 Test Basic Commands

```bash
# Get your user profile
./reddit user-profile

# Check your inbox
./reddit inbox

# Search for posts
./reddit search "test" "programming"
```

### 4.3 Verify Shell Wrapper

```bash
# Make sure the wrapper is executable
chmod +x reddit

# Test direct execution
ls -la reddit
# Should show: -rwxr-xr-x ... reddit
```

## Step 5: Common Setup Issues

### Issue 1: "Authentication failed: 401"

**Cause**: Incorrect credentials or app configuration

**Solutions**:
1. Double-check your Reddit username and password
2. Verify you're using username (not email)  
3. Ensure app type is "script" (not web app or personal use)
4. Check that CLIENT_ID and CLIENT_SECRET are correct
5. Try logging into reddit.com with the same credentials to verify

### Issue 2: "CLIENT_ID environment variable required"

**Cause**: Environment variables not loaded

**Solutions**:
1. Check `/root/.openclaw/.env` file exists and contains the variables
2. Restart your terminal session
3. Manually source the environment: `source /root/.openclaw/.env`

### Issue 3: "npm install" fails

**Cause**: Node.js version or network issues

**Solutions**:
1. Verify Node.js version: `node --version` (should be ≥18.0.0)
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and `package-lock.json`, then retry
4. Check internet connection and npm registry access

### Issue 4: TypeScript compilation errors

**Cause**: Missing dependencies or version mismatches

**Solutions**:
1. Ensure all dependencies installed: `npm install`
2. Update TypeScript: `npm install typescript@latest`
3. Check Node.js version compatibility

### Issue 5: "Too Many Requests" (429 error)

**Cause**: Rate limiting from Reddit API

**Solutions**:
1. Wait 60 seconds before retrying
2. Reduce frequency of API calls
3. This is normal Reddit behavior - the plugin handles it gracefully

## Step 6: Advanced Configuration

### 6.1 Custom User-Agent

The plugin automatically sets the User-Agent to:
```
openclaw-reddit-plugin/1.0.0 by ${REDDIT_USERNAME}
```

This is required by Reddit's API terms and should not be changed.

### 6.2 Alternative Environment File Location

If you need to use a different environment file location, modify line 4 in `cli.ts`:

```typescript
config({ path: '/path/to/your/.env' });
```

### 6.3 Enabling Debug Mode

For troubleshooting, you can add debug logging by setting:

```bash
export DEBUG=1
```

## Step 7: Integration with OpenClaw

### 7.1 Verify Skill Registration

OpenClaw should automatically detect the plugin via the `SKILL.md` file.

```bash
# From OpenClaw interface, the skill should appear in available tools
```

### 7.2 Test Integration

Try using the plugin through OpenClaw's interface to ensure proper integration.

## Step 8: Security Best Practices

### 8.1 Environment File Permissions

```bash
# Ensure only you can read the environment file
chmod 600 /root/.openclaw/.env
```

### 8.2 Regular Credential Rotation

Consider periodically:
1. Creating new Reddit apps with fresh credentials
2. Updating your Reddit password
3. Revoking old app permissions

### 8.3 Backup Configuration

```bash
# Backup your working configuration
cp /root/.openclaw/.env /root/.openclaw/.env.backup
```

## Next Steps

🎉 **Congratulations!** Your Reddit CLI plugin is now set up and ready to use.

**Try these commands to get started:**
```bash
# Check your profile
./reddit user-profile

# Browse your favorite subreddit
./reddit subreddit-hot "programming" 10

# Search for interesting content
./reddit search "machine learning"

# Check your karma stats
./reddit karma
```

**Explore the full command list:**
```bash
./reddit --help
```

## Support

If you encounter issues not covered in this guide:

1. **Check the logs** - Error messages are returned as JSON for easy debugging
2. **Verify prerequisites** - Ensure Node.js, Reddit account, and OpenClaw are all working
3. **Test manually** - Try logging into reddit.com with your credentials
4. **Check Reddit status** - Visit [redditstatus.com](https://redditstatus.com) for API issues
5. **Review Reddit API docs** - [reddit.com/dev/api](https://www.reddit.com/dev/api/) for additional context

Remember: The Reddit API has rate limits, so if you encounter 429 errors, simply wait a minute before retrying.
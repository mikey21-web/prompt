# PromptForge Discord Bot

Slash commands for PromptForge in any Discord server.

## Commands

| Command | Description |
|---|---|
| `/forge <input> [target]` | Translate plain English to model-native prompt |
| `/showdown <input>` | Same input, 4 flagship models side by side |
| `/reverse <prompt>` | Reverse-engineer a prompt to plain English |

## Setup

### 1. Create a Discord application

1. Go to https://discord.com/developers/applications
2. Click **New Application** → name it **PromptForge**
3. Go to **Bot** → **Add Bot** → copy the **Token**
4. Go to **OAuth2** → copy the **Client ID**

### 2. Set environment variables

```bash
export DISCORD_TOKEN=your_bot_token
export DISCORD_CLIENT_ID=your_client_id
export PROMPTFORGE_API_KEY=pf_xxxx   # from promptforge.dev/settings
```

### 3. Register slash commands (once)

```bash
npm run register
```

### 4. Start the bot

```bash
npm start
```

### 5. Invite to your server

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2048&scope=bot+applications.commands
```

## Deploy to Railway / Fly.io

```bash
# Railway
railway up

# Fly.io
fly launch
fly secrets set DISCORD_TOKEN=... DISCORD_CLIENT_ID=... PROMPTFORGE_API_KEY=...
fly deploy
```

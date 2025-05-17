# MEMEX Rewards Bot

A Telegram bot for MEMEX token rewards and airdrops, built with Node.js and Express.

## Features

- Telegram bot integration
- Task completion system
- Referral tracking
- Wallet integration
- User statistics
- Withdrawal management

## Setup on Replit

1. Fork this repository to your GitHub account
2. Create a new Repl on Replit and import from your GitHub repository
3. Add the following secrets in your Repl's "Secrets" tab:
   - `BOT_TOKEN`: Your Telegram bot token
   - `BOT_USERNAME`: Your bot's username
   - `PORT`: Port number (default: 3000)

4. Install dependencies by clicking "Run" or running this in the Replit shell:
```bash
npm install
```

## Environment Setup

Create a `.env` file with:

```env
BOT_TOKEN=your_telegram_bot_token
BOT_USERNAME=your_bot_username
PORT=3000
```

## Running the Project

The project will automatically start when you click "Run" on Replit.

To keep your bot running 24/7:
1. Set up UptimeRobot to ping your Replit URL
2. Use the URL provided by Replit in the format: `https://your-repl-name.your-username.repl.co`

## Project Structure

```
├── public/
│   ├── data/         # JSON data files
│   ├── js/          # Client-side JavaScript
│   └── styles.css   # Styles
├── src/
│   ├── config/      # Configuration files
│   ├── middleware/  # Express middleware
│   ├── routes/      # API routes
│   └── services/    # Business logic
├── .env             # Environment variables
└── server.js        # Main application file
```

## License

MIT License

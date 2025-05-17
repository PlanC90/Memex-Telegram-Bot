import express from 'express';
import { Telegraf } from 'telegraf';
import './services/withdrawalCheckService.js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(express.static('public'));

let bot = null;
let isShuttingDown = false;

const stopBot = async () => {
  if (bot && !isShuttingDown) {
    isShuttingDown = true;
    try {
      console.log('Stopping bot...');
      await bot.telegram.close();
      await bot.stop();
      bot = null;
    } catch (err) {
      console.error('Error stopping bot:', err);
    }
    isShuttingDown = false;
  }
};

const initBot = async () => {
  if (!process.env.BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not set');
  }

  await stopBot();

  // Wait for cleanup
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    console.log('Starting new bot instance...');
    bot = new Telegraf(process.env.BOT_TOKEN);

    // Delete webhook with dropping pending updates
    await bot.telegram.deleteWebhook({ 
      drop_pending_updates: true,
      timeout: 60000
    });

    bot.command('start', (ctx) => {
      const username = ctx.from.username || ctx.from.first_name || "guest";
      const userId = ctx.from.id;
      const gameUrl = `https://t.me/mmx_memex_bot/mmx_memex?username=${username}&id=${userId}`;
      
      return ctx.replyWithPhoto("https://cdn.glitch.global/41b9d177-2df3-49bd-8ecc-057b6d9aa045/1.jpg", {
        caption: `Welcome to MEMEX Airdrop, @${username}! 🎮\n\n` +
                `🌟 **Join the airdrop and earn your first rewards!**\n` +
                `✅ **Complete simple tasks and withdraw your earnings directly to your wallet!**\n` +
                `🚀 Powered by **Electra Protocol**, ensuring the lowest fees, fastest transactions, and ultimate security!`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "🟩 Claim Your Airdrop", url: gameUrl }]]
        }
      });
    });

    // Error handler
    bot.catch((err, ctx) => {
      console.error('Bot error:', err);
      if (err.code === 409) {
        console.log('Conflict detected, restarting bot...');
        setTimeout(() => initBot(), 10000);
      }
    });

    await bot.launch({
      dropPendingUpdates: true,
      polling: {
        timeout: 30,
        limit: 100
      }
    });

    console.log('Bot successfully started');

  } catch (error) {
    console.error('Bot initialization error:', error);
    if (error.code === 409) {
      console.log('Conflict detected, retrying in 10s...');
      setTimeout(() => initBot(), 10000);
    }
  }
};

// Start server and bot
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on port ${PORT}`);
  await initBot();
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down...');
  await stopBot();
  server.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception:', err);
  await shutdown();
});

// Keep existing routes and other code...

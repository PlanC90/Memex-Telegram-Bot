const { Telegraf } = require('telegraf');

class BotService {
  constructor() {
    this.bot = null;
    this.isRunning = false;
  }

  async cleanup() {
    if (this.bot) {
      try {
        this.isRunning = false;
        await this.bot.telegram.deleteWebhook({ drop_pending_updates: true });
        await this.bot.stop();
        this.bot = null;
        console.log('Bot temizlendi');
      } catch (error) {
        console.error('Bot temizleme hatası:', error);
      }
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('Bot zaten çalışıyor');
      return;
    }

    try {
      await this.cleanup();
      await new Promise(resolve => setTimeout(resolve, 5000));

      this.bot = new Telegraf(process.env.BOT_TOKEN);
      
      await this.bot.telegram.deleteWebhook({
        drop_pending_updates: true
      });

      this.setupHandlers();

      await this.bot.launch({
        dropPendingUpdates: true,
        polling: {
          timeout: 30,
          limit: 100,
          allowed_updates: ['message', 'callback_query']
        }
      });

      this.isRunning = true;
      console.log('Bot başarıyla başlatıldı');

    } catch (error) {
      console.error('Bot başlatma hatası:', error);
      this.isRunning = false;
      throw error;
    }
  }

  setupHandlers() {
    this.bot.catch((err) => {
      console.error('Bot hatası:', err);
    });

    process.once('SIGINT', () => this.cleanup());
    process.once('SIGTERM', () => this.cleanup());
  }
}

module.exports = new BotService();

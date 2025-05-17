const { app, bot } = require('./server');

const PORT = process.env.PORT || 3000;

const startServer = () => {
    // Graceful shutdown
    let botInstance = null;
    try {
        botInstance = bot.launch();
    } catch (error) {
        console.error('Bot launch error:', error);
        // Retry launch after delay if there's a conflict
        if (error.code === 409) {
            setTimeout(() => {
                botInstance = bot.launch();
            }, 5000);
        }
    }

    server.on('error', (error) => {
        console.error('Server error:', error);
        server.close(() => {
            console.log('Server closed. Restarting...');
            setTimeout(startServer, 4000);
        });
    });

    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
        server.close(() => {
            console.log('Server closed. Restarting...');
            setTimeout(startServer, 4000);
        });
    });

    process.once('SIGINT', () => {
        if (botInstance) botInstance.stop('SIGINT');
        server.close();
    });
        
    process.once('SIGTERM', () => {
        if (botInstance) botInstance.stop('SIGTERM');
        server.close();
    });

} catch (error) {
    console.error('Failed to start server:', error);
    setTimeout(startServer, 4000);
}
};

startServer();

module.exports = { startServer };

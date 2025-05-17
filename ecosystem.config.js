module.exports = {
  apps: [{
    name: 'memex-bot',
    script: 'server.js', 
    watch: true,
    max_memory_restart: '1G',
    exp_backoff_restart_delay: 100,
    autorestart: true,
    restart_delay: 4000,
    max_restarts: 10,
    env: {
      NODE_ENV: 'production'
    }
  }]
}

module.exports = {
  apps: [{
    name: 'jebediah-bot',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    // Configuración específica para bot de música
    kill_timeout: 5000,
    listen_timeout: 3000,
    // Logs
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Reinicio automático en caso de errores
    max_restarts: 10,
    min_uptime: '10s'
  }]
}; 
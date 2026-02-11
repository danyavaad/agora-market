module.exports = {
  apps: [
    {
      name: 'huertify-frontend',
      cwd: '/home/dan/huertify/frontend',
      script: 'node',
      args: '.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '127.0.0.1',
        NITRO_PORT: 3000,
        NITRO_HOST: '127.0.0.1'
      },
      error_file: '/home/dan/huertify/logs/frontend-error.log',
      out_file: '/home/dan/huertify/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'huertify-backend',
      cwd: '/home/dan/huertify/backend',
      script: 'dist/src/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        ADDRESS: '127.0.0.1',
        DATABASE_URL: 'postgresql://dbsudoluxgarden:luxgardentestpwd@localhost:5433/huertify'
      },
      error_file: '/home/dan/huertify/logs/backend-error.log',
      out_file: '/home/dan/huertify/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};

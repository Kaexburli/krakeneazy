/* eslint-disable no-multi-str */
const path = require('path')

module.exports = {
  apps: [
    {
      name: 'SERVER',
      cwd: path.join(__dirname, 'backend'),
      script: 'server.js',
      interpreter: 'node',
      interpreter_args: '--es-module-specifier-resolution=node',
      watch: false,
      max_memory_restart: '3G',
      log: '/home/websitedev/krakeneazy.com/_log/app/pm2/backend.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      disable_logs: false,
      merge_logs: false,
      env: require('dotenv').config({ path: path.resolve('.env') }).parsed
    },
    {
      name: 'CLIENT',
      cwd: path.join(__dirname, 'frontend'),
      script: 'npm',
      args: 'start',
      interpreter: 'node',
      interpreter_args: '--es-module-specifier-resolution=node',
      watch: false,
      max_memory_restart: '3G',
      log: '/home/websitedev/krakeneazy.com/_log/app/pm2/frontend.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      disable_logs: false,
      merge_logs: false,
      env: {
        NODE_ENV: 'production',
        COMMON_ENV_VAR: true,
        PORT: 5000
      }
    },
    {
      name: 'staging-server',
      cwd: path.join(__dirname, 'backend'),
      script: 'server.js',
      interpreter: 'node',
      interpreter_args: '--es-module-specifier-resolution=node',
      watch: true,
      max_memory_restart: '1G',
      log: '/home/websitedev/krakeneazy.com/_log/staging/pm2/backend.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      disable_logs: false,
      merge_logs: false,
      env: require('dotenv').config({ path: path.resolve('.env') }).parsed
    },
    {
      name: 'staging-client',
      cwd: path.join(__dirname, 'frontend'),
      script: 'npm',
      args: 'run staging',
      interpreter: 'node',
      interpreter_args: '--es-module-specifier-resolution=node',
      watch: true,
      max_memory_restart: '1G',
      log: '/home/websitedev/krakeneazy.com/_log/staging/pm2/frontend.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      disable_logs: false,
      merge_logs: false,
      env: {
        COMMON_ENV_VAR: true,
        NODE_ENV: 'production',
        ENVIRONMENT: 'production',
        SITE_NAME: 'Krakeneazy'
      }
    }
  ],
  deploy: {
    staging: {
      user: 'websitedev',
      host: ['212.227.212.129'],
      ssh_options: 'StrictHostKeyChecking=no',
      ref: 'origin/develop',
      repo: 'git@github.com:Kaexburli/krakeneazy.git',
      path: '/home/websitedev/krakeneazy.com/staging/deploy',
      'pre-setup':
        "echo --- ROOT; \
        pm2 flush staging-server; \
        pm2 flush staging-client; \
        pm2 delete staging-server; \
        pm2 delete staging-client; \
        cd krakeneazy.com/; \
        rm -vf _log/staging/nginx/access.log; \
        rm -vf _log/staging/nginx/error.log; \
        touch _log/staging/nginx/access.log; \
        touch _log/staging/nginx/error.log; \
        rm -vf _log/staging/pm2/*; \
        rm -vf _log/staging/pm2/*; \
        cd staging/; \
        rm -rf deploy; \
        rm -rf backend; \
        rm -rf frontend; \
        rm -rf node_modules; \
        rm -rf export; \
        rm -rf _error_pages; \
        rm !('.env'|'smtp.env.mjs'|'package.json'); \
        mkdir deploy;",
      'post-setup':
        "echo --- ROOT; \
        cd ../../; \
        mv deploy/current/* ./; \
        npm install; \
        npm outdated; \
        echo --- BACKEND; \
        cd backend; \
        npm install; \
        npm outdated; \
        echo --- FRONTEND; \
        cd ../frontend; \
        npm install; \
        npm outdated; \
        npm run build; \
        echo --- MONGO; \
        echo '`db.dropDatabase()`' | mongo krakeneazy_staging; \
        echo --- PM2; \
        cd ../; \
        pm2 startOrRestart ecosystem.config.js --only 'staging-server,staging-client';"
    },
    production: {
      user: 'websitedev',
      host: ['212.227.212.129'],
      ssh_options: 'StrictHostKeyChecking=no',
      ref: 'origin/main',
      repo: 'git@github.com:Kaexburli/krakeneazy.git',
      path: '/home/websitedev/krakeneazy.com/app/deploy',
      'pre-setup':
        "echo --- ROOT; \
        cd krakeneazy.com/; \
        rm -rf _error_pages; \
        echo --- APP; \
        cd app/; \
        rm -rf deploy; \
        rm -rf backend; \
        rm -rf frontend; \
        rm -rf node_modules; \
        rm !('.env'|'smtp.env.mjs'); \
        mkdir deploy;",
      'post-setup':
        "echo --- ROOT; \
        cd ../../; \
        mv deploy/current/* ./; \
        npm install; \
        npm outdated; \
        mv _error_pages ../; \
        rm !('.env'|'smtp.env.mjs'|'ecosystem.config.js'|'backend'|'frontend'|'deploy'|'package.json'); \
        echo --- BACKEND; \
        cd backend; \
        npm install; \
        npm outdated; \
        echo --- FRONTEND; \
        cd ../frontend; \
        npm install; \
        npm outdated; \
        npm run build; \
        rm -rf src; \
        echo --- PM2; \
        cd ../; \
        rm -rf deploy; \
        pm2 flush SERVER; \
        pm2 flush CLIENT; \
        pm2 startOrRestart ecosystem.config.js --only 'SERVER,CLIENT';"
    }
  }
}

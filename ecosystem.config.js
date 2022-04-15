const path = require('path')

module.exports = {
  apps: [{
      name: 'SERVER',
      cwd: `${__dirname}/backend`,
      script: 'server.js',
      interpreter: 'node',
      interpreter_args: '--es-module-specifier-resolution=node',
      watch: false,
      max_memory_restart: '3G',
      log: "/home/websitedev/krakeneazy.com/_log/app/pm2/backend.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      disable_logs: false,
      merge_logs: false,
      env: {
        NODE_ENV: 'production',
        ENVIRONMENT: 'production',
        BACK_PORT: 9000,
      }
    },
    {
      name: 'CLIENT',
      cwd: `${__dirname}/frontend`,
      script: 'npm',
      args: 'start',
      interpreter: 'node',
      interpreter_args: '--es-module-specifier-resolution=node',
      watch: false,
      max_memory_restart: '3G',
      log: "/home/websitedev/krakeneazy.com/_log/app/pm2/frontend.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      disable_logs: false,
      merge_logs: false,
      env: {
        NODE_ENV: 'production',
        COMMON_ENV_VAR: true,
        PORT: 5000,
      }
    },
    {
      name: 'PREPROD_SERVER',
      cwd: `${__dirname}/backend`,
      script: 'server.js',
      interpreter: 'node',
      interpreter_args: '--es-module-specifier-resolution=node',
      watch: false,
      max_memory_restart: '1G',
      log: "/home/websitedev/krakeneazy.com/_log/preprod/pm2/backend.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      disable_logs: false,
      merge_logs: false,
      env: require('dotenv').config({ path: path.resolve('.preprod.env') }).parsed
    },
    {
      name: 'PREPROD_CLIENT',
      cwd: `${__dirname}/frontend`,
      script: 'npm',
      args: 'run preprod',
      interpreter: 'node',
      interpreter_args: '--es-module-specifier-resolution=node',
      watch: false,
      max_memory_restart: '1G',
      log: "/home/websitedev/krakeneazy.com/_log/preprod/pm2/frontend.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      disable_logs: false,
      merge_logs: false,
      env: {
        COMMON_ENV_VAR: true,
        NODE_ENV: 'production',
        ENVIRONMENT: "production",
        SITE_NAME: "Krakeneazy",
      }
    },
  ],
  deploy: {
    preprod: {
      user: "websitedev",
      host: ["212.227.212.129"],
      ssh_options: "StrictHostKeyChecking=no",
      ref: "origin/develop",
      repo: "git@github.com:Kaexburli/krakeneazy.git",
      path: "/home/websitedev/krakeneazy.com/preprod/deploy",
      'pre-setup': "cd krakeneazy.com/preprod/; \
                    rm -rf deploy; \
                    rm -rf backend; \
                    rm -rf frontend; \
                    rm -rf _error_pages; \
                    rm -v !('.env'|'smtp.env.mjs'); \
                    mkdir deploy;",
      'post-setup': "cd ../../; \
                    mv deploy/current/* ./; \
                    cd backend; \
                    npm install; \
                    npm outdated; \
                    cd ../frontend; \
                    npm install; \
                    npm outdated; \
                    npm run build; \
                    cd ../; \
                    pm2 delete PREPROD_SERVER; \
                    pm2 delete PREPROD_CLIENT; \
                    pm2 startOrRestart ecosystem.config.js --only 'PREPROD_SERVER,PREPROD_CLIENT';",
    },
    production: {
      user: "websitedev",
      host: ["212.227.212.129"],
      ssh_options: "StrictHostKeyChecking=no",
      ref: "origin/main",
      repo: "git@github.com:Kaexburli/krakeneazy.git",
      path: "/home/websitedev/krakeneazy.com/app/deploy",
      'pre-setup': "cd krakeneazy.com/; \
                    rm -rf _error_pages; \
                    cd app/; \
                    rm -rf deploy; \
                    rm -rf backend; \
                    rm -rf frontend; \
                    rm -v !('.env'|'smtp.env.mjs'); \
                    mkdir deploy;",
      'post-setup': "cd ../../; \
                    mv deploy/current/* ./; \
                    mv _error_pages ../; \
                    rm -v !('.env'|'smtp.env.mjs'|'ecosystem.config.js'|'backend'|'frontend'|'deploy'); \
                    cd backend; \
                    npm install; \
                    cd ../frontend; \
                    npm install; \
                    npm run build; \
                    rm -rf src; \
                    cd ../; \
                    rm -rf deploy; \
                    pm2 flush; \
                    pm2 startOrRestart ecosystem.config.js --only 'SERVER,CLIENT';",
    },
  }
};
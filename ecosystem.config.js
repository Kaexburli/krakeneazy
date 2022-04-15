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
      env: {
        BACK_PORT: 8000,
        COMMON_ENV_VAR: true,
        ENVIRONMENT: "production",
        NODE_ENV: 'production',
        FRONTEND_URI: "https://preprod.krakeneazy.com",
        MONGODB_URI: "mongodb://localhost:27017/krakeneazy_preprod",
        JWT_STANDARD_SECRET: "w^L/|sD@/BMKaWosSL.~4gmU(SXPmd",
        JWT_REFRESH_SECRET: "PC^e1%&U5R[oiCx([DvbDZ%gQg/^{i",
        SITE_NAME: "Krakeneazy",
        SITE_EMAIL: "krakeneazy@gmail.com",
        KRAKEN_STATUS_API_URL: "https://status.kraken.com/api/v2/summary.json",
        SMTP_HOST: "smtp-fr.securemail.pro",
        SMTP_SERVICE: "krakeneazy",
        SMTP_PORT: 465,
        SMTP_SECURE: true,
        SMTP_USER: "contact@krakeneazy.com",
        SMTP_PASS: "uVg&cB97-K@3vB_",
      }
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
      cd ../frontend; \
      npm install; \
      npm run build; \
      cd ../; \
      pm2 startOrRestart ecosystem.config.js --wait-ready --listen-timeout 10000 --only 'PREPROD_SERVER,PREPROD_CLIENT';",
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
      pm2 startOrRestart ecosystem.config.js --wait-ready --listen-timeout 10000 --only 'SERVER,CLIENT';",
    },
  }
};
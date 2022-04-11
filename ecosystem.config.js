module.exports = {
  apps: [
    {
      name: 'SERVER',
      cwd: `${__dirname}/backend`,
      script: 'server.js',
      interpreter: 'node',
      interpreter_args: '--es-module-specifier-resolution=node',
      watch: false,
      log: "/home/websitedev/krakeneazy.com/app/logs/pm2/backend.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      disable_logs: false,
      merge_logs: false,
      env: {
        NODE_ENV: 'production',
        PORT: 9000,
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
      log: "/home/websitedev/krakeneazy.com/app/logs/pm2/frontend.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      disable_logs: false,
      merge_logs: false,
      env: {
        NODE_ENV: 'production',
        COMMON_ENV_VAR: true,
        PORT: 5000,
      }
    },
  ],
  deploy: {
    production: {
      user: "websitedev",
      host: ["212.227.212.129"],
      ssh_options: "StrictHostKeyChecking=no",
      ref: "origin/develop",
      repo: "git@github.com:Kaexburli/krakeneazy.git",
      path: "/home/websitedev/krakeneazy.com/app/deploy",
      'pre-setup': "cd krakeneazy.com/app/; \
      rm -rf backend; \
      rm -rf frontend; \
      rm -rf deploy; \
      rm -rf logs; \
      rm -v !('.env'|'smtp.env.js'); \
      mkdir deploy; \
      mkdir logs; \
      mkdir logs/pm2;",
      'post-setup': "cd backend; \
      npm install; \
      cd ../frontend; \
      npm install; \
      npm run build; \
      rm -rf src; \
      cd ../../../; \
      mv deploy/current/* ./; \
      rm -v !('.env'|'smtp.env.js'|'ecosystem.config.js'|'backend'|'frontend'|'deploy'); \
      cp smtp.env.js.txt backend/smtp.env.js; \
      pm2 startOrRestart ecosystem.config.js;",
    },
  }
};
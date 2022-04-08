module.exports = {
  apps: [
    {
      name: 'SERVER',
      cwd: `${__dirname}/backend`,
      script: 'server.js',
      interpreter: 'node',
      interpreter_args: '--es-module-specifier-resolution=node',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 9000,
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'CLIENT',
      cwd: `${__dirname}/frontend`,
      script: 'C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js',
      args: 'start',
      interpreter: 'node',
      interpreter_args: '--es-module-specifier-resolution=node',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'development',
        // COMMON_ENV_VAR: true,
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
  deploy: {
    production: {
      key: "C:\\Users\\franc\\.ssh\\websitedev.pem",
      user: 'websitedev',
      host: '82.165.106.123',
      ref: 'origin/main',
      repo: 'git@github.com:Kaexburli/krakeneazy.git',
      path: '/var/www/krakeneazy.com/html/',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
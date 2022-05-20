const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.resolve('.env') })

module.exports = {
  apps: [
    {
      name: 'prod-server',
      cwd: path.join(__dirname, 'backend'),
      script: 'server.js',
      interpreter: 'node',
      interpreter_args: '--es-module-specifier-resolution=node',
      watch: false,
      max_memory_restart: '3G',
      log: process.env.DEPLOY_PROD_BACK_LOG_PATH,
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      disable_logs: false,
      merge_logs: false,
      env: require('dotenv').config({ path: path.resolve('.env') }).parsed
    },
    {
      name: 'prod-client',
      cwd: path.join(__dirname, 'frontend'),
      script: 'npm',
      args: 'start',
      interpreter: 'node',
      interpreter_args: '--es-module-specifier-resolution=node',
      watch: false,
      max_memory_restart: '3G',
      log: process.env.DEPLOY_PROD_FRONT_LOG_PATH,
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      disable_logs: false,
      merge_logs: false,
      env: {
        NODE_ENV: 'production',
        COMMON_ENV_VAR: true,
        PORT: 5000
      }
    }
  ]
}

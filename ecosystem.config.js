/* eslint-disable no-multi-str */
const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.resolve('.deploy.env') })
const command = require('./deploy.cmd.js')

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
    },
    {
      name: 'staging-server',
      cwd: path.join(__dirname, 'backend'),
      script: 'server.js',
      interpreter: 'node',
      interpreter_args: '--es-module-specifier-resolution=node',
      watch: true,
      max_memory_restart: '1G',
      log: process.env.DEPLOY_STAGING_BACK_LOG_PATH,
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
      log: process.env.DEPLOY_STAGING_FRONT_LOG_PATH,
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
      user: process.env.DEPLOY_USER,
      host: process.env.DEPLOY_HOST,
      ref: process.env.DEPLOY_STAGING_REPOS_REF,
      repo: process.env.DEPLOY_STAGING_REPOS_PATH,
      path: process.env.DEPLOY_STAGING_PATH,
      ssh_options: 'StrictHostKeyChecking=no',
      'pre-setup': command.staging.presetup,
      'post-setup': command.staging.postsetup
    },
    production: {
      user: process.env.DEPLOY_USER,
      host: process.env.DEPLOY_HOST,
      ref: process.env.DEPLOY_PROD_REPOS_REF,
      repo: process.env.DEPLOY_PROD_REPOS_PATH,
      path: process.env.DEPLOY_PROD_PATH,
      ssh_options: 'StrictHostKeyChecking=no',
      'pre-setup': command.production.presetup,
      'post-setup': command.production.postsetup
    }
  }
}

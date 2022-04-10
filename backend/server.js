// Require the framework and instantiate it
import path from 'path';
const __dirname = path.resolve(path.dirname(''));

import Fastify from 'fastify';
import FastifySwagger from 'fastify-swagger';
import FastifyEnv from 'fastify-env';
import FastifyCors from 'fastify-cors';
import FastifyWs from 'fastify-websocket';
import Autoload from 'fastify-autoload';
import FastifyAuth from 'fastify-auth';

import db from './api/config/index';

import env from 'dotenv';
env.config({ path: __dirname + "/../.env" });

const PORT = process.env.BACK_PORT || '9000'
const uri = process.env.MONGODB_URI;

const environment = process.env.ENVIRONMENT;
const levels = ["fatal", "error", "warn", "info", "debug", "trace"]
const fastify = Fastify({
  logger: {
    level: levels[2],
    prettyPrint:
      environment === 'development'
        ? {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
        : false
  }
})

const options = {
  schema: {
    type: 'object',
    properties: {
      API_KEY: { type: 'string' },
      API_PRIV: { type: 'string' }
    }
  },
  dotenv: true
}

fastify.register(FastifySwagger, {
  exposeRoute: true,
  routePrefix: '/docs',
  swagger: {
    info: { title: 'fastify-api' },
  },
})

fastify
  .register(db, { uri })
  .register(FastifyEnv, options)
  .register(FastifyCors)
  .register(FastifyWs)
  .register(FastifyAuth);


// Declare a route
fastify.get('/', async (request, reply) => {
  return { hello: 'Site under construction' }
})
fastify.register(Autoload, {
  dir: './api/routes/'
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen(PORT)
  } catch (err) {
    fastify.log.error(`[SERVER START ERROR]:${err}`)
    process.exit(1)
  }
}
start()

process.on('unhandledRejection', (reason, promise) => {
  if (typeof reason !== "undefined" && typeof promise !== "undefined") {
    console.log('[unhandledRejection]: reason is', reason);
    console.log('[unhandledRejection]: promise is', promise);
  }
});
// Require the framework and instantiate it
import * as fs from 'fs';
import path from 'path';
const __dirname = path.resolve(path.dirname(''));

import Fastify from 'fastify';
import FastifySwagger from 'fastify-swagger';
import FastifyEnv from 'fastify-env';
import FastifyCors from 'fastify-cors';
import FastifyWs from 'fastify-websocket';
import Autoload from 'fastify-autoload';
import FastifyAuth from 'fastify-auth';
import fastifyErrorPage from 'fastify-error-page';

import db from './api/config/index';

import env from 'dotenv';
env.config({ path: __dirname + "/../.env" });

const PORT = process.env.BACK_PORT || '9000'
const uri = process.env.MONGODB_URI;

const environment = process.env.ENVIRONMENT;
const levels = ["fatal", "error", "warn", "info", "debug", "trace"]
const fastify = Fastify({
  logger: {
    level: environment === 'development' ? levels[5] : levels[0],
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

// Page error 4xx et 5xx
if (environment === 'development') {
  fastify.register(fastifyErrorPage)
}
else {
  fastify.setErrorHandler((error, request, reply) => {
    var statusCode = reply.statusCode
    if (statusCode >= 500) {
      const pageNotFoundStream = fs.createReadStream('../../_error_pages/500.html')
      fastify.log.error(`[SERVER setErrorHandler ${statusCode}]:${error}`)
      reply.code(500).type('text/html').send(pageNotFoundStream)
    } else if (statusCode >= 400) {
      const pageNotFoundStream = fs.createReadStream('../../_error_pages/400.html')
      fastify.log.error(`[SERVER setErrorHandler ${statusCode}]:${error}`)
      reply.code(400).type('text/html').send(pageNotFoundStream)
    } else {
      const pageNotFoundStream = fs.createReadStream('../../_error_pages/maintenance.html')
      fastify.log.error(`[SERVER setErrorHandler]:${error}`)
      reply.code(404).type('text/html').send(pageNotFoundStream)
    }
  })
}

// Page 404 Not Found
fastify.setNotFoundHandler((request, reply) => {
  const pageNotFoundStream = fs.createReadStream('./public/404.html')
  reply.code(404).type('text/html').send(pageNotFoundStream)
})


// Declare a route
fastify.register(Autoload, {
  dir: './api/routes/'
})

// Run the server!
const start = async () => {
  try {
    fastify.listen(PORT, err => {

      if (err) throw err

      if (environment !== 'development') {
        console.log(
          'Server listenting on :',
          `http://${fastify.server.address().address}:${fastify.server.address().port}`
        )
      }

    })
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
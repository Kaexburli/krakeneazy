// Require the framework and instantiate it
import Fastify from 'fastify'
import FastifySwagger from 'fastify-swagger'
import FastifyEnv from 'fastify-env'
import FastifyCors from 'fastify-cors'
import FastifyWs from 'fastify-websocket'
import Autoload from 'fastify-autoload'

import db from './api/config/index';

import env from 'dotenv';
env.config();

const PORT = process.env.PORT || '9000'
const uri = process.env.MONGODB_URI;

const fastify = Fastify({ logger: { level: 'trace' } })

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

fastify.register(db, { uri });
fastify.register(FastifyEnv, options)
fastify.register(FastifyCors)
fastify.register(FastifyWs)


// Declare a route
fastify.get('/', async (request, reply) => {
  return { hello: 'KURLITRADE' }
})
fastify.register(Autoload, {
  dir: './api/routes/'
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen(PORT)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()

process.on('unhandledRejection', (reason, promise) => {
  console.log('reason is', reason);
  console.log('promise is', promise);
  // Application specific logging, throwing an error, or other logic here
});
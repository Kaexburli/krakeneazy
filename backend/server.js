// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import * as fs from 'fs'
import path from 'path'
import Fastify from 'fastify'
import FastifySwagger from '@fastify/swagger'
import FastifyEnv from '@fastify/env'
import FastifyCors from '@fastify/cors'
import FastifyWs from '@fastify/websocket'
import Autoload from '@fastify/autoload'
import FastifyAuth from '@fastify/auth'
import fastifyErrorPage from 'fastify-error-page'
import db from './api/config/index'
import env from 'dotenv'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
const __dirname = path.resolve(path.dirname(''))
env.config({ path: __dirname + '/../.env' })

const environment = process.env.ENVIRONMENT
const PORT = process.env.BACK_PORT || '9000'
const FASTIFY_URI = environment === 'development' ? '127.0.0.1' : '0.0.0.0'
const uri = process.env.MONGODB_URI
const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace']
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

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
fastify.register(FastifySwagger, {
  exposeRoute: true,
  routePrefix: '/docs',
  swagger: {
    info: { title: 'fastify-api' }
  }
})

fastify
  .register(db, { uri })
  .register(FastifyEnv, options)
  .register(FastifyCors)
  .register(FastifyAuth)
  .register(FastifyWs, {
    errorHandler: function (error, conn, req, _reply) {
      req.log.error({ error }, '[ERROR FastifyWs]')
      conn.destroy(error)
    },
    options: {
      maxPayload: 1048576,
      verifyClient: function (info, next) {
        if (!info.origin.includes(process.env.FRONTEND_URI)) {
          return next(false)
        }
        next(true)
      }
    }
  })

// Page error 4xx et 5xx
if (environment === 'development') {
  fastify.register(fastifyErrorPage)
} else {
  fastify.setErrorHandler((error, request, reply) => {
    const statusCode = reply.statusCode
    if (statusCode >= 500) {
      const pageNotFoundStream = fs.createReadStream(
        '../../_error_pages/500.html'
      )
      fastify.log.error(`[SERVER setErrorHandler ${statusCode}]:${error}`)
      reply.code(500).type('text/html').send(pageNotFoundStream)
    } else if (statusCode >= 400) {
      const pageNotFoundStream = fs.createReadStream(
        '../../_error_pages/400.html'
      )
      fastify.log.error(`[SERVER setErrorHandler ${statusCode}]:${error}`)
      reply.code(400).type('text/html').send(pageNotFoundStream)
    } else {
      const pageNotFoundStream = fs.createReadStream(
        '../../_error_pages/maintenance.html'
      )
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
    fastify.listen(PORT, FASTIFY_URI, (err) => {
      if (err) throw err
      else {
        console.log(
          'Server listenting on :',
          `http://${fastify.server.address().address}:${
            fastify.server.address().port
          }`
        )
      }

      if (environment === 'production') {
        setTimeout(() => {
          process.send('ready')
        }, 5000)
      }

      function cleanupAndExit () {
        fastify.close(() => {
          console.log('Server closed gracefull!!')
          process.exit(0)
        })
      }

      process.on('SIGTERM', cleanupAndExit)
      process.on('SIGINT', cleanupAndExit)
    })
  } catch (err) {
    fastify.log.error(`[SERVER START ERROR]:${err}`)
    process.exit(1)
  }
}
start()

process.on('unhandledRejection', (reason, promise) => {
  if (typeof reason !== 'undefined' && typeof promise !== 'undefined') {
    console.log('[unhandledRejection]: reason is', reason)
    console.log('[unhandledRejection]: promise is', promise)
  }
})

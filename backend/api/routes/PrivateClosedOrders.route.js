// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { asyncVerifyJWTCtrl } from '../controllers/private/users.controller.js'
import { getClosedOrders } from '../controllers/private/userdatas.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function PrivateClosedOrdersRoute (fastify, options, done) {
  fastify.decorate('asyncVerifyJWT', asyncVerifyJWTCtrl).after(() => {
    // Get Api ClosedOrders - private
    fastify.route({
      method: ['GET', 'HEAD'],
      url: '/api/private/closedorders',
      logLevel: 'warn',
      preHandler: fastify.auth([fastify.asyncVerifyJWT]),
      handler: getClosedOrders
    })

    fastify.route({
      method: ['GET', 'HEAD'],
      url: '/api/private/closedorders/:trades',
      logLevel: 'warn',
      preHandler: fastify.auth([fastify.asyncVerifyJWT]),
      handler: getClosedOrders
    })

    fastify.route({
      method: ['GET', 'HEAD'],
      url: '/api/private/closedorders/:trades/:ofs',
      logLevel: 'warn',
      preHandler: fastify.auth([fastify.asyncVerifyJWT]),
      handler: getClosedOrders
    })

    fastify.route({
      method: ['GET', 'HEAD'],
      url: '/api/private/closedorders/:trades/:ofs/:start',
      logLevel: 'warn',
      preHandler: fastify.auth([fastify.asyncVerifyJWT]),
      handler: getClosedOrders
    })

    fastify.route({
      method: ['GET', 'HEAD'],
      url: '/api/private/closedorders/:trades/:ofs/:start/:end',
      logLevel: 'warn',
      preHandler: fastify.auth([fastify.asyncVerifyJWT]),
      handler: getClosedOrders
    })

    fastify.route({
      method: ['GET', 'HEAD'],
      url: '/api/private/closedorders/:trades/:ofs/:start/:end/:userref',
      logLevel: 'warn',
      preHandler: fastify.auth([fastify.asyncVerifyJWT]),
      handler: getClosedOrders
    })

    fastify.route({
      method: ['GET', 'HEAD'],
      url: '/api/private/closedorders/:trades/:ofs/:start/:end/:userref/:closetime',
      logLevel: 'warn',
      preHandler: fastify.auth([fastify.asyncVerifyJWT]),
      handler: getClosedOrders
    })
  })

  done()
}

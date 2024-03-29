// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import {
  asyncVerifyJWTCtrl,
  websocketVerifyJWTCtrl
} from '../controllers/private/users.controller.js'
import {
  getOpenOrders,
  getWsOpenOrders
} from '../controllers/private/userdatas.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function PrivateOpenOrdersRoute (fastify, options, done) {
  fastify
    .decorate('asyncVerifyJWT', asyncVerifyJWTCtrl)
    .decorate('websocketVerifyJWT', websocketVerifyJWTCtrl)
    .after(() => {
      // Get Api OpenOrders - private
      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/private/openorders/:trades',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: getOpenOrders
      })

      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/private/openorders/:trades/:userref',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: getOpenOrders
      })

      // Get Api OpenOrders - Websocket
      fastify.route({
        method: 'GET',
        url: '/api/ws/openorders/:id',
        logLevel: 'warn',
        websocket: true,
        preHandler: fastify.auth([fastify.websocketVerifyJWT]),
        handler: getWsOpenOrders
      })
    })

  done()
}

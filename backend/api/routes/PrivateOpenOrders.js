import {
  asyncVerifyJWTCtrl,
  websocketVerifyJWTCtrl
} from '../controllers/private/userController.js'

import { getOpenOrders, getWsOpenOrders } from '../controllers/private/userdata.js'

export default function PrivateOpenOrdersRoute(fastify, options, done) {

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
      });

      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/private/openorders/:trades/:userref',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: getOpenOrders
      });

      // Get Api OpenOrders - Websocket
      fastify.route({
        method: 'GET',
        url: '/api/ws/openorders/:authorization',
        logLevel: 'warn',
        websocket: true,
        preHandler: fastify.auth([fastify.websocketVerifyJWT]),
        handler: getWsOpenOrders
      })

    });

  done()
}
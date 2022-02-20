import {
  asyncVerifyJWTCtrl,
  websocketVerifyJWTCtrl
} from '../controllers/private/userController.js'

import {
  getTradeBalance,
  getWsTradeBalance
} from '../controllers/private/userdata.js'

export default function PrivateTradeBalanceRoute(fastify, options, done) {

  fastify
    .decorate('asyncVerifyJWT', asyncVerifyJWTCtrl)
    .decorate('websocketVerifyJWT', websocketVerifyJWTCtrl)
    .after(() => {

      // Get Api TradeBalance - private
      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/private/tradebalance/:asset',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: getTradeBalance
      });

      // Get Api TradeBalance - Websocket
      fastify.route({
        method: 'GET',
        url: '/api/ws/tradebalance/:asset/:authorization',
        logLevel: 'warn',
        websocket: true,
        preHandler: fastify.auth([fastify.websocketVerifyJWT]),
        handler: getWsTradeBalance
      })

    });

  done()
}
import FastifyAuth from 'fastify-auth';
import {
  asyncVerifyJWTCtrl,
  asyncVerifyUsernameAndPasswordCtrl,
} from '../controllers/private/userController.js'

import { getTradeBalance, getWsTradeBalance } from '../controllers/private/userdata.js'

export default function PrivateTradeBalanceRoute(fastify, options, done) {

  fastify
    .decorate('asyncVerifyJWT', asyncVerifyJWTCtrl)
    .decorate('asyncVerifyUsernameAndPassword', asyncVerifyUsernameAndPasswordCtrl)
    .register(FastifyAuth)
    .after(() => {

      // Get Api TradeBalance - private
      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/private/tradebalance/:asset',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: getTradeBalance
      });

    });

  // Get Api OpenOrders - Websocket
  fastify.get('/api/ws/tradebalance/:asset', { websocket: true }, getWsTradeBalance)

  done()
}
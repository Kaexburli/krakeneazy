import FastifyAuth from 'fastify-auth';
import {
  asyncVerifyJWTCtrl,
  asyncVerifyUsernameAndPasswordCtrl,
} from '../controllers/private/userController.js'

import { getOpenOrders, getWsOpenOrders } from '../controllers/private/userdata.js'

export default function PrivateOpenOrdersRoute(fastify, options, done) {

  fastify
    .decorate('asyncVerifyJWT', asyncVerifyJWTCtrl)
    .decorate('asyncVerifyUsernameAndPassword', asyncVerifyUsernameAndPasswordCtrl)
    .register(FastifyAuth)
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
      fastify.get('/api/ws/openorders', { websocket: true }, getWsOpenOrders)

    });

  done()
}
import FastifyAuth from 'fastify-auth';
import {
  asyncVerifyJWTCtrl,
  asyncVerifyUsernameAndPasswordCtrl,
} from '../controllers/private/userController.js'

import { getTradesHistory } from '../controllers/private/userdata.js'

export default function PrivateTradesHistoryRoute(fastify, options, done) {

  fastify
    .decorate('asyncVerifyJWT', asyncVerifyJWTCtrl)
    .decorate('asyncVerifyUsernameAndPassword', asyncVerifyUsernameAndPasswordCtrl)
    .register(FastifyAuth)
    .after(() => {

      // Get Api TradesHistory - private
      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/private/tradeshistory',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: getTradesHistory
      });

    });

  done()
}
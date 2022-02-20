import {
  asyncVerifyJWTCtrl,
} from '../controllers/private/userController.js'

import { getBalance } from '../controllers/private/userdata.js'

export default function PrivateBalanceRoute(fastify, options, done) {

  fastify
    .decorate('asyncVerifyJWT', asyncVerifyJWTCtrl)
    .after(() => {

      // Get Api Balance - private
      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/private/balance',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: getBalance
      });

    });

  done()
}
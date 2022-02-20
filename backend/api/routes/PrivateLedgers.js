import {
  asyncVerifyJWTCtrl,
} from '../controllers/private/userController.js'

import { getLedgers } from '../controllers/private/userdata.js'

export default function PrivateLedgersRoute(fastify, options, done) {

  fastify
    .decorate('asyncVerifyJWT', asyncVerifyJWTCtrl)
    .after(() => {

      // Get Api Ledgers - private
      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/private/ledgers',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: getLedgers
      });

    });

  done()
}
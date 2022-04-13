import {
  asyncVerifyJWTCtrl,
} from '../controllers/private/users.controller.js'

import { getLedgers } from '../controllers/private/userdatas.controller.js'

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
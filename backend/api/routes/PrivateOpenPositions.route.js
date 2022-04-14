import {
  asyncVerifyJWTCtrl,
} from '../controllers/private/users.controller.js'

import { getOpenPositions } from '../controllers/private/userdatas.controller.js'

export default function PrivateOpenPositionsRoute(fastify, options, done) {

  fastify
    .decorate('asyncVerifyJWT', asyncVerifyJWTCtrl)
    .after(() => {

      // Get Api OpenPositions - private
      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/private/openpositions',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: getOpenPositions
      });

    });

  done()
}
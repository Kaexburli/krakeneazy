import {
  asyncVerifyJWTCtrl,
} from '../controllers/private/users.controller.js'

import { getTradeVolume } from '../controllers/private/userdatas.controller.js'

export default function PrivateTradeVolumeRoute(fastify, options, done) {

  fastify
    .decorate('asyncVerifyJWT', asyncVerifyJWTCtrl)
    .after(() => {

      // Get Api TradeVolume - private
      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/private/tradevolume/:pair',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: getTradeVolume
      });

    });

  done()
}
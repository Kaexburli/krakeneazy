import {
  asyncVerifyJWTCtrl,
  websocketVerifyJWTCtrl
} from '../controllers/private/userController.js'

import { AddOrder } from '../controllers/private/userdata.js'

export default function PrivateOrderRoute(fastify, options, done) {

  fastify
    .decorate('asyncVerifyJWT', asyncVerifyJWTCtrl)
    .decorate('websocketVerifyJWT', websocketVerifyJWTCtrl)
    .after(() => {

      // Get Api AddOrder
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/api/private/addorder',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: AddOrder
      })

    });

  done()
}
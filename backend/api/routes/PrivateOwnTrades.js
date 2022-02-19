import FastifyAuth from 'fastify-auth';
import {
  asyncVerifyJWTCtrl,
  asyncVerifyUsernameAndPasswordCtrl,
} from '../controllers/private/userController.js'

import { getWsOwnTrades } from '../controllers/private/userdata.js'

export default function PrivateOwnTradesRoute(fastify, options, done) {

  fastify
    .decorate('asyncVerifyJWT', asyncVerifyJWTCtrl)
    .decorate('asyncVerifyUsernameAndPassword', asyncVerifyUsernameAndPasswordCtrl)
    .register(FastifyAuth)
    .after(() => {

      // Get Api OwnTrades - Websocket
      fastify.get('/api/ws/owntrades', { websocket: true }, getWsOwnTrades)

    });

  done()
}
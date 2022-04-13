import {
  websocketVerifyJWTCtrl
} from '../controllers/private/users.controller.js'

import { getWsOwnTrades } from '../controllers/private/userdata.js'

export default function PrivateOwnTradesRoute(fastify, options, done) {

  fastify
    .decorate('websocketVerifyJWT', websocketVerifyJWTCtrl)
    .after(() => {

      // Get Api OwnTrades - Websocket
      fastify.route({
        method: 'GET',
        url: '/api/ws/owntrades/:authorization',
        logLevel: 'warn',
        websocket: true,
        preHandler: fastify.auth([fastify.websocketVerifyJWT]),
        handler: getWsOwnTrades
      })

    });

  done()
}
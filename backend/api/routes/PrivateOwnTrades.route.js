// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { websocketVerifyJWTCtrl } from '../controllers/private/users.controller.js'
import { getWsOwnTrades } from '../controllers/private/userdatas.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function PrivateOwnTradesRoute (fastify, _options, done) {
  fastify.decorate('websocketVerifyJWT', websocketVerifyJWTCtrl).after(() => {
    // Get Api OwnTrades - Websocket
    fastify.route({
      method: 'GET',
      url: '/api/ws/owntrades/:id',
      logLevel: 'warn',
      websocket: true,
      preHandler: fastify.auth([fastify.websocketVerifyJWT]),
      handler: getWsOwnTrades
    })
  })

  done()
}

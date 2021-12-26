import { getWsOwnTrades } from '../controllers/private/userdata.js'

export default function PrivateOwnTradesRoute(fastify, options, done) {

  // Get Api OwnTrades - Websocket
  fastify.get('/api/ws/owntrades', { websocket: true }, getWsOwnTrades)

  done()
}
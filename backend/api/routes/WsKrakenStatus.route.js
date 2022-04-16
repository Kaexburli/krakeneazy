// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { getWsKrakenStatus } from '../controllers/private/userdatas.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function WsKrakenStatusRoute (fastify, _options, done) {
  // Get KrakenStatus WS
  fastify.get('/api/ws/krakenstatus', { websocket: true }, getWsKrakenStatus)

  done()
}

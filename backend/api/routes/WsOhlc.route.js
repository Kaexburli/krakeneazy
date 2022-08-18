// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { GetOhlc } from '../controllers/wsohlc.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function WsOhlcRoute (fastify, _options, done) {
  // Get Ohlc WS
  fastify.get(
    '/api/ws/ohlc/:base/:quote/:interval',
    { websocket: true },
    GetOhlc
  )

  done()
}

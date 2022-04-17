// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { GetTicker } from '../controllers/wsticker.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function WsTickerRoute (fastify, _options, done) {
  // Get Ticker WS
  fastify.get('/api/ws/ticker/:base/:quote', { websocket: true }, GetTicker)

  done()
}

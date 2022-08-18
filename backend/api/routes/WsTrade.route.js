// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { GetTrade } from '../controllers/wstrade.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function WsTradeRoute (fastify, _options, done) {
  // Get Trades WS
  fastify.get('/api/ws/trade/:base/:quote', { websocket: true }, GetTrade)

  done()
}

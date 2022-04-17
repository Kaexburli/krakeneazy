// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { GetSpread } from '../controllers/wsspread.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function WsSpreadRoute (fastify, _options, done) {
  // Get Spread WS
  fastify.get('/api/ws/spread/:base/:quote', { websocket: true }, GetSpread)

  done()
}

// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { getTicker } from '../controllers/ticker.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
const TickerOpts = {
  handler: getTicker
}

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function TickerRoute (fastify, _options, done) {
  // Get Api Ticker
  fastify.get('/api/ticker/:pair', TickerOpts)

  done()
}

// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { getTrades } from '../controllers/trades.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
const TradesOpts = {
  handler: getTrades
}

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function TradesRoute (fastify, _options, done) {
  // Get Api Trades
  fastify.get('/api/trades/:pair', TradesOpts)

  done()
}

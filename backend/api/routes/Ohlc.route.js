// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { getOhlc } from '../controllers/ohlc.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
const OhlcOpts = {
  handler: getOhlc
}

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function OhlcRoute (fastify, options, done) {
  // Get Api System Status
  fastify.get('/api/ohlc/:pair/:interval', OhlcOpts)

  done()
}

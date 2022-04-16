// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { GetOrderBook } from '../controllers/wsorderbook.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function WsOrderBookRoute (fastify, _options, done) {
  // Get Ohlc WS
  fastify.get(
    '/api/ws/book/:base/:quote/:depth',
    { websocket: true },
    GetOrderBook
  )

  done()
}

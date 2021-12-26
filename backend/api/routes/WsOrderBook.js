import { GetOrderBook } from '../controllers/ws-order-book.js'

export default function WsOrderBookRoute(fastify, options, done) {
  // Get Ohlc
  fastify.get('/api/ws/book/:base/:quote/:depth', { websocket: true }, GetOrderBook)

  done()
}
import { GetOrderBook } from '../controllers/wsorderbook.controller.js'

export default function WsOrderBookRoute(fastify, options, done) {
  // Get Ohlc WS
  fastify.get('/api/ws/book/:base/:quote/:depth', { websocket: true }, GetOrderBook)

  done()
}
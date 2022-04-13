import { GetOhlc } from '../controllers/wsohlc.controller.js'

export default function WsOhlcRoute(fastify, options, done) {
  // Get Ohlc WS
  fastify.get('/api/ws/ohlc/:base/:quote/:interval', { websocket: true }, GetOhlc)

  done()
}
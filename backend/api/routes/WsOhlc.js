import { GetOhlc } from '../controllers/ws-ohlc.js'

export default function WsOhlcRoute(fastify, options, done) {
  // Get Ohlc
  fastify.get('/api/ws/ohlc/:base/:quote/:interval', { websocket: true }, GetOhlc)

  done()
}
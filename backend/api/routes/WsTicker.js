import { GetTicker } from '../controllers/ws-ticker.js'

export default function WsTickerRoute(fastify, options, done) {
  // Get Ticker
  fastify.get('/api/ws/ticker/:base/:quote', { websocket: true }, GetTicker)

  done()
}
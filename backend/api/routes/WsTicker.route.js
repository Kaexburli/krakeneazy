import { GetTicker } from '../controllers/wsticker.controller.js'

export default function WsTickerRoute(fastify, options, done) {
  // Get Ticker WS
  fastify.get('/api/ws/ticker/:base/:quote', { websocket: true }, GetTicker)

  done()
}
import { GetTrade } from '../controllers/ws-trade.js'

export default function WsTradeRoute(fastify, options, done) {
  // Get Trades WS
  fastify.get('/api/ws/trade/:base/:quote', { websocket: true }, GetTrade)

  done()
}
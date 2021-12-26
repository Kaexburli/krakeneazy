import { GetTrade } from '../controllers/ws-trade.js'

export default function WsTradeRoute(fastify, options, done) {
  // Get Trade
  fastify.get('/api/ws/trade/:base/:quote', { websocket: true }, GetTrade)

  done()
}
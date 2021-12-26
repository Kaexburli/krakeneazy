import { GetSpread } from '../controllers/ws-spread.js'

export default function WsSpreadRoute(fastify, options, done) {
  // Get Spread
  fastify.get('/api/ws/spread/:base/:quote', { websocket: true }, GetSpread)

  done()
}
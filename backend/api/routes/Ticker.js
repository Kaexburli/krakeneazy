import { getTicker } from '../controllers/ticker.js'

const TickerOpts = {
  handler: getTicker,
}

export default function TickerRoute(fastify, options, done) {
  // Get Api Ticker
  fastify.get('/api/ticker/:pair', TickerOpts)

  done()
}
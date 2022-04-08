import { getTrades } from '../controllers/trades.js'

const TradesOpts = {
  handler: getTrades,
}

export default function TradesRoute(fastify, options, done) {
  // Get Api Trades 
  fastify.get('/api/trades/:pair', TradesOpts)

  done()
}
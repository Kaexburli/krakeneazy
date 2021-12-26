import { getTradesHistory } from '../controllers/private/userdata.js'

const TradesHistoryOpts = {
  handler: getTradesHistory,
}

export default function PrivateTradesHistoryRoute(fastify, options, done) {
  // Get Api TradesHistory - private
  fastify.get('/api/private/tradeshistory', TradesHistoryOpts)

  done()
}
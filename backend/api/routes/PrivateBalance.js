import { getBalance } from '../controllers/private/userdata.js'

const BalanceOpts = {
  handler: getBalance,
}

export default function PrivateBalanceRoute(fastify, options, done) {
  // Get Api Balance - private
  fastify.get('/api/private/balance', BalanceOpts)

  done()
}
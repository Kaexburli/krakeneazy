import { getLedgers } from '../controllers/private/userdata.js'

const LedgersOpts = {
  handler: getLedgers,
}

export default function PrivateLedgersRoute(fastify, options, done) {
  // Get Api Ledgers - private
  fastify.get('/api/private/ledgers', LedgersOpts)

  done()
}
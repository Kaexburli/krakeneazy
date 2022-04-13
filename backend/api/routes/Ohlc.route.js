import { getOhlc } from '../controllers/ohlc.controller.js'

const OhlcOpts = {
  handler: getOhlc,
}

export default function OhlcRoute(fastify, options, done) {
  // Get Api System Status
  fastify.get('/api/ohlc/:pair/:interval', OhlcOpts)

  done()
}
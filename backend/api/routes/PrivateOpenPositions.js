import { getOpenPositions } from '../controllers/private/userdata.js'

const OpenPositionsOpts = {
  handler: getOpenPositions,
}

export default function PrivateOpenPositionsRoute(fastify, options, done) {
  // Get Api OpenPositions - private
  fastify.get('/api/private/openpositions', OpenPositionsOpts)

  done()
}
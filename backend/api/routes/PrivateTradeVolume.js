import { getTradeVolume } from '../controllers/private/userdata.js'

const TradeVolumeOpts = {
  handler: getTradeVolume,
}

export default function PrivateTradeVolumeRoute(fastify, options, done) {
  // Get Api TradeVolume - private
  fastify.get('/api/private/tradevolume/:pair', TradeVolumeOpts)

  done()
}
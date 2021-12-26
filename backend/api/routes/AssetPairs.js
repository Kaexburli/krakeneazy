import { getAssetPairs } from '../controllers/assetpairs.js'

const AssetPairOpts = {
  handler: getAssetPairs,
}

export default function AssetPairsRoute(fastify, options, done) {
  // Get Api System Status
  fastify.get('/api/assetpairs', AssetPairOpts)

  done()
}
// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { getAssetPairs } from '../controllers/assetpairs.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
const AssetPairOpts = {
  handler: getAssetPairs
}

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function AssetPairsRoute (fastify, options, done) {
  // Get Api System Status
  fastify.get('/api/assetpairs', AssetPairOpts)

  done()
}

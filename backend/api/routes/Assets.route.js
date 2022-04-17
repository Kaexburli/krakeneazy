// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { getAssets } from '../controllers/assets.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
const AssetsOpts = {
  handler: getAssets
}

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function AssetsRoute (fastify, options, done) {
  // Get Api System Status
  fastify.get('/api/assets', AssetsOpts)

  done()
}

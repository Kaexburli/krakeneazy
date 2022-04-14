import { getAssets } from '../controllers/assets.controller.js'

const AssetsOpts = {
  handler: getAssets,
}

export default function AssetsRoute(fastify, options, done) {
  // Get Api System Status
  fastify.get('/api/assets', AssetsOpts)

  done()
}
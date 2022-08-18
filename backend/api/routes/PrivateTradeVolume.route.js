// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { asyncVerifyJWTCtrl } from '../controllers/private/users.controller.js'
import { getTradeVolume } from '../controllers/private/userdatas.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function PrivateTradeVolumeRoute (fastify, _options, done) {
  fastify.decorate('asyncVerifyJWT', asyncVerifyJWTCtrl).after(() => {
    // Get Api TradeVolume - private
    fastify.route({
      method: ['GET', 'HEAD'],
      url: '/api/private/tradevolume/:pair',
      logLevel: 'warn',
      preHandler: fastify.auth([fastify.asyncVerifyJWT]),
      handler: getTradeVolume
    })
  })

  done()
}

// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { asyncVerifyJWTCtrl } from '../controllers/private/users.controller.js'
import { getTradesHistory } from '../controllers/private/userdatas.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function PrivateTradesHistoryRoute (fastify, _options, done) {
  fastify.decorate('asyncVerifyJWT', asyncVerifyJWTCtrl).after(() => {
    // Get Api TradesHistory - private
    fastify.route({
      method: ['GET', 'HEAD'],
      url: '/api/private/tradeshistory',
      logLevel: 'warn',
      preHandler: fastify.auth([fastify.asyncVerifyJWT]),
      handler: getTradesHistory
    })
  })

  done()
}

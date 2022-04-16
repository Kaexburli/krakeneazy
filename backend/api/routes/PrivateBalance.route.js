// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { asyncVerifyJWTCtrl } from '../controllers/private/users.controller.js'
import { getBalance } from '../controllers/private/userdatas.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function PrivateBalanceRoute (fastify, options, done) {
  fastify.decorate('asyncVerifyJWT', asyncVerifyJWTCtrl).after(() => {
    // Get Api Balance - private
    fastify.route({
      method: ['GET', 'HEAD'],
      url: '/api/private/balance',
      logLevel: 'warn',
      preHandler: fastify.auth([fastify.asyncVerifyJWT]),
      handler: getBalance
    })
  })

  done()
}

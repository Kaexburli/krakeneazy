import {
  asyncVerifyJWTCtrl,
  asyncVerifyUsernameAndPasswordCtrl,
  registerCtrl,
  loginCtrl,
  logoutCtrl,
  profileCtrl,
  confirmEmailCtrl,
  refreshTokenCtrl,
  forgotPasswordCtrl,
  forgotPasswordConfirmCtrl,
  resendConfirmEmailCtrl,
  addApiKeyCtrl,
  removeApiKeyCtrl,
  changeUserDataCtrl,
  confirmCGVCtrl,
  setPriceAlertCtrl
} from '../controllers/private/users.controller.js'

export default function usersRoutes(fastify, options, done) {
  // Get Api USER
  fastify
    .decorate('asyncVerifyJWT', asyncVerifyJWTCtrl)
    .decorate('asyncVerifyUsernameAndPassword', asyncVerifyUsernameAndPasswordCtrl)
    .after(() => {
      // our routes goes here
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/api/register',
        logLevel: 'warn',
        handler: registerCtrl
      });

      // email-confirm
      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/email-confirm/:confirm_token',
        logLevel: 'warn',
        handler: confirmEmailCtrl
      });

      // forgot-password
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/api/forgot-password',
        logLevel: 'warn',
        handler: forgotPasswordCtrl
      });

      // forgot-password
      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/forgot-password-confirm/:resetPasswordToken',
        logLevel: 'warn',
        handler: forgotPasswordConfirmCtrl
      });

      // forgot-password
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/api/send-confirm-email',
        logLevel: 'warn',
        handler: resendConfirmEmailCtrl
      });

      // login route
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/api/login',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyUsernameAndPassword]),
        handler: loginCtrl
      });

      // logout route
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/api/logout',
        logLevel: 'warn',
        handler: logoutCtrl
      });

      // proifle route
      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/me',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: profileCtrl
      });

      // forgot-password
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/api/add-apikey',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: addApiKeyCtrl
      });

      // forgot-password
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/api/remove-apikey',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: removeApiKeyCtrl
      });

      // change-user-data
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/api/change-user-data',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: changeUserDataCtrl
      });

      // refreshToken route
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/api/refresh-token',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: refreshTokenCtrl
      });

      // change-user-data
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/api/accept-cgv',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: confirmCGVCtrl
      });

      // add-price-alerts
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/api/price-alerts',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: setPriceAlertCtrl
      });

    });

  done()
}
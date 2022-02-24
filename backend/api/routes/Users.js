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
  confirmCGVCtrl
} from '../controllers/private/userController.js'

export default function usersRoutes(fastify, options, done) {
  // Get Api Reset Password
  fastify
    .decorate('asyncVerifyJWT', asyncVerifyJWTCtrl)
    .decorate('asyncVerifyUsernameAndPassword', asyncVerifyUsernameAndPasswordCtrl)
    .after(() => {
      // our routes goes here
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/register',
        logLevel: 'warn',
        handler: registerCtrl
      });

      // email-confirm
      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/email-confirm/:confirm_token',
        logLevel: 'warn',
        handler: confirmEmailCtrl
      });

      // forgot-password
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/forgot-password',
        logLevel: 'warn',
        handler: forgotPasswordCtrl
      });

      // forgot-password
      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/forgot-password-confirm/:resetPasswordToken',
        logLevel: 'warn',
        handler: forgotPasswordConfirmCtrl
      });

      // forgot-password
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/send-confirm-email',
        logLevel: 'warn',
        handler: resendConfirmEmailCtrl
      });

      // login route
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/login',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyUsernameAndPassword]),
        handler: loginCtrl
      });

      // logout route
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/logout',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: logoutCtrl
      });

      // proifle route
      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/me',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: profileCtrl
      });

      // forgot-password
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/add-apikey',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: addApiKeyCtrl
      });

      // forgot-password
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/remove-apikey',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: removeApiKeyCtrl
      });

      // change-user-data
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/change-user-data',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: changeUserDataCtrl
      });

      // refreshToken route
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/refresh-token',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: refreshTokenCtrl
      });

      // change-user-data
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/accept-cgv',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: confirmCGVCtrl
      });

    });

  done()
}
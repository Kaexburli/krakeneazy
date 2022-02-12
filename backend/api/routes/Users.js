import FastifyAuth from 'fastify-auth';
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
  forgotPasswordConfirmCtrl
} from '../controllers/private/userController.js'

export default function usersRoutes(fastify, options, done) {
  // Get Api Reset Password
  fastify
    .decorate('asyncVerifyJWT', asyncVerifyJWTCtrl)
    .decorate('asyncVerifyUsernameAndPassword', asyncVerifyUsernameAndPasswordCtrl)
    .register(FastifyAuth)
    .after(() => {
      // our routes goes here
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/register',
        logLevel: 'warn',
        handler: registerCtrl
      });

      // login route
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/login',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyUsernameAndPassword]),
        handler: loginCtrl
      });

      // proifle route
      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/me',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: profileCtrl
      });

      // logout route
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/logout',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: logoutCtrl
      });

      // refreshToken route
      fastify.route({
        method: ['POST', 'HEAD'],
        url: '/refresh-token',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: refreshTokenCtrl
      });

      // email-confirm
      fastify.route({
        method: ['GET'],
        url: '/email-confirm/:confirm_token',
        logLevel: 'warn',
        handler: confirmEmailCtrl
      });

      // forgot-password
      fastify.route({
        method: ['POST'],
        url: '/forgot-password',
        logLevel: 'warn',
        handler: forgotPasswordCtrl
      });

      // forgot-password
      fastify.route({
        method: ['GET'],
        url: '/forgot-password-confirm/:resetPasswordToken',
        logLevel: 'warn',
        handler: forgotPasswordConfirmCtrl
      });

    });

  done()
}
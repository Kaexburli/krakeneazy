import FastifyAuth from 'fastify-auth';
import {
  asyncVerifyJWTCtrl,
  asyncVerifyUsernameAndPasswordCtrl,
  registerCtrl,
  loginCtrl,
  logoutCtrl,
  profileCtrl,
  confirmEmailCtrl
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

      // proifle route
      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/email-confirm/:confirm_token',
        logLevel: 'warn',
        handler: confirmEmailCtrl
      });

    });

  done()
}
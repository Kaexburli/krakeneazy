import {
  asyncVerifyJWTCtrl,
} from '../controllers/private/userController.js'

import {
  addExport,
  statusExport,
  retrieveExport,
  readExport,
  rmOldExport,
  checkIfFolderExist
} from '../controllers/private/userdata.js'

export default function PrivateAddExportRoute(fastify, options, done) {

  fastify
    .decorate('asyncVerifyJWT', asyncVerifyJWTCtrl)
    .after(() => {

      // Get Api AddExport - private
      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/private/addexport/:report/:description/:starttm',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: addExport
      });

      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/private/statusexport/:report',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: statusExport
      });

      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/private/retrieveexport/:id/:type',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: retrieveExport
      });

      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/private/readexport/:id/:type',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: readExport
      });

      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/private/removeoldexport/:id',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: rmOldExport
      });

      fastify.route({
        method: ['GET', 'HEAD'],
        url: '/api/private/checkexport/:id/:type',
        logLevel: 'warn',
        preHandler: fastify.auth([fastify.asyncVerifyJWT]),
        handler: checkIfFolderExist
      });

    });

  done()
}
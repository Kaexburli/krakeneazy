import {
  addExport,
  statusExport,
  retrieveExport,
  readExport,
  rmOldExport,
  checkIfFolderExist
} from '../controllers/private/userdata.js'

const AddExportOpts = { handler: addExport }
const StatusExportOpts = { handler: statusExport }
const RetrieveExportOpts = { handler: retrieveExport }
const ReadExportOpts = { handler: readExport }
const RmOldExportOpts = { handler: rmOldExport }
const CheckIfFolderExistOpts = { handler: checkIfFolderExist }

export default function PrivateAddExportRoute(fastify, options, done) {
  // Get Api AddExport - private
  fastify.get('/api/private/addexport/:report/:description/:starttm', AddExportOpts)
  fastify.get('/api/private/statusexport/:report', StatusExportOpts)
  fastify.get('/api/private/retrieveexport/:id/:type', RetrieveExportOpts)
  fastify.get('/api/private/readexport/:id/:type', ReadExportOpts)
  fastify.get('/api/private/removeoldexport/:id', RmOldExportOpts)
  fastify.get('/api/private/checkexport/:id', CheckIfFolderExistOpts)

  done()
}
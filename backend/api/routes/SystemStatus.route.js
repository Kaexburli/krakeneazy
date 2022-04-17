// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { getSystemStatus } from '../controllers/systemstatus.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
// SystemStatus schema
const SystemStatusRouteSchema = {
  type: 'object',
  properties: {
    status: { type: 'string' }
    // timestamp: { type: 'string' },
  }
}

// Options for get system status
const getSystemStatusOpts = {
  schema: {
    response: {
      200: SystemStatusRouteSchema
    }
  },
  handler: getSystemStatus
}

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function SystemStatusRoute (fastify, _options, done) {
  // Get Api System Status
  fastify.get('/api/systemstatus', getSystemStatusOpts)

  done()
}

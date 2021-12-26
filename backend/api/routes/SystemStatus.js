import { getSystemStatus } from '../controllers/systemstatus.js'

// SystemStatus schema
const SystemStatusRouteSchema = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    // timestamp: { type: 'string' },
  },
}

// Options for get system status
const getSystemStatusOpts = {
  schema: {
    response: {
      200: SystemStatusRouteSchema,
    },
  },
  handler: getSystemStatus,
}

export default function SystemStatusRoute(fastify, options, done) {
  // Get Api System Status
  fastify.get('/api/systemstatus', getSystemStatusOpts)

  done()
}
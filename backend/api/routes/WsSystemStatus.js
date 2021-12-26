import { getWsSystemStatus } from '../controllers/private/userdata.js'

export default function WsSystemStatusRoute(fastify, options, done) {
  // Get SystemStatus
  fastify.get('/api/ws/systemstatus', { websocket: true }, getWsSystemStatus)

  done()
}
import { getWsSystemStatus } from '../controllers/private/userdata.js'

export default function WsSystemStatusRoute(fastify, options, done) {
  // Get SystemStatus WS
  fastify.get('/api/ws/systemstatus', { websocket: true }, getWsSystemStatus)

  done()
}
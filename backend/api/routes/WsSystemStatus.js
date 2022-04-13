import { getWsSystemStatus } from '../controllers/private/userdatas.controller.js'

export default function WsSystemStatusRoute(fastify, options, done) {
  // Get SystemStatus WS
  fastify.get('/api/ws/systemstatus', { websocket: true }, getWsSystemStatus)

  done()
}
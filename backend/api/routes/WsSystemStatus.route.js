// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { getWsSystemStatus } from '../controllers/private/userdatas.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export default function WsSystemStatusRoute (fastify, _options, done) {
  // Get SystemStatus WS
  fastify.get('/api/ws/systemstatus', { websocket: true }, getWsSystemStatus)

  done()
}

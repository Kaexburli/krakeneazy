import { getWsKrakenStatus } from '../controllers/private/userdatas.controller.js'

export default function WsKrakenStatusRoute(fastify, options, done) {
  // Get KrakenStatus WS
  fastify.get(
    '/api/ws/krakenstatus',
    { websocket: true },
    getWsKrakenStatus
  )

  done()
}
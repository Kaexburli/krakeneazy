import { getOpenOrders, getWsOpenOrders } from '../controllers/private/userdata.js'

const OpenOrdersOpts = {
  handler: getOpenOrders,
}

export default function PrivateOpenOrdersRoute(fastify, options, done) {
  // Get Api OpenOrders - private
  fastify.get('/api/private/openorders/:trades', OpenOrdersOpts)
  fastify.get('/api/private/openorders/:trades/:userref', OpenOrdersOpts)

  // Get Api OpenOrders - Websocket
  fastify.get('/api/ws/openorders', { websocket: true }, getWsOpenOrders)

  done()
}
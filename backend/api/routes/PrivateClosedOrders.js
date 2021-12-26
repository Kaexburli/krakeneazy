import { getClosedOrders } from '../controllers/private/userdata.js'

const ClosedOrdersOpts = {
  handler: getClosedOrders,
}

export default function PrivateClosedOrdersRoute(fastify, options, done) {
  // Get Api ClosedOrders - private
  fastify.get('/api/private/closedorders', ClosedOrdersOpts)
  fastify.get('/api/private/closedorders/:trades', ClosedOrdersOpts)
  fastify.get('/api/private/closedorders/:trades/:ofs', ClosedOrdersOpts)
  fastify.get('/api/private/closedorders/:trades/:ofs/:start', ClosedOrdersOpts)
  fastify.get('/api/private/closedorders/:trades/:ofs/:start/:end', ClosedOrdersOpts)
  fastify.get('/api/private/closedorders/:trades/:ofs/:start/:end/:userref', ClosedOrdersOpts)
  fastify.get('/api/private/closedorders/:trades/:ofs/:start/:end/:userref/:closetime', ClosedOrdersOpts)

  done()
}
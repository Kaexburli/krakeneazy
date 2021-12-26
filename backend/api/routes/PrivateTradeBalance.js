import { getTradeBalance, getWsTradeBalance } from '../controllers/private/userdata.js'

const TradeBalanceOpts = {
  handler: getTradeBalance,
}

export default function PrivateTradeBalanceRoute(fastify, options, done) {
  // Get Api TradeBalance - private
  fastify.get('/api/private/tradebalance/:asset', TradeBalanceOpts)

  // Get Api OpenOrders - Websocket
  fastify.get('/api/ws/tradebalance/:asset', { websocket: true }, getWsTradeBalance)

  done()
}
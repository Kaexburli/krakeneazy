// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { Kraken } from 'node-kraken-api'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
// Instanciation du module kraken API
const api = new Kraken()

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
const GetTrade = async (connection, req) => {
  try {
    const { base, quote } = req.params
    const pair = base + '/' + quote

    const trade = await api.ws
      .trade()
      .on('update', (update, pair) => {
        connection.socket.send(
          JSON.stringify({ service: 'Trade', data: update })
        )
      })
      .on('status', (status) => {
        connection.socket.send(
          JSON.stringify({ service: 'Trade', data: false, status })
        )
      })
      .on('error', (error, pair) => {
        req.log.error({ error, pair }, '[ERROR GetTrade]')
        connection.socket.send(
          JSON.stringify({ service: 'Trade', data: false, error, pair })
        )
      })
      .subscribe(pair)

    connection.socket.on('close', async (message) => {
      try {
        const unsubscribe = await trade.unsubscribe(pair)
        req.log.warn({ message, unsubscribe }, '[CLOSE GetTrade]')
      } catch (error) {
        req.log.error({ error }, '[ERROR:TRADE:GetTrade]')
        return error
      }
    })

    connection.socket.on('error', async (evt) => {
      req.log.error({ evt }, '[ON ERROR GetTrade]')
    })
  } catch (error) {
    req.log.error({ error }, '[CATCH ERROR GetTrade]')
    return error
  }
}

export { GetTrade }

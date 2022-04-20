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
const GetTicker = async (connection, req) => {
  try {
    const { base, quote } = req.params
    const pair = base + '/' + quote

    const ticker = await api.ws
      .ticker()
      .on('update', (update, pair) => {
        connection.socket.send(
          JSON.stringify({ service: 'Ticker', data: update })
        )
      })
      .on('status', (status) => {
        connection.socket.send(
          JSON.stringify({ service: 'Ticker', data: false, status })
        )
      })
      .on('error', (error, pair) => {
        req.log.error({ error, pair }, '[ERROR GetTicker]')
        connection.socket.send(
          JSON.stringify({ service: 'Ticker', data: false, error, pair })
        )
      })
      .subscribe(pair)

    connection.socket.on('close', async (message) => {
      try {
        const unsubscribe = await ticker.unsubscribe(pair)
        req.log.warn({ message, unsubscribe }, '[CLOSE GetTicker]')
      } catch (error) {
        req.log.error({ error }, '[ERROR:TICKER:GetTicker]')
        return error
      }
    })

    connection.socket.on('error', async (evt) => {
      req.log.error({ evt }, '[ON ERROR GetTrade]')
    })
  } catch (error) {
    req.log.error({ error }, '[CATCH ERROR GetTicker]')
    return error
  }
}

export { GetTicker }

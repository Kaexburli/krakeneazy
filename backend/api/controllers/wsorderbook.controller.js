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
const GetOrderBook = async (connection, req) => {
  try {
    const { base, quote, depth } = req.params
    const pair = base + '/' + quote

    const book = await api.ws
      .book({ depth: parseInt(depth) })
      .on('snapshot', (snapshot) => {
        connection.socket.send(
          JSON.stringify({ service: 'OrderBook', data: { snapshot } })
        )
      })
      .on('ask', (ask) => {
        connection.socket.send(
          JSON.stringify({ service: 'OrderBook', data: { ask } })
        )
      })
      .on('bid', (bid) => {
        connection.socket.send(
          JSON.stringify({ service: 'OrderBook', data: { bid } })
        )
      })
      .on('mirror', (mirror) => {
        connection.socket.send(
          JSON.stringify({ service: 'OrderBook', data: { mirror } })
        )
      })
      .on('status', (status) => {
        connection.socket.send(
          JSON.stringify({ service: 'OrderBook', data: false, status })
        )
      })
      .on('error', (error, pair) => {
        req.log.error({ error, pair }, '[ERROR GetOrderBook]')
        connection.socket.send(
          JSON.stringify({ service: 'OrderBook', data: false, error, pair })
        )
      })
      .subscribe(pair)

    connection.socket.on('close', async (message) => {
      try {
        const unsubscribe = await book.unsubscribe(pair)
        req.log.warn({ message, unsubscribe }, '[CLOSE GetOrderBook]')
      } catch (error) {
        req.log.error({ error }, '[ERROR:BOOK:GetOrderBook]')
        return error
      }
    })

    connection.socket.on('error', async (evt) => {
      req.log.error({ evt }, '[ON ERROR GetOrderBook]')
    })
  } catch (error) {
    req.log.error({ error }, '[CATCH ERROR GetOrderBook]')
    return error
  }
}

export { GetOrderBook }

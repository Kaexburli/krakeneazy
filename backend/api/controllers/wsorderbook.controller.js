// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { Kraken } from 'node-kraken-api'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
// Instanciation du module kraken API
const api = new Kraken()
const debug = false

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
const GetOrderBook = async (connection, req) => {
  try {
    const { base, quote, depth } = req.params
    const pair = base + '/' + quote

    if (debug) {
      console.log('GetSpread')
    }

    const book = await api.ws
      .book({ depth: parseInt(depth) })
      .on('snapshot', (snapshot) => {
        if (debug) console.log('[SNAPSHOT BOOK]: ', snapshot)
        connection.socket.send(
          JSON.stringify({ service: 'OrderBook', data: { snapshot } })
        )
      })
      .on('ask', (ask) => {
        if (debug) console.log('[ASK BOOK]: ', ask)
        connection.socket.send(
          JSON.stringify({ service: 'OrderBook', data: { ask } })
        )
      })
      .on('bid', (bid) => {
        if (debug) console.log('[BID BOOK]: ', bid)
        connection.socket.send(
          JSON.stringify({ service: 'OrderBook', data: { bid } })
        )
      })
      .on('mirror', (mirror) => {
        if (debug) console.log('[MIRROR BOOK]: ', mirror)
        connection.socket.send(
          JSON.stringify({ service: 'OrderBook', data: { mirror } })
        )
      })
      .on('status', (status) => {
        if (debug) console.log('[STATUS BOOK]: ', status)
        connection.socket.send(
          JSON.stringify({ service: 'OrderBook', data: false, status })
        )
      })
      .on('error', (error, pair) => {
        if (debug) console.log('[ERROR BOOK]: ', error, pair)
        connection.socket.send(
          JSON.stringify({ service: 'OrderBook', data: false, error, pair })
        )
      })
      .subscribe(pair)

    connection.socket.on('close', async (message) => {
      if (debug) {
        console.log('[CLOSE BOOK]: ', message)
      }
      try {
        await book.unsubscribe(pair)
      } catch (error) {
        console.log('[ERROR:BOOK:ONCLOSE]', error)
        return error
      }
    })
  } catch (error) {
    console.log('[CATCH ERROR BOOK]: ', error)
    return error
  }
}

export { GetOrderBook }

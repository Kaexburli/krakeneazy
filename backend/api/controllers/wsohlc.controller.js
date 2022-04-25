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
const GetOhlc = async (connection, req, _reply) => {
  try {
    const { base, quote, interval } = req.params
    const pair = base + '/' + quote

    const ohlc = await api.ws
      .ohlc({ interval: parseInt(interval) })
      .on('update', (update, pair) => {
        connection.socket.send(
          JSON.stringify({ service: 'Ohlc', data: update, pair })
        )
      })
      .on('status', (status) => {
        connection.socket.send(
          JSON.stringify({ service: 'Ohlc', data: false, status })
        )
      })
      .on('error', (error, pair) => {
        req.log.error({ error, pair }, '[ERROR GetOhlc]')
        connection.socket.send(
          JSON.stringify({ service: 'Ohlc', data: false, error, pair })
        )
      })
      .subscribe(pair)

    connection.socket.on('close', async (message) => {
      try {
        const unsubscribe = await ohlc.unsubscribe(pair)
        req.log.warn({ message, unsubscribe }, '[CLOSE GetOhlc]')
      } catch (error) {
        req.log.error({ error }, '[ERROR:OHLC:GetOhlc]')
        return error
      }
    })

    connection.socket.on('error', async (evt) => {
      req.log.error({ evt }, '[ON ERROR on (error)]')
    })
  } catch (error) {
    req.log.error({ error }, '[CATCH ERROR GetOhlc]')
    return error
  }
}

export { GetOhlc }

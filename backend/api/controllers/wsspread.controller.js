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
const GetSpread = async (connection, req) => {
  try {
    const { base, quote } = req.params
    const pair = base + '/' + quote

    const spread = await api.ws
      .spread()
      .on('update', (update, pair) => {
        connection.socket.send(
          JSON.stringify({ service: 'Spread', data: update, pair })
        )
      })
      .on('status', (status) => {
        connection.socket.send(
          JSON.stringify({ service: 'Spread', data: false, status })
        )
      })
      .on('error', (error, pair) => {
        req.log.error({ error, pair }, '[ERROR GetSpread]')
        connection.socket.send(
          JSON.stringify({ service: 'Spread', data: false, error, pair })
        )
      })
      .subscribe(pair)

    connection.socket.on('close', async (message) => {
      try {
        const unsubscribe = await spread.unsubscribe(pair)
        req.log.warn({ message, unsubscribe }, '[CLOSE GetSpread]')
      } catch (error) {
        req.log.error({ error }, '[ERROR:SPREAD:GetSpread]')
        return error
      }
    })

    connection.socket.on('error', async (evt) => {
      req.log.error({ evt }, '[ON ERROR GetSpread]')
    })
  } catch (error) {
    req.log.error({ error }, '[CATCH ERROR GetSpread]')
    return error
  }
}

export { GetSpread }

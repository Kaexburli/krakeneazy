import { Kraken } from 'node-kraken-api'

// Instanciation du module kraken API
const api = new Kraken()
const debug = false;

const GetSpread = async (connection, req) => {
  try {
    const { base, quote } = req.params;
    const pair = base + "/" + quote;

    if (debug) console.log('########################################### GetSpread')

    const spread = await api.ws.spread()
      .on('update', (update, pair) => {
        if (debug) console.log('[UPDATE SPREAD]: ', pair, update)
        connection.socket.send(JSON.stringify({ service: 'Spread', data: update }))
      })
      .on('status', (status) => {
        if (debug) console.log('[STATUS SPREAD]: ', status)
        connection.socket.send(JSON.stringify({ service: 'Spread', data: false, status }))
      })
      .on('error', (error, pair) => {
        if (debug) console.log('[ERROR SPREAD]: ', error, pair)
        connection.socket.send(JSON.stringify({ service: 'Spread', data: false, error, pair }))
      })
      .subscribe(pair)

    connection.socket.on('close', async (message) => {
      if (debug) console.log('[###########################################  CLOSE SPREAD]: ', message)
      try {
        await spread.unsubscribe(pair)
      } catch (error) {
        console.log('[ERROR:SPREAD:ONCLOSE]', error)
      }
    })
  } catch (error) {
    console.log('[CATCH ERROR SPREAD]: ', error)
  }
}

export {
  GetSpread
};
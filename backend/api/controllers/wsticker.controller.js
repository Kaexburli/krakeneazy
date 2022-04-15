import { Kraken } from 'node-kraken-api'

// Instanciation du module kraken API
const api = new Kraken()
const debug = false;

const GetTicker = async (connection, req) => {
  try {
    const { base, quote } = req.params
    const pair = base + "/" + quote

    if (debug) console.log('########################################### GetTicker')

    const ticker = await api.ws.ticker()
      .on('update', (update, pair) => {
        if (debug) console.log('[UPDATE TICKER]: ', pair, update)
        connection.socket.send(JSON.stringify({ service: 'Ticker', data: update }))
      })
      .on('status', (status) => {
        if (debug) console.log('[STATUS TICKER]: ', status)
        connection.socket.send(JSON.stringify({ service: 'Ticker', data: false, status }))
      })
      .on('error', (error, pair) => {
        if (debug) console.log('[ERROR TICKER]: ', error, pair)
        connection.socket.send(JSON.stringify({ service: 'Ticker', data: false, error, pair }))
      })
      .subscribe(pair)

    connection.socket.on('close', async (message) => {
      if (debug) console.log('[###########################################  CLOSE TICKER]: ', message)
      try {
        await ticker.unsubscribe(pair)
      } catch (error) {
        console.log('[ERROR:TICKER:ONCLOSE]', error);
        return error;
      }
    })
  } catch (error) {
    console.log('[CATCH ERROR TICKER]: ', error);
    return error;
  }
}

export {
  GetTicker
};
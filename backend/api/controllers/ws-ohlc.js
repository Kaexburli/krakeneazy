import { Kraken } from 'node-kraken-api'

// Instanciation du module kraken API
const api = new Kraken()
const debug = false;

const GetOhlc = async (connection, req) => {
  try {
    const { base, quote, interval } = req.params;
    const pair = base + "/" + quote;

    if (debug) console.log('########################################### GetSpread')

    const ohlc = await api.ws.ohlc(parseInt(interval))
      .on('update', (update, pair) => {
        if (debug) console.log('[UPDATE OHLC]: ', pair, update)
        connection.socket.send(JSON.stringify({ service: 'Ohlc', data: update }))
      })
      .on('status', (status) => { if (debug) console.log('[STATUS OHLC]: ', status) })
      .on('error', (error, pair) => { if (debug) console.log('[ERROR OHLC]: ', error, pair) })
      .subscribe(pair)

    connection.socket.on('close', async (message) => {
      if (debug) console.log('[###########################################  CLOSE OHLC]: ', message)
      try {
        await ohlc.unsubscribe(pair)
      } catch (error) {
        console.log('######################" [ERROR:OHLC:ONCLOSE]', error)
      }
    })
  } catch (error) {
    console.log('[CATCH ERROR OHLC]: ', error)
  }
}

export {
  GetOhlc
};
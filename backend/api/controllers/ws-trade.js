import { Kraken } from 'node-kraken-api'

// Instanciation du module kraken API
const api = new Kraken()
const debug = false;

const GetTrade = async (connection, req) => {
  try {
    const { base, quote } = req.params;
    const pair = base + "/" + quote;

    if (debug) console.log('########################################### GetTrade')

    const trade = await api.ws.trade()
      .on('update', (update, pair) => {
        if (debug) console.log('[UPDATE TRADE]: ', pair, update)
        connection.socket.send(JSON.stringify({ service: 'Trade', data: update }))
      })
      .on('status', (status) => { if (debug) console.log('[STATUS TRADE]: ', status) })
      .on('error', (error, pair) => { if (debug) console.log('[ERROR TRADE]: ', error, errinfo) })
      .subscribe(pair)

    connection.socket.on('close', async (message) => {
      if (debug) console.log('[###########################################  CLOSE TRADE]: ', message)
      try {
        await trade.unsubscribe(pair)
      } catch (error) {
        console.log('######################" [ERROR:TRADE:ONCLOSE]', error)
      }
    })
  } catch (error) {
    console.log('[CATCH ERROR TRADE]: ', error)
  }
}

export {
  GetTrade
};
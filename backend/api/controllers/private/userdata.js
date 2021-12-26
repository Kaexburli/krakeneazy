import { Kraken } from 'node-kraken-api'

let debug = false


/**
 *  *****************
 *  KRAKEN API
 *  *****************
 */

// Instanciation du module kraken API
const API_KEY = process.env.API_KEY
const API_PRIV = process.env.API_PRIV

const NonceGenerator = (() => {
  let prev = -1;
  let next = -1;
  return Object.freeze(() => {
    next = Date.now();
    if (next <= prev) next = prev + 1;
    prev = next;
    return next;
  });
})();

const api = new Kraken({
  key: API_KEY,
  secret: API_PRIV,
  gennonce: () => NonceGenerator()
})

/**
 *  *****************
 *  API REST METHOD
 *  *****************
 */

// /SystemStatus
const getSystemStatus = async (req, reply) => {
  try {
    let response = await api.systemStatus()
    return response
  } catch (error) {
    return error
  }
}

// /private/Balance
const getBalance = async (req, reply) => {
  try {
    let response = await api.balance()
    return response
  } catch (error) {
    return error
  }
}

// /private/TradeBalance
const getTradeBalance = async (req, reply) => {
  const { asset } = req.params
  try {
    let response = await api.tradeBalance({ asset: asset })
    return response
  } catch (error) {
    return error
  }
}

// /private/OpenOrders
const getOpenOrders = async (req, reply) => {
  const { trades, userref } = req.params

  let params

  if (typeof userref !== 'undefined' && Number.isInteger(userref)) {
    params = { trades, userref }
  }
  else {
    params = { trades }
  }

  try {
    let response = await api.openOrders(params)
    return response
  } catch (error) {
    return error
  }
}

// /private/ClosedOrders
const getClosedOrders = async (req, reply) => {
  const { trades, ofs, start, end, userref, closetime } = req.params

  let params

  if (typeof ofs !== 'undefined' && Number.isInteger(Number(ofs))) {
    params = { trades, ofs, start }
  }
  else {
    params = { trades }
  }

  try {
    let response = await api.closedOrders(params)
    return response
  } catch (error) {
    return error
  }
}

// /private/TradeVolume
const getTradeVolume = async (req, reply) => {
  const { pair } = req.params

  if (typeof pair === undefined && !pair) {
    pair = "XBTUSD"
  }

  try {
    let response = await api.tradeVolume({ pair })
    return response
  } catch (error) {
    return error
  }
}

// /private/Ledgers
const getLedgers = async (req, reply) => {
  try {
    let response = await api.ledgers()
    return response
  } catch (error) {
    return error
  }
}

// /private/TradesHistory
const getTradesHistory = async (req, reply) => {
  try {
    let response = await api.tradesHistory()
    return response
  } catch (error) {
    return error
  }
}


/**
 *  *****************
 *  WEBSOCKET METHOD
 *  *****************
 */

// /private/OpenOrders
const getWsOpenOrders = async (connection, reply, req) => {

  const { token } = await api.getWebSocketsToken();

  try {

    const openorders = await api.ws.openOrders({ token: token, ratecounter: true })
      .on("update", (update, sequence) => {
        if (debug) console.log('[UPDATE OPEN-ORDERS]: ', update, sequence)
        connection.socket.send(JSON.stringify({ service: 'OpenOrders', data: update, sequence }))
      })
      .on('token', (token) => { if (debug) console.log('[STATUS OPEN-ORDERS]: ', token) })
      .on('status', (status) => {
        if (debug) console.log('[STATUS OPEN-ORDERS]: ', status)
        connection.socket.send(JSON.stringify({ service: 'OpenOrders', data: false, status: status }))
      })
      .on('error', (error, sequence) => {
        if (debug) console.log('[ERROR OPEN-ORDERS]: ', error, sequence, openorders)
        connection.socket.send(JSON.stringify(error))
        openorders.unsubscribe()
        openorders.close()
        connection.socket.open()
      })
      .subscribe();

    connection.socket.on('close', async (message) => {
      openorders.unsubscribe()
    })

  } catch (error) {
    return error
  }
}

// /private/OwnTrades
const getWsOwnTrades = async (connection, reply, req) => {

  const { token } = await api.getWebSocketsToken();

  try {

    const owntrades = await api.ws.ownTrades({ token: token, ratecounter: true })
      .on("update", (update, sequence) => {
        if (debug) console.log('[UPDATE OWN-TRADES]: ', update, sequence)
        connection.socket.send(JSON.stringify({ service: 'OwnTrades', data: update, sequence }))
      })
      .on('token', (token) => { if (debug) console.log('[TOKEN OWN-TRADES]: ', token) })
      .on('status', (status) => {
        if (debug) console.log('[STATUS WN-TRADES]]: ', status)
        connection.socket.send(JSON.stringify({ service: 'OwnTrades', data: false, status: status }))
      })
      .on('error', (error, sequence) => {
        if (debug) console.log('[ERROR OWN-TRADES]: ', error, sequence, owntrades)
        connection.socket.send(JSON.stringify(error))
        owntrades.unsubscribe()
        owntrades.close()
        connection.socket.open()
      })
      .subscribe();

    connection.socket.on('close', async (message) => {
      owntrades.unsubscribe()
    })

  } catch (error) {
    return error
  }
}

// /private/TradeBalance WS
const getWsTradeBalance = async (connection, reply, req) => {

  try {

    let timer = null,
      interval = 15000;

    // Strat interval
    const startInterval = () => {
      timer = setInterval(() => {
        getWsSystemStatusData()
      }, interval);
    }

    // Envoie la requête api
    const getWsSystemStatusData = async () => {
      let response = await getTradeBalance(reply, req)
      checkAndSendResult(response)
    }

    // Verifie la réponse si erreur
    const checkAndSendResult = async (data) => {
      if (
        data.hasOwnProperty('body') &&
        data.body.hasOwnProperty('error')
      ) {
        connection.socket.send(JSON.stringify({ service: 'WsSystemStatus', data: { error: data.body.error } }))
        stopInterval()

        setTimeout(() => {
          timer = startInterval()
        }, (interval * 4));

      }
      else {
        connection.socket.send(JSON.stringify({ service: 'WsSystemStatus', error: false, data }))
      }
    }

    // Stop l'interval
    const stopInterval = () => {
      clearInterval(timer)
      timer = null
    }

    // Lancement de linterval 
    startInterval()

  } catch (error) {
    return error
  }
}

// /SystemStatus WS
const getWsSystemStatus = async (connection, reply, req) => {

  try {

    let timer = null,
      interval = 1000;

    // Strat interval
    const startInterval = () => {
      timer = setInterval(() => {
        getWsSystemStatusData()
      }, interval);
    }

    // Envoie la requête api
    const getWsSystemStatusData = async () => {
      let response = await getSystemStatus(reply, req)
      checkAndSendResult(response)
    }

    // Verifie la réponse si erreur
    const checkAndSendResult = async (data) => {
      if (
        data.hasOwnProperty('body') &&
        data.body.hasOwnProperty('error')
      ) {
        connection.socket.send(JSON.stringify({ service: 'WsSystemStatus', data: { error: data.body.error } }))
        stopInterval()

        setTimeout(() => {
          timer = startInterval()
        }, (interval * 300));

      }
      else {
        connection.socket.send(JSON.stringify({ service: 'WsSystemStatus', error: false, data }))
      }
    }

    // Stop l'interval
    const stopInterval = () => {
      clearInterval(timer)
      timer = null
    }

    // Lancement de linterval 
    startInterval()

  } catch (error) {
    return error
  }
}


/**
 *  *****************
 *  EXPORT
 *  *****************
 */
export {
  // REST MEthod
  getBalance,
  getTradeBalance,
  getOpenOrders,
  getClosedOrders,
  getTradeVolume,
  getLedgers,
  getTradesHistory,

  // WS Mtehod
  getWsOpenOrders,
  getWsOwnTrades,
  getWsTradeBalance,
  getWsSystemStatus,
};
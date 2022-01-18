import { existsSync, rmSync, writeFileSync } from "fs";
import * as path from 'path';

import { Kraken } from 'node-kraken-api'
import extract from 'extract-zip'
import CSVToJSON from 'csvtojson'
// const __base = path.resolve('../export/.');
let debug = false

/**
 *  *****************
 *  KRAKEN API
 *  *****************
 */

// Instanciation du module kraken API
import KRAKEN from '../../../kraken.env.js'

const randomApiKey = () => {
  return Math.floor(Math.random() * (10 - 1 + 1)) + 1;
}

let shuffle = randomApiKey();
const API_KEY = KRAKEN['key_' + shuffle]['key']
const API_PRIV = KRAKEN['key_' + shuffle]['secret']

console.log('################### Chargement des clés API [N°:' + shuffle + '] ###################')

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

// /private/OpenPositions
const getOpenPositions = async (req, reply) => {
  try {
    let response = await api.openPositions({ docalcs: true })
    return response
  } catch (error) {
    return error
  }
}

// /private/AddExport
const addExport = async (req, reply) => {
  const { report, description, starttm } = req.params
  try {
    let add = await api.addExport({ report, description, starttm })
    return add
  } catch (error) {
    return error
  }
}

// /private/statusExport
const statusExport = async (req, reply) => {
  const { report } = req.params
  try {
    let status = await api.exportStatus({ report })
    return status
  } catch (error) {
    return error
  }
}

// /private/retrieveExport
const retrieveExport = async (req, reply) => {
  const { id, type } = req.params
  try {

    let res = true;
    const filename = `${id}_${type}.zip`;
    const __base = path.resolve('../export/.');
    const fullPath = __base + '/' + filename
    const destPath = __base + '/' + id

    let data = await api.retrieveExport({ id });
    const writeOpts = {
      encoding: "utf8",
      flag: "w",
      mode: 0o666
    };

    writeFileSync(fullPath, data, writeOpts);

    if (existsSync(fullPath)) {
      await extractZip(fullPath, destPath)
      rmSync(fullPath, destPath + '/' + filename); // Supprime le fichier zip
    } else {
      res = false;
    }

    return { filename, res, data }

  } catch (error) {
    return { error }
  }
}

// /private/rmOldExport
const rmOldExport = async (req, reply) => {
  const { id } = req.params

  try {
    const __base = path.resolve('../export/.');
    const fullPath = path.join(__base, id)
    if (existsSync(fullPath)) rmSync(fullPath, { recursive: true })
    const res = await api.removeExport({ id, type: 'delete' });
    return res;

  } catch (error) {
    return { error }
  }
}

// /private/readExport
const readExport = async (req, reply) => {
  const { id, type } = req.params
  try {
    let data;
    let fileExist = false;
    const filename = id + '\\' + type + '.csv';
    const __base = path.resolve('../export/.');
    const fullPath = __base + '\\' + filename

    if (existsSync(fullPath)) data = await CSVToJSON().fromFile(fullPath)
    else data = false;

    return data

  } catch (error) {
    return { error }
  }
}

// Verifie que le dossier de destination existe
const checkIfFolderExist = async (req, reply) => {
  const { id } = req.params
  const __base = path.resolve('../export/.')
  const destPath = __base + '/' + id

  return existsSync(destPath)
}

// Extrait le fichier zip passé en paramètres
const extractZip = async (source, target) => {
  try {
    return await extract(source, { dir: target });
  } catch (err) {
    console.log("Oops: extractZip failed", err);
  }
}

/**
 *  *****************
 *  WEBSOCKET METHOD
 *  *****************
 */

// /private/OpenOrders
const getWsOpenOrders = async (connection, reply, req) => {

  try {

    const { token } = await api.getWebSocketsToken();

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
        // openorders.unsubscribe()
        // openorders.close()
        // connection.socket.open()
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

  try {

    const { token } = await api.getWebSocketsToken();

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
        // owntrades.unsubscribe()
        // owntrades.close()
        // connection.socket.open()
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

  let timer = null;
  let interval = 30000;

  // Strat interval
  const startInterval = () => {
    timer = setInterval(() => {
      getWsTradeBalanceData()
    }, interval);
  }

  // Envoie la requête api
  const getWsTradeBalanceData = async () => {
    try {
      let response = await getTradeBalance(reply, req)
      checkAndSendResult(response)
    } catch (error) {
      console.log('######################" [ERROR:getWsTradeBalanceData]', error)
    }
  }

  // Verifie la réponse si erreur
  const checkAndSendResult = async (data) => {
    if (
      data.hasOwnProperty('body') &&
      data.body.hasOwnProperty('error')
    ) {
      connection.socket.send(JSON.stringify({ service: 'WsTradeBalance', data: { error: data.body.error } }))
      stopInterval()

      setTimeout(() => {
        timer = startInterval()
      }, (interval * 4));

    }
    else {
      data.rate = Date.now()
      connection.socket.send(JSON.stringify({ service: 'WsTradeBalance', error: false, data }))
    }
  }

  // Stop l'interval
  const stopInterval = () => {
    clearInterval(timer)
    timer = null
  }

  // Lancement de l'interval 
  startInterval()
}

// /SystemStatus WS
const getWsSystemStatus = async (connection, reply, req) => {

  let timer = null,
    interval = 2000;

  // Strat interval
  const startInterval = () => {
    timer = setInterval(() => {
      getWsSystemStatusData()
    }, interval);
  }

  // Envoie la requête api
  const getWsSystemStatusData = async () => {
    try {
      let response = await getSystemStatus(reply, req)
      checkAndSendResult(response)
    } catch (error) {
      console.log('######################" [ERROR:getWsSystemStatusData]', error)
    }
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

  // Lancement de l'interval 
  startInterval()
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
  getOpenPositions,
  addExport,
  statusExport,
  retrieveExport,
  readExport,
  rmOldExport,
  checkIfFolderExist,

  // WS Mtehod
  getWsOpenOrders,
  getWsOwnTrades,
  getWsTradeBalance,
  getWsSystemStatus,
};
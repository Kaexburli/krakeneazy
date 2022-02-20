import { existsSync, rmSync, writeFileSync } from "fs";
import * as path from 'path';

import { Kraken } from 'node-kraken-api'
import extract from 'extract-zip'
import CSVToJSON from 'csvtojson'
const __base = path.resolve('../export/.');
let debug = false

/**
 *  *****************
 *  KRAKEN API
 *  *****************
 */

// randomApiKey
const randomApiKey = (num) => {
  return Math.floor(Math.random() * num);
}

// NonceGenerator
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

// Instanciation du module kraken API
const initApiKraken = (apikeys = false) => {

  if (!apikeys || typeof apikeys === ("undefined" || null) || !apikeys.length) {
    return new Kraken({ gennonce: () => NonceGenerator() })
  }

  let shuffle = randomApiKey(apikeys.length);
  if (typeof apikeys[shuffle] === "undefined") {
    return new Kraken({ gennonce: () => NonceGenerator() })
  }

  const pubKey = apikeys[shuffle].apiKeyPublic || false;
  const privKey = apikeys[shuffle].apiKeyPrivate || false;
  if (!pubKey || !privKey) {
    return new Kraken({ gennonce: () => NonceGenerator() })
  }

  if (pubKey && privKey) {
    return new Kraken({
      key: pubKey,
      secret: privKey,
      gennonce: () => NonceGenerator()
    })
  }
}

/**
 *  *****************
 *  API REST METHOD
 *  *****************
 */

// /SystemStatus
const getSystemStatus = async (_req, _reply) => {
  const apiKraken = initApiKraken()
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    let response = await apiKraken.systemStatus()
    return response
  } catch (error) {
    return error
  }
}

// /private/Balance
const getBalance = async (req, _reply) => {
  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    let response = await apiKraken.balance()
    return response
  } catch (error) {
    return error
  }
}

// /private/TradeBalance
const getTradeBalance = async (req, _reply) => {
  const { asset } = req.params

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    let response = await apiKraken.tradeBalance({ asset: asset })
    return response
  } catch (error) {
    return error
  }
}

// /private/OpenOrders
const getOpenOrders = async (req, _reply) => {
  const { trades, userref } = req.params

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  let params

  if (typeof userref !== 'undefined' && Number.isInteger(userref)) {
    params = { trades, userref }
  }
  else {
    params = { trades }
  }

  try {
    let response = await apiKraken.openOrders(params)
    return response
  } catch (error) {
    return error
  }
}

// /private/ClosedOrders
const getClosedOrders = async (req, _reply) => {
  const { trades, ofs, start, end, userref, closetime } = req.params

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  let params

  if (typeof ofs !== 'undefined' && Number.isInteger(Number(ofs))) {
    params = { trades, ofs, start }
  }
  else {
    params = { trades }
  }

  try {
    let response = await apiKraken.closedOrders(params)
    return response
  } catch (error) {
    return error
  }
}

// /private/TradeVolume
const getTradeVolume = async (req, _reply) => {
  const { pair } = req.params

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  if (typeof pair === undefined && !pair) {
    pair = "XBTUSD"
  }

  try {
    let response = await apiKraken.tradeVolume({ pair })
    return response
  } catch (error) {
    return error
  }
}

// /private/Ledgers
const getLedgers = async (req, _reply) => {
  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    let response = await apiKraken.ledgers()
    return response
  } catch (error) {
    return error
  }
}

// /private/TradesHistory
const getTradesHistory = async (req, _reply) => {
  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };


  try {
    let response = await apiKraken.tradesHistory()
    return response
  } catch (error) {
    return error
  }
}

// /private/OpenPositions
const getOpenPositions = async (req, _reply) => {
  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    let response = await apiKraken.openPositions({ docalcs: true })
    return response
  } catch (error) {
    return error
  }
}

// /private/AddExport
const addExport = async (req, _reply) => {
  const { report, description, starttm } = req.params

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    let add = await apiKraken.addExport({ report, description, starttm })
    return add
  } catch (error) {
    return error
  }
}

// /private/statusExport
const statusExport = async (req, _reply) => {
  const { report } = req.params

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    let status = await apiKraken.exportStatus({ report })
    return status
  } catch (error) {
    return error
  }
}

// /private/retrieveExport
const retrieveExport = async (req, _reply) => {
  const { id, type } = req.params

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {

    let res = true;
    const filename = `${id}_${type}.zip`;
    const fullPath = __base + '/' + filename
    const destPath = __base + '/' + id

    let data = await apiKraken.retrieveExport({ id });
    const writeOpts = {
      encoding: "utf8",
      flag: "w",
      mode: 0o666
    };

    writeFileSync(fullPath, data, writeOpts);

    if (existsSync(fullPath)) {
      await extractZip(fullPath, destPath)
      rmSync(fullPath); // Supprime le fichier zip
    } else {
      res = false;
    }

    return { filename, res, data }

  } catch (error) {
    return { error }
  }
}

// /private/rmOldExport
const rmOldExport = async (req, _reply) => {
  const { id } = req.params

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    const fullPath = path.join(__base, id)
    if (existsSync(fullPath)) rmSync(fullPath, { recursive: true })
    const res = await apiKraken.removeExport({ id, type: 'delete' });
    return res;

  } catch (error) {
    return { error }
  }
}

// /private/readExport
const readExport = async (req, _reply) => {
  const { id, type } = req.params
  try {
    let data;
    let fileExist = false;
    const filename = id + '\\' + type + '.csv';
    const fullPath = __base + '\\' + filename

    if (existsSync(fullPath)) data = await CSVToJSON().fromFile(fullPath)
    else data = false;

    return data

  } catch (error) {
    return { error }
  }
}

// Verifie que le dossier de destination existe
const checkIfFolderExist = async (req, _reply) => {
  const { id, type } = req.params
  const destPath = __base + '/' + id + '/' + type + '.csv'
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
const getWsOpenOrders = async (connection, req, _reply) => {

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {

    const { token } = await apiKraken.getWebSocketsToken();

    const openorders = await apiKraken.ws.openOrders({ token: token, ratecounter: true })
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
const getWsOwnTrades = async (connection, req, _reply) => {

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {

    const { token } = await apiKraken.getWebSocketsToken();

    const owntrades = await apiKraken.ws.ownTrades({ token: token, ratecounter: true })
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
      })
      .subscribe();

    connection.socket.on('close', async (_message) => {
      owntrades.unsubscribe()
    })

  } catch (error) {
    return error
  }
}

// /private/TradeBalance WS
const getWsTradeBalance = async (connection, req, reply) => {

  let timer = null;
  let interval = 5000;

  // Strat interval
  const startInterval = () => {
    timer = setInterval(() => {
      getWsTradeBalanceData(req, reply)
    }, interval);
  }

  // Envoie la requête api
  const getWsTradeBalanceData = async (req, reply) => {
    try {

      let response = await getTradeBalance(req, reply)
      checkAndSendResult(response)
    } catch (error) {
      console.log('[ERROR]:', error)
    }
  }

  // Verifie la réponse si erreur
  const checkAndSendResult = async (data) => {
    if (
      data.hasOwnProperty('body') &&
      data.body.hasOwnProperty('error')
    ) {
      connection.socket.send(JSON.stringify({ service: 'WsTradeBalance', error: true, message: data.body.error }))
      stopInterval()

      setTimeout(() => {
        timer = startInterval()
      }, (interval * 4));

    }
    else {
      data['rate'] = Date.now()
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
const getWsSystemStatus = async (connection, req, reply) => {

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
      let response = await getSystemStatus(req, reply)
      checkAndSendResult(response)
    } catch (error) {
      console.log("[ERROR]:", error)
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
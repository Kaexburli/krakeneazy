import fetch from "node-fetch";
import { existsSync, rmSync, writeFileSync, mkdirSync } from "fs";
import * as path from 'path';

import { Kraken } from 'node-kraken-api'
import extract from 'extract-zip'
import CSVToJSON from 'csvtojson'
const __base = path.resolve('../export/.');
const now = new Date().toLocaleTimeString();
let debug = false
let apiError = false;

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

const krakenErrorsList = {
  EGeneral: { "Temporary lockout": 900000, "Internal error": 60000, "Too many requests": 60000 },
  EAPI: { "Invalid nonce": 100, "Rate limit exceeded": 60000 },
  EQuery: {},
  ESession: {},
  EOrder: { "Rate limit exceeded": 60000, },
  EService: {},
  EService: { "Busy": 60000 },
  ETrade: {}
}

/**
 *  *****************
 *  API REST METHOD
 *  *****************
 */
const logError = (error, func) => {
  console.log(
    `\x1b[35m%s\x1b[0m`, `[${now}]`,
    '\x1b[33m[ERROR]\x1b[0m',
    `\x1b[0m${func}:\x1b[0m\x1b[33m${error}\x1b[0m`
  );
}
const handleError = (error, func) => {
  if (error) {
    if (error.hasOwnProperty('body')) {
      logError(error.body.error[0], func)
      apiError = error.body.error[0].split(':') || false;
      if (apiError && typeof krakenErrorsList[apiError[0]] !== "undefined") {
        return {
          error: apiError[1],
          timeout: krakenErrorsList[apiError[0]][apiError[1]],
          response: { error, name: apiError[0] },
          func
        }
      }
      else {
        logError(error, func)
        return { error: apiError[1], timeout: false, response: { error, name: apiError[0] }, func }
      }
    }
    return error;
  }
}

// /SystemStatus
const getSystemStatus = async (req, reply) => {

  const apiKraken = initApiKraken()
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    let response = await apiKraken.systemStatus()
    return response
  } catch (error) {
    return handleError(error, "getSystemStatus")
  }
}

// /private/Balance
const getBalance = async (req, reply) => {

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    let response = await apiKraken.balance()
    return response
  } catch (error) {
    return handleError(error, "getBalance")
  }
}

// /private/TradeBalance
const getTradeBalance = async (req, reply) => {

  const { asset } = req.params

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    let response = await apiKraken.tradeBalance({ asset: asset })
    return response
  } catch (error) {
    return handleError(error, "getTradeBalance")
  }
}

// /private/OpenOrders
const getOpenOrders = async (req, reply) => {

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
    return handleError(error, "getOpenOrders")
  }
}

// /private/ClosedOrders
const getClosedOrders = async (req, reply) => {

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
    return handleError(error, "getClosedOrders")
  }
}

// /private/TradeVolume
const getTradeVolume = async (req, reply) => {

  const { pair } = req.params

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  if (typeof pair === undefined && !pair) {
    return { error: true, message: "Asset Pair error!" };
  }

  try {
    let response = await apiKraken.tradeVolume({ pair })
    return response
  } catch (error) {
    return handleError(error, "getTradeVolume")
  }
}

// /private/Ledgers
const getLedgers = async (req, reply) => {

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    let response = await apiKraken.ledgers()
    return response
  } catch (error) {
    return handleError(error, "getLedgers")
  }
}

// /private/TradesHistory
const getTradesHistory = async (req, reply) => {

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };


  try {
    let response = await apiKraken.tradesHistory()
    return response
  } catch (error) {
    return handleError(error, "getTradesHistory")
  }
}

// /private/OpenPositions
const getOpenPositions = async (req, reply) => {

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    let response = await apiKraken.openPositions({ docalcs: true })
    return response
  } catch (error) {
    return handleError(error, "getOpenPositions")
  }
}

// /private/AddExport
const addExport = async (req, reply) => {

  const { report, description, starttm } = req.params

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    let add = await apiKraken.addExport({ report, description, starttm })
    return add
  } catch (error) {
    return handleError(error, "addExport")
  }
}

// /private/statusExport
const statusExport = async (req, reply) => {

  const { report } = req.params

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    let status = await apiKraken.exportStatus({ report })
    return status
  } catch (error) {
    return handleError(error, "statusExport")
  }
}

// /private/retrieveExport
const retrieveExport = async (req, reply) => {
  const { id, type, userId } = req.params

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {

    let res = true;
    const filename = `${id}_${type}.zip`;
    const fullPath = `${__base}/${userId}/${id}/${filename}`
    const destPath = `${__base}/${userId}/${id}`

    let data = await apiKraken.retrieveExport({ id });
    const writeOpts = {
      encoding: "utf8",
      flag: "w",
      mode: 0o666
    };

    if (!existsSync(destPath)) {
      mkdirSync(destPath, { recursive: true })
    }

    writeFileSync(fullPath, data, writeOpts);

    if (existsSync(fullPath)) {
      await extractZip(fullPath, destPath)
      rmSync(fullPath); // Supprime le fichier zip
    } else {
      res = false;
    }

    return { filename, res, data }

  } catch (error) {
    return handleError(error, "retrieveExport")
  }
}

// /private/rmOldExport
const rmOldExport = async (req, reply) => {

  const { id, userId } = req.params

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    const fullPath = path.join(__base, userId, id)
    if (existsSync(fullPath)) rmSync(fullPath, { recursive: true })
    const res = await apiKraken.removeExport({ id, type: 'delete' });
    return res;

  } catch (error) {
    return handleError(error, "rmOldExport")
  }
}

// /private/readExport
const readExport = async (req, reply) => {

  const { id, type, userId } = req.params
  try {
    let data;

    const fullPath = `${__base}/${userId}/${id}/${type}.csv`

    if (existsSync(fullPath)) data = await CSVToJSON().fromFile(fullPath)
    else data = false;

    return data

  } catch (error) {
    return handleError(error, "readExport")
  }
}

// Verifie que le dossier de destination existe
const checkIfFolderExist = async (req, reply) => {
  const { id, type, userId } = req.params
  const destPath = `${__base}/${userId}/${id}/${type}.csv`
  return existsSync(destPath)
}

// Extrait le fichier zip passé en paramètres
const extractZip = async (source, target) => {
  try {
    return await extract(source, { dir: target });
  } catch (error) {
    return handleError(error, "checkIfFolderExist")
  }
}

/**
 *  *****************
 *  WEBSOCKET METHOD
 *  *****************
 */

// /private/OpenOrders
const getWsOpenOrders = async (connection, req, reply) => {


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
    handleError(error, "getWsOpenOrders")
    return error
  }
}

// /private/OwnTrades
const getWsOwnTrades = async (connection, req, reply) => {


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
    handleError(error, "getWsOwnTrades")
    return error
  }
}

// /private/TradeBalance WS
const getWsTradeBalance = async (connection, req, reply) => {


  let timer = null;
  let interval = 30000;

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
      handleError(error, "getWsTradeBalance")
    }
  }

  // Verifie la réponse si erreur
  const checkAndSendResult = async (data) => {
    if (
      data.hasOwnProperty('body') &&
      data.body.hasOwnProperty('error')
    ) {
      connection.socket.send(
        JSON.stringify({
          service: 'WsTradeBalance',
          error: true,
          message: data.body.error
        })
      )
      stopInterval()

      setTimeout(() => {
        timer = startInterval()
      }, 60000);

    }
    else {
      data['rate'] = Date.now()
      connection.socket.send(
        JSON.stringify({
          service: 'WsTradeBalance',
          error: false,
          data
        })
      )
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
      handleError(error, "getWsSystemStatus")
    }
  }

  // Verifie la réponse si erreur
  const checkAndSendResult = async (data) => {
    if (
      data.hasOwnProperty('body') &&
      data.body.hasOwnProperty('error')
    ) {
      connection.socket.send(
        JSON.stringify({
          service: 'WsSystemStatus',
          data: { error: data.body.error }
        })
      )
      stopInterval()

      setTimeout(() => {
        timer = startInterval()
      }, 60000);

    }
    else {
      connection.socket.send(
        JSON.stringify({
          service: 'WsSystemStatus',
          error: false,
          data
        })
      )
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

// /getWsKrakenStatus WS
const getWsKrakenStatus = async (connection, req, reply) => {

  let timer = null,
    interval = 2000;

  // Strat interval
  const startInterval = () => {
    timer = setInterval(() => {
      getWsKrakenStatusData()
    }, interval);
  }

  // Envoie la requête api
  const getWsKrakenStatusData = async () => {
    try {
      try {
        const statusKraken = await fetch(process.env.KRAKEN_STATUS_API_URL);
        let body = await statusKraken.json();
        checkAndSendResult(body)
      } catch (error) {
        console.error("[ERROR]:", error);
      }

    } catch (error) {
      handleError(error, "getWsKrakenStatus")
    }
  }

  // Verifie la réponse si erreur
  const checkAndSendResult = async (data) => {
    if (!data) {
      connection.socket.send(
        JSON.stringify({
          service: 'WsKrakenStatus',
          data: { error: true, response: data }
        })
      )
      stopInterval()

      setTimeout(() => {
        timer = startInterval()
      }, 60000);

    }
    else {
      connection.socket.send(
        JSON.stringify({
          service: 'WsKrakenStatus',
          error: false,
          data
        })
      )
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
  getWsKrakenStatus
};
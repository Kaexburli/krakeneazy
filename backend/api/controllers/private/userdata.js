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

// checkApiKeyPermissions
const checkApiKeyPermissions = async (apikeys) => {
  const apiKraken = initApiKraken([apikeys], true)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  const payload = {
    pair: 'XXBTZUSD',
    type: "buy",
    ordertype: 'limit',
    price: '45000.1',
    volume: '2.1234',
    leverage: '2:1',
    'close[ordertype]': 'stop-loss-limit',
    'close[price]': '38000',
    'close[price2]': '36000',
    validate: true
  }

  try {
    const response = {
      status: await apiKraken.systemStatus(),
      balance: await apiKraken.balance(),
      openOrders: await apiKraken.openOrders(),
      closedOrders: await apiKraken.closedOrders(),
      ledgers: await apiKraken.ledgers(),
      tradesHistory: await apiKraken.tradesHistory(),
      openPositions: await apiKraken.openPositions(),
      addOrder: await apiKraken.addOrder(payload),
      exportStatus: await apiKraken.exportStatus({ report: 'trades' }),
      token: await apiKraken.getWebSocketsToken()
    }

    return response
  } catch (error) {
    return handleError(error, "checkApiKeyPermissions")
  }
}

// /SystemStatus
const getSystemStatus = async (req, _reply) => {

  const apiKraken = initApiKraken()
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    const response = await apiKraken.systemStatus()
    return response
  } catch (error) {
    return handleError(error, "getSystemStatus")
  }
}

// /private/Balance
const getBalance = async (req, _reply) => {

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    const response = await apiKraken.balance()
    return response
  } catch (error) {
    return handleError(error, "getBalance")
  }
}

// /private/TradeBalance
const getTradeBalance = async (req, _reply) => {

  const { asset } = req.params

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    const response = await apiKraken.tradeBalance({ asset: asset })
    return response
  } catch (error) {
    return handleError(error, "getTradeBalance")
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
    const response = await apiKraken.openOrders(params)
    return response
  } catch (error) {
    return handleError(error, "getOpenOrders")
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
    const response = await apiKraken.closedOrders(params)
    return response
  } catch (error) {
    return handleError(error, "getClosedOrders")
  }
}

// /private/TradeVolume
const getTradeVolume = async (req, _reply) => {

  const { pair } = req.params

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  if (typeof pair === undefined && !pair) {
    return { error: true, message: "Asset Pair error!" };
  }

  try {
    const response = await apiKraken.tradeVolume({ pair })
    return response
  } catch (error) {
    return handleError(error, "getTradeVolume")
  }
}

// /private/Ledgers
const getLedgers = async (req, _reply) => {

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    const response = await apiKraken.ledgers()
    return response
  } catch (error) {
    return handleError(error, "getLedgers")
  }
}

// /private/TradesHistory
const getTradesHistory = async (req, _reply) => {

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };


  try {
    const response = await apiKraken.tradesHistory()
    return response
  } catch (error) {
    return handleError(error, "getTradesHistory")
  }
}

// /private/OpenPositions
const getOpenPositions = async (req, _reply) => {

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };

  try {
    const response = await apiKraken.openPositions({ docalcs: true })

    if (response) {
      let txids = Object.keys(response)
      const trades = await apiKraken.queryTrades({ txid: txids, trades: true })
      if (trades) {
        for (const id of txids) {
          response[id]['price'] = trades[id].price
          response[id]['postxid'] = trades[id].postxid
        }
      }
    }

    return response
  } catch (error) {
    return handleError(error, "getOpenPositions")
  }
}

// /AddOrder
const AddOrder = async (req, _reply) => {

  const { body } = req || false;

  const { apikeys } = req.user || false;
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: "API Key error!" };
  try {
    const payload = {
      pair: body.pair,
      type: body.type,
      ordertype: body.ordertype,
      price: body.price,
      volume: body.volume,
      leverage: body.leverage === "0" ? "none" : body.leverage,
      oflags: body.type === 'sell' ? body.devise === 'quote' ? 'fciq' : 'fcib' : body.devise === 'base' ? 'fcib' : 'fciq',
      validate: body.dry
    }

    if (body.postonly) payload.oflags = [payload.oflags, "post"].join(',');
    if (body.condtype) {
      payload['close[ordertype]'] = body.condtype || false
      payload['close[price]'] = body.condprice || false
      payload['close[price2]'] = body.condtotal || false
    }

    const response = await apiKraken.addOrder(payload);
    return response
  } catch (error) {
    return handleError(error, "AddOrder")
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
    return handleError(error, "addExport")
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
    return handleError(error, "statusExport")
  }
}

// /private/retrieveExport
const retrieveExport = async (req, _reply) => {
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
const rmOldExport = async (req, _reply) => {

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
const readExport = async (req, _reply) => {

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
const checkIfFolderExist = async (req, _reply) => {
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
    handleError(error, "getWsOpenOrders")
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
    handleError(error, "getWsOwnTrades")
    return error
  }
}

// /private/TradeBalance WS
const getWsTradeBalance = async (connection, req, reply) => {


  let timer = null;
  let interval = 15000;

  // Strat interval
  const startInterval = () => {
    timer = setInterval(() => {
      getWsTradeBalanceData(req, reply)
    }, interval);
  }

  // Envoie la requête api
  const getWsTradeBalanceData = async (req, reply) => {
    try {

      const response = await getTradeBalance(req, reply)
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
      const response = await getSystemStatus(req, reply)
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
const getWsKrakenStatus = async (connection, _req, _reply) => {

  let timer = null,
    interval = 60000;

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
  checkApiKeyPermissions,

  // REST MEthod
  getBalance,
  getTradeBalance,
  getOpenOrders,
  getClosedOrders,
  getTradeVolume,
  getLedgers,
  getTradesHistory,
  getOpenPositions,
  AddOrder,
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
// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import fetch from 'node-fetch'
import { existsSync, rmSync, writeFileSync, mkdirSync } from 'fs'
import * as path from 'path'

import { Kraken } from 'node-kraken-api'
import extract from 'extract-zip'
import CSVToJSON from 'csvtojson'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
const __base = path.resolve('../export/.')
const now = new Date().toLocaleTimeString()
let apiError = false

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------

/**
 *  *****************
 *  KRAKEN API
 *  *****************
 */

// randomApiKey
const randomApiKey = (num) => {
  return Math.floor(Math.random() * num)
}

// NonceGenerator
const NonceGenerator = (() => {
  let prev = -1
  let next = -1
  return Object.freeze(() => {
    next = Date.now()
    if (next <= prev) next = prev + 1
    prev = next
    return next
  })
})()

// Instanciation du module kraken API
const initApiKraken = (apikeys = false) => {
  if (!apikeys || typeof apikeys === 'undefined' || !apikeys.length) {
    return new Kraken({ gennonce: () => NonceGenerator() })
  }

  const shuffle = randomApiKey(apikeys.length)
  if (typeof apikeys[shuffle] === 'undefined') {
    return new Kraken({ gennonce: () => NonceGenerator() })
  }

  const pubKey = apikeys[shuffle].apiKeyPublic || false
  const privKey = apikeys[shuffle].apiKeyPrivate || false

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
  EGeneral: {
    'Temporary lockout': 900000,
    'Internal error': 60000,
    'Too many requests': 60000
  },
  EAPI: { 'Invalid nonce': 100, 'Rate limit exceeded': 60000 },
  EQuery: {},
  ESession: {},
  EOrder: { 'Rate limit exceeded': 60000 },
  EService: { Busy: 60000 },
  ETrade: {}
}

/**
 *  *****************
 *  API REST METHOD
 *  *****************
 */
const logError = (error, func) => {
  console.log(
    '\x1b[35m%s\x1b[0m',
    `[${now}]`,
    '\x1b[33m[ERROR]\x1b[0m',
    `\x1b[0m${func}:\x1b[0m\x1b[33m${error}\x1b[0m`
  )
}
const handleError = (error, func, req = false) => {
  console.log('================================== handleError')
  if (error) {
    if (Object.prototype.hasOwnProperty.call(error, 'body')) {
      logError(error.body.error[0], func)
      apiError = error.body.error[0].split(':') || false
      if (apiError && typeof krakenErrorsList[apiError[0]] !== 'undefined') {
        return {
          error: apiError[1],
          timeout: krakenErrorsList[apiError[0]][apiError[1]],
          response: { error, name: apiError[0] },
          func
        }
      } else {
        logError(error, func)
        return {
          error: apiError[1],
          timeout: false,
          response: { error, name: apiError[0] },
          func
        }
      }
    }

    if (req) req.log.error(error)

    return error
  }
}

// checkApiKeyPermissions
const checkApiKeyPermissions = async (apikeys) => {
  const apiKraken = initApiKraken([apikeys], true)
  if (!apiKraken) return { error: true, message: 'API Key error!' }

  // Fake Data for test apiKey
  const payload = {
    pair: 'XXBTZUSD',
    type: 'buy',
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
    return handleError(error, 'checkApiKeyPermissions')
  }
}

// /SystemStatus
const getSystemStatus = async (req, _reply) => {
  const apiKraken = initApiKraken()
  if (!apiKraken) return { error: true, message: 'API Key error!' }

  try {
    const response = await apiKraken.systemStatus()
    return response
  } catch (error) {
    return handleError(error, 'getSystemStatus', req)
  }
}

// /private/Balance
const getBalance = async (req, _reply) => {
  const { apikeys } = req.user || false
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: 'API Key error!' }

  try {
    const response = await apiKraken.balance()
    return response
  } catch (error) {
    return handleError(error, 'getBalance', req)
  }
}

// /private/TradeBalance
const getTradeBalance = async (req, _reply) => {
  const { asset } = req.params

  const { apikeys } = req.user || false
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: 'API Key error!' }

  try {
    const response = await apiKraken.tradeBalance({ asset: asset })
    return response
  } catch (error) {
    return handleError(error, 'getTradeBalance', req)
  }
}

// /private/OpenOrders
const getOpenOrders = async (req, _reply) => {
  const { trades, userref } = req.params

  const { apikeys } = req.user || false
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: 'API Key error!' }

  let params

  if (typeof userref !== 'undefined' && Number.isInteger(userref)) {
    params = { trades, userref }
  } else {
    params = { trades }
  }

  try {
    const response = await apiKraken.openOrders(params)
    return response
  } catch (error) {
    return handleError(error, 'getOpenOrders', req)
  }
}

// /private/ClosedOrders
const getClosedOrders = async (req, _reply) => {
  const { trades, ofs, start } = req.params // end, userref, closetime

  const { apikeys } = req.user || false
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: 'API Key error!' }

  let params

  if (typeof ofs !== 'undefined' && Number.isInteger(Number(ofs))) {
    params = { trades, ofs, start }
  } else {
    params = { trades }
  }

  try {
    const response = await apiKraken.closedOrders(params)
    return response
  } catch (error) {
    return handleError(error, 'getClosedOrders', req)
  }
}

// /private/TradeVolume
const getTradeVolume = async (req, _reply) => {
  const { pair } = req.params

  const { apikeys } = req.user || false
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: 'API Key error!' }

  if (typeof pair === 'undefined' && !pair) {
    return { error: true, message: 'Asset Pair error!' }
  }

  try {
    const response = await apiKraken.tradeVolume({ pair })
    return response
  } catch (error) {
    return handleError(error, 'getTradeVolume', req)
  }
}

// /private/Ledgers
const getLedgers = async (req, _reply) => {
  const { apikeys } = req.user || false
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: 'API Key error!' }

  try {
    const response = await apiKraken.ledgers()
    return response
  } catch (error) {
    return handleError(error, 'getLedgers', req)
  }
}

// /private/TradesHistory
const getTradesHistory = async (req, _reply) => {
  const { apikeys } = req.user || false
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: 'API Key error!' }

  try {
    const response = await apiKraken.tradesHistory()
    return response
  } catch (error) {
    return handleError(error, 'getTradesHistory', req)
  }
}

// /private/OpenPositions
const getOpenPositions = async (req, _reply) => {
  const { apikeys } = req.user || false
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: 'API Key error!' }

  try {
    const response = await apiKraken.openPositions({ docalcs: true })

    if (response) {
      const txids = Object.keys(response)
      const trades = await apiKraken.queryTrades({ txid: txids, trades: true })
      if (trades) {
        for (const id of txids) {
          response[id].price = trades[id].price
          response[id].postxid = trades[id].postxid
        }
      }
    }

    return response
  } catch (error) {
    return handleError(error, 'getOpenPositions', req)
  }
}

// /AddOrder
const AddOrder = async (req, _reply) => {
  const { body } = req || false

  const { apikeys } = req.user || false
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: 'API Key error!' }
  try {
    const payload = {
      pair: body.pair,
      type: body.type,
      ordertype: body.ordertype,
      price: body.price,
      volume: body.volume,
      leverage: body.leverage === '0' ? 'none' : body.leverage,
      oflags:
        body.type === 'sell'
          ? body.devise === 'quote'
            ? 'fciq'
            : 'fcib'
          : body.devise === 'base'
            ? 'fcib'
            : 'fciq',
      validate: body.dry
    }

    if (body.postonly) payload.oflags = [payload.oflags, 'post'].join(',')
    if (body.condtype) {
      payload['close[ordertype]'] = body.condtype || false
      payload['close[price]'] = body.condprice || false
      payload['close[price2]'] = body.condtotal || false
    }

    const response = await apiKraken.addOrder(payload)
    return response
  } catch (error) {
    return handleError(error, 'AddOrder', req)
  }
}

// /private/AddExport
const addExport = async (req, _reply) => {
  const { report, description, starttm } = req.params
  const { apikeys } = req.user || false
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: 'API Key error!' }

  try {
    const add = await apiKraken.addExport({ report, description, starttm })
    return add
  } catch (error) {
    return handleError(error, 'addExport', req)
  }
}

// /private/statusExport
const statusExport = async (req, _reply) => {
  const { report } = req.params

  const { apikeys } = req.user || false
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: 'API Key error!' }

  try {
    const status = await apiKraken.exportStatus({ report })
    return status
  } catch (error) {
    return handleError(error, 'statusExport', req)
  }
}

// /private/retrieveExport
const retrieveExport = async (req, _reply) => {
  const { id, type, userId } = req.params

  const { apikeys } = req.user || false
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: 'API Key error!' }

  try {
    let res = true
    const filename = `${id}_${type}.zip`
    const fullPath = `${__base}/${userId}/${id}/${filename}`
    const destPath = `${__base}/${userId}/${id}`

    const data = await apiKraken.retrieveExport({ id })
    const writeOpts = {
      encoding: 'utf8',
      flag: 'w',
      mode: 0o666
    }

    if (!existsSync(destPath)) {
      mkdirSync(destPath, { recursive: true })
    }

    writeFileSync(fullPath, data, writeOpts)

    if (existsSync(fullPath)) {
      await extractZip(fullPath, destPath)
      rmSync(fullPath) // Supprime le fichier zip
    } else {
      res = false
    }

    return { filename, res, data }
  } catch (error) {
    return handleError(error, 'retrieveExport', req)
  }
}

// /private/rmOldExport
const rmOldExport = async (req, _reply) => {
  const { id, userId } = req.params

  const { apikeys } = req.user || false
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: 'API Key error!' }

  try {
    const fullPath = path.join(__base, userId, id)
    if (existsSync(fullPath)) rmSync(fullPath, { recursive: true })
    const res = await apiKraken.removeExport({ id, type: 'delete' })
    return res
  } catch (error) {
    return handleError(error, 'rmOldExport', req)
  }
}

// /private/readExport
const readExport = async (req, _reply) => {
  const { id, type, userId } = req.params
  try {
    let data

    const fullPath = `${__base}/${userId}/${id}/${type}.csv`

    if (existsSync(fullPath)) data = await CSVToJSON().fromFile(fullPath)
    else data = false

    return data
  } catch (error) {
    return handleError(error, 'readExport', req)
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
    return await extract(source, { dir: target })
  } catch (error) {
    return handleError(error, 'checkIfFolderExist')
  }
}

/**
 *  *****************
 *  WEBSOCKET METHOD
 *  *****************
 */

// /private/OpenOrders
const getWsOpenOrders = async (connection, req, _reply) => {
  if (!req.user.isLogged) {
    req.log.error('ERROR: [getWsOpenOrders] - Missing isLogged!')
    return false
  }

  if (!req.user.token) {
    req.log.error('ERROR: [getWsOpenOrders] - Missing token!')
    return false
  }

  const { apikeys } = req.user
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: 'API Key error!' }

  try {
    const { token } = await apiKraken.getWebSocketsToken()

    const openorders = await apiKraken.ws
      .openOrders({ token: token, ratecounter: true })
      .on('update', (update, sequence) => {
        req.log.info({ update, sequence }, '[UPDATE openorders]')
        connection.socket.send(
          JSON.stringify({ service: 'OpenOrders', data: update, sequence })
        )
      })
      .on('token', (token) => {
        req.log.info({ token }, '[TOKEN openorders]')
      })
      .on('status', (status) => {
        req.log.info({ status }, '[STATUS openorders]')
        connection.socket.send(
          JSON.stringify({ service: 'OpenOrders', data: false, status: status })
        )
      })
      .on('error', (error, sequence) => {
        req.log.error({ error, sequence, openorders }, '[ERROR openorders]')
        connection.socket.send(JSON.stringify(error))
      })
      .subscribe()

    connection.socket.on('close', async (message) => {
      openorders.unsubscribe()
    })
  } catch (error) {
    handleError(error, 'getWsOpenOrders', req)
    return error
  }
}

// /private/OwnTrades
const getWsOwnTrades = async (connection, req, _reply) => {
  if (!req.user.isLogged) {
    req.log.error('ERROR: [getWsOwnTrades] - Missing isLogged!')
    return false
  }

  if (!req.user.token) {
    req.log.error('ERROR: [getWsOwnTrades] - Missing token!')
    return false
  }

  const { apikeys } = req.user || false
  const apiKraken = initApiKraken(apikeys)
  if (!apiKraken) return { error: true, message: 'API Key error!' }

  try {
    const { token } = await apiKraken.getWebSocketsToken()

    const owntrades = await apiKraken.ws
      .ownTrades({ token: token, ratecounter: true })
      .on('update', (update, sequence) => {
        req.log.info({ update, sequence }, '[UPDATE owntrades]')
        connection.socket.send(
          JSON.stringify({ service: 'token', data: update, sequence })
        )
      })
      .on('token', (token) => {
        req.log.info({ token }, '[TOKEN owntrades]')
      })
      .on('status', (status) => {
        req.log.info({ status }, '[STATUS owntrades]')
        connection.socket.send(
          JSON.stringify({ service: 'OwnTrades', data: false, status: status })
        )
      })
      .on('error', (error, sequence) => {
        req.log.error({ error, sequence, owntrades }, '[ERROR owntrades]')
        connection.socket.send(JSON.stringify(error))
      })
      .subscribe()

    connection.socket.on('close', async (_message) => {
      owntrades.unsubscribe()
    })
  } catch (error) {
    handleError(error, 'getWsOwnTrades', req)
    return error
  }
}

// /private/TradeBalance WS
const getWsTradeBalance = async (connection, req, reply) => {
  if (!req.user.isLogged) {
    req.log.error('ERROR: [getWsTradeBalance] - Missing isLogged!')
    return false
  }

  if (!req.user.token) {
    req.log.error('ERROR: [getWsTradeBalance] - Missing token!')
    return false
  }

  let timer = null
  const interval = 15000

  // Strat interval
  const startInterval = () => {
    timer = setInterval(() => {
      getWsTradeBalanceData(req, reply)
    }, interval)
  }

  // Envoie la requête api
  const getWsTradeBalanceData = async (req, reply) => {
    try {
      const response = await getTradeBalance(req, reply)
      checkAndSendResult(response)
    } catch (error) {
      handleError(error, 'getWsTradeBalance', req)
    }
  }

  // Verifie la réponse si erreur
  const checkAndSendResult = async (data) => {
    if (
      Object.prototype.hasOwnProperty.call(data, 'body') &&
      Object.prototype.hasOwnProperty.call(data.body, 'error')
    ) {
      req.log.error({ data }, '[ERROR getWsTradeBalance]')

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
      }, 60000)
    } else {
      data.rate = Date.now()
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
  let timer = null
  const interval = 2000

  // Strat interval
  const startInterval = () => {
    timer = setInterval(() => {
      getWsSystemStatusData()
    }, interval)
  }

  // Envoie la requête api
  const getWsSystemStatusData = async () => {
    try {
      const response = await getSystemStatus(req, reply)
      checkAndSendResult(response)
    } catch (error) {
      handleError(error, 'getWsSystemStatus', req)
    }
  }

  // Verifie la réponse si erreur
  const checkAndSendResult = async (data) => {
    if (
      Object.prototype.hasOwnProperty.call(data, 'body') &&
      Object.prototype.hasOwnProperty.call(data.body, 'error')
    ) {
      req.log.error({ data }, '[ERROR getWsSystemStatus]')

      connection.socket.send(
        JSON.stringify({
          service: 'WsSystemStatus',
          data: { error: data.body.error }
        })
      )
      stopInterval()

      setTimeout(() => {
        timer = startInterval()
      }, 60000)
    } else {
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
const getWsKrakenStatus = async (connection, req, _reply) => {
  let timer = null
  const interval = 60000

  // Strat interval
  const startInterval = () => {
    timer = setInterval(() => {
      getWsKrakenStatusData()
    }, interval)
  }

  // Envoie la requête api
  const getWsKrakenStatusData = async () => {
    try {
      const statusKraken = await fetch(process.env.KRAKEN_STATUS_API_URL)
      const body = await statusKraken.json()

      checkAndSendResult(body)
    } catch (error) {
      handleError(error, 'getWsKrakenStatus', req)
    }
  }

  // Verifie la réponse si erreur
  const checkAndSendResult = async (data) => {
    if (!data) {
      req.log.error({ data }, '[ERROR getWsKrakenStatus]')

      connection.socket.send(
        JSON.stringify({
          service: 'WsKrakenStatus',
          data: { error: true, response: data }
        })
      )
      stopInterval()

      setTimeout(() => {
        timer = startInterval()
      }, 60000)
    } else {
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
}

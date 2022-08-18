// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { Kraken } from 'node-kraken-api'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
// Instanciation du module kraken API
const api = new Kraken()

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
const getOhlc = async (req, reply) => {
  if (
    !req.headers['x-webapp-header'] ||
    req.headers['x-webapp-header'] !== process.env.SITE_NAME
  ) {
    req.log.warn('[WARN:getOhlc] missing x-webapp-header!')
    return reply.redirect(500, '/')
  }

  try {
    const { pair, interval } = req.params
    const response = await api.ohlc({
      pair,
      interval
    })
    const ohlcResponse = await new Promise((resolve) =>
      ohlcFormat(response, resolve)
    )
    return ohlcResponse
  } catch (error) {
    req.log.error({ error }, '[ERROR:getOhlc]')
    return error
  }
}

const ohlcFormat = (datas, resolve) => {
  const ohlc = []
  const asset = datas ? Object.keys(datas) : false
  datas = datas[asset[0]]
  const dataLength = datas.length
  if (asset && dataLength > 1) {
    datas.forEach((el, k) => {
      const ohlcTmp = JSON.parse('{}')
      ohlcTmp.time = el[0]
      ohlcTmp.open = el[1]
      ohlcTmp.high = el[2]
      ohlcTmp.low = el[3]
      ohlcTmp.close = el[4]
      ohlcTmp.vwap = el[5]
      ohlcTmp.volume = el[6]
      ohlcTmp.trades = el[7]

      ohlc.push(ohlcTmp)

      if (k + 1 === dataLength) {
        resolve(ohlc)
      }
    })
  }
}

export { getOhlc }

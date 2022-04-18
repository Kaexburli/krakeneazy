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

const getOhlc = async (req, reply) => {
  if (
    !req.headers['X-Webapp-Header'] ||
    req.headers['X-Webapp-Header'] !== process.env.SITE_NAME
  ) {
    return reply.redirect('/')
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
    console.log('[ERROR:getOhlc]', error)
    return error
  }
}

export { getOhlc }

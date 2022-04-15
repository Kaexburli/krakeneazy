import {
  Kraken
} from 'node-kraken-api'

// Instanciation du module kraken API
const api = new Kraken()

const ohlcFormat = (datas, resolve) => {
  let ohlc = []
  let asset = (datas) ? Object.keys(datas) : false;
  datas = datas[asset[0]];
  const dataLength = datas.length
  if (asset && dataLength > 1) {
    datas.forEach((el, k) => {

      let ohlc_tmp = JSON.parse('{}')
      ohlc_tmp['time'] = el[0]
      ohlc_tmp['open'] = el[1]
      ohlc_tmp['high'] = el[2]
      ohlc_tmp['low'] = el[3]
      ohlc_tmp['close'] = el[4]
      ohlc_tmp['vwap'] = el[5]
      ohlc_tmp['volume'] = el[6]
      ohlc_tmp['trades'] = el[7]

      ohlc.push(ohlc_tmp)

      if ((k + 1) === dataLength) {
        resolve(ohlc)
      }

    });
  }
}

const getOhlc = async (req, reply) => {
  if (!req.headers['x-webapp-header'] || req.headers['x-webapp-header'] !== "krakeneazy")
    reply.redirect('/')

  try {
    const {
      pair,
      interval
    } = req.params
    let response = await api.ohlc({
      pair,
      interval
    })
    let ohlc_response = await new Promise(resolve => ohlcFormat(response, resolve));
    return ohlc_response;
  } catch (error) {
    console.log('[ERROR:getOhlc]', error);
    return error;
  }
}

export {
  getOhlc
};
import { Kraken } from 'node-kraken-api'

// Instanciation du module kraken API
const api = new Kraken()

const getTicker = async (req, reply) => {
  if (!req.headers['x-webapp-header'] || req.headers['x-webapp-header'] !== "krakeneazy")
    reply.redirect('/')

  try {
    const { pair } = req.params
    let response = await api.ticker({ pair: pair })
    reply.send(response)
  } catch (error) {
    console.error('[ERROR:getTicker]', error);
    return error;
  }
}

export {
  getTicker
};
import { Kraken } from 'node-kraken-api'

// Instanciation du module kraken API
const api = new Kraken()

const getTicker = async (req, reply) => {
  const { pair } = req.params
  let response = await api.ticker({ pair: pair })
  reply.send(response)
}

export {
  getTicker
};
import { Kraken } from 'node-kraken-api'

// Instanciation du module kraken API
const api = new Kraken()

const getTrades = async (req, reply) => {
  try {
    const { pair } = req.params
    let response = await api.trades({ pair: pair })
    reply.send(response)
  } catch (error) {
    console.error('######################" [ERROR:getTrades]', error)
  }
}

export {
  getTrades
};
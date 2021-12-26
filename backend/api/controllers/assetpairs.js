import { Kraken } from 'node-kraken-api'

// Instanciation du module kraken API
const api = new Kraken()

const getAssetPairs = async (req, reply) => {
  let response = await api.assetPairs()
  reply.send(response)
}

export {
  getAssetPairs
};
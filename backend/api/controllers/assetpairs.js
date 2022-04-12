import { Kraken } from 'node-kraken-api'

// Instanciation du module kraken API
const api = new Kraken()

const getAssetPairs = async (req, reply) => {
  try {
    let response = await api.assetPairs()
    reply.send(response)
  } catch (error) {
    console.log('[ERROR:getAssetPairs]', error)
  }
}

export {
  getAssetPairs
};
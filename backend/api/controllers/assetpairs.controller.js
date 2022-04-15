import { Kraken } from 'node-kraken-api'

// Instanciation du module kraken API
const api = new Kraken()

const getAssetPairs = async (req, reply) => {
  if (!req.headers['x-webapp-header'] || req.headers['x-webapp-header'] !== "krakeneazy")
    reply.redirect('/')

  try {
    let response = await api.assetPairs()
    reply.send(response)
  } catch (error) {
    console.log('[ERROR:getAssetPairs]', error);
    return error;
  }
}

export {
  getAssetPairs
};
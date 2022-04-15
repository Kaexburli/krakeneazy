import { Kraken } from 'node-kraken-api'

// Instanciation du module kraken API
const api = new Kraken()

const getAssets = async (req, reply) => {
  if (!req.headers['x-webapp-header'] || req.headers['x-webapp-header'] !== "krakeneazy")
    reply.redirect('/')

  try {
    let response = await api.assets()
    return response
  } catch (error) {
    return error;
  }
}

export {
  getAssets
};
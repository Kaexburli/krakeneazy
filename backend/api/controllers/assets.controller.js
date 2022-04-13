import { Kraken } from 'node-kraken-api'

// Instanciation du module kraken API
const api = new Kraken()

const getAssets = async (req, reply) => {
  try {
    let response = await api.assets()
    return response
  } catch (error) {
    return error
  }
}

export {
  getAssets
};
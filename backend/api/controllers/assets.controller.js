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
const getAssets = async (req, reply) => {
  if (
    !req.headers['X-Webapp-Header'] ||
    req.headers['X-Webapp-Header'] !== process.env.SITE_NAME
  ) {
    return reply.redirect('/')
  }

  try {
    const response = await api.assets()
    return response
  } catch (error) {
    return error
  }
}

export { getAssets }

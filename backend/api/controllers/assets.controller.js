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
    !req.headers['x-webapp-header'] ||
    req.headers['x-webapp-header'] !== process.env.SITE_NAME
  ) {
    req.log.warn('[WARN:getAssets] missing x-webapp-header!')
    return reply.redirect('/')
  }

  try {
    const response = await api.assets()
    return response
  } catch (error) {
    req.log.error({ error }, '[ERROR:getAssets]')
    return error
  }
}

export { getAssets }

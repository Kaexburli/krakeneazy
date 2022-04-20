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
const getAssetPairs = async (req, reply) => {
  if (
    !req.headers['x-webapp-header'] ||
    req.headers['x-webapp-header'] !== process.env.SITE_NAME
  ) {
    req.log.warn('[WARN:getAssetPairs] missing x-webapp-header!')
    return reply.redirect('/')
  }

  try {
    const response = await api.assetPairs()
    reply.send(response)
  } catch (error) {
    req.log.error({ error }, '[ERROR:getAssetPairs]')
    return error
  }
}

export { getAssetPairs }

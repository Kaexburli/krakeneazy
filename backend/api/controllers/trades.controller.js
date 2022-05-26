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
const getTrades = async (req, reply) => {
  if (
    !req.headers['x-webapp-header'] ||
    req.headers['x-webapp-header'] !== process.env.SITE_NAME
  ) {
    req.log.warn('[WARN:getTrades] missing x-webapp-header!')
    return reply.redirect(500, '/')
  }

  try {
    const { pair } = req.params
    const response = await api.trades({
      pair: pair
    })
    reply.send(response)
  } catch (error) {
    req.log.error({ error }, '[ERROR:getTrades]')
    return error
  }
}

export { getTrades }

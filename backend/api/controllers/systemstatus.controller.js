// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { Kraken } from 'node-kraken-api'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
const api = new Kraken()

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
const getSystemStatus = async (req, reply) => {
  if (
    !req.headers['x-webapp-header'] ||
    req.headers['x-webapp-header'] !== process.env.SITE_NAME
  ) {
    req.log.warn('[WARN:getSystemStatus] missing x-webapp-header!')
    return reply.redirect('/')
  }

  try {
    const response = await api.systemStatus()
    reply.send(response)
  } catch (error) {
    req.log.error({ error }, '[ERROR:getSystemStatus]')
    return error
  }
}

export { getSystemStatus }

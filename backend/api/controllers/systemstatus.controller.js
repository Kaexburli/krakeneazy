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
    reply.redirect('/')
  }

  try {
    const response = await api.systemStatus()
    reply.send(response)
  } catch (error) {
    console.log('[ERROR:getSystemStatus]', error)
    return error
  }
}

export { getSystemStatus }

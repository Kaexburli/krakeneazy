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
    !req.headers['X-Webapp-Header'] ||
    req.headers['X-Webapp-Header'] !== process.env.SITE_NAME
  ) {
    return reply.redirect('/')
  }

  try {
    const { pair } = req.params
    const response = await api.trades({
      pair: pair
    })
    reply.send(response)
  } catch (error) {
    console.error('[ERROR:getTrades]', error)
    return error
  }
}

export { getTrades }

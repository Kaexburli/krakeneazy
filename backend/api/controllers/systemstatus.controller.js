import { Kraken } from 'node-kraken-api'

const api = new Kraken()

const getSystemStatus = async (req, reply) => {
  if (!req.headers['x-webapp-header'] || req.headers['x-webapp-header'] !== "krakeneazy")
    reply.redirect('/')

  try {
    let response = await api.systemStatus()
    reply.send(response)
  } catch (error) {
    console.log('[ERROR:getSystemStatus]', error)
  }
}

export {
  getSystemStatus
};
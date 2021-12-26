import { Kraken } from 'node-kraken-api'

// Instanciation du module kraken API
const API_KEY = process.env.API_KEY
const API_PRIV = process.env.API_PRIV

const api = new Kraken({
  key: API_KEY,
  secret: API_PRIV,
  tier: '10'
})

const getSystemStatus = async (req, reply) => {
  let response = await api.systemStatus()
  reply.send(response)
}

export {
  getSystemStatus
};
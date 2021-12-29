import { Kraken } from 'node-kraken-api'

const api = new Kraken()

const getSystemStatus = async (req, reply) => {
  try {
    let response = await api.systemStatus()
    reply.send(response)
  } catch (error) {
    console.log('######################" [ERROR:getSystemStatus]', error)
  }
}

export {
  getSystemStatus
};
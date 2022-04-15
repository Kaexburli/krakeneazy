import {
  Kraken
} from 'node-kraken-api'

// Instanciation du module kraken API
const api = new Kraken()

const getTrades = async (req, reply) => {
  if (!req.headers['x-webapp-header'] || req.headers['x-webapp-header'] !== "krakeneazy")
    reply.redirect('/')

  try {
    const {
      pair
    } = req.params
    let response = await api.trades({
      pair: pair
    })
    reply.send(response)
  } catch (error) {
    console.error('[ERROR:getTrades]', error);
    return error;
  }
}

export {
  getTrades
};
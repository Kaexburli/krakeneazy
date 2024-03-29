import fp from 'fastify-plugin'
import mongoose from 'mongoose'
import User from '../models/user.model.js'
import UserSettings from '../models/userSettings.model.js'
import UserKraken from '../models/userKraken.model.js'
import UserPriceAlerts from '../models/userPriceAlerts.model.js'

const models = {
  User,
  UserSettings,
  UserKraken,
  UserPriceAlerts
}

const ConnectDB = async (fastify, options, done) => {
  try {
    mongoose
      .connect(options.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      .then(() => {
        fastify.decorate('db', { models })
        done()
      })
  } catch (error) {
    console.error(error)
  }

  mongoose.connection.on('connected', () => {
    fastify.log.info({ actor: 'MongoDB' }, 'MongoDB connected!')
  })

  mongoose.connection.on('disconnected', () => {
    fastify.log.error({ actor: 'MongoDB' }, 'MongoDB disconnected!')
  })
}
export default fp(ConnectDB)

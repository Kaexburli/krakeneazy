import fp from 'fastify-plugin';
import mongoose from 'mongoose';
import User from '../models/user';
import UserSettings from '../models/userSettings';
import UserKraken from '../models/userKraken';
import UserPriceAlerts from '../models/userPriceAlerts';

const models = {
  User,
  UserSettings,
  UserKraken,
  UserPriceAlerts
};

const ConnectDB = async (fastify, options, done) => {
  try {
    const db = await mongoose.connect(options.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    // decorates fastify with our model
    fastify.decorate('db', { models });
    done();
  } catch (error) {
    console.error(error);
  }

  mongoose.connection.on('connected', () => {
    fastify.log.info({ actor: 'MongoDB' }, 'connected');
  });

  mongoose.connection.on('disconnected', () => {
    fastify.log.error({ actor: 'MongoDB' }, 'disconnected');
  });

};
export default fp(ConnectDB);
import fp from 'fastify-plugin';
import mongoose from 'mongoose';
import User from '../models/user';
import UserSettings from '../models/userSettings';
import UserKraken from '../models/userKraken';

const models = {
  User,
  UserSettings,
  UserKraken
};

const ConnectDB = async (fastify, options) => {
  try {
    mongoose.connection.on('connected', () => {
      fastify.log.info({ actor: 'MongoDB' }, 'connected');
    });
    mongoose.connection.on('disconnected', () => {
      fastify.log.error({ actor: 'MongoDB' }, 'disconnected');
    });
    const db = await mongoose.connect(options.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    // decorates fastify with our model
    fastify.decorate('db', { models });
  } catch (error) {
    console.error(error);
  }
};
export default fp(ConnectDB);
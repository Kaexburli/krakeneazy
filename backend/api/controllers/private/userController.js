
import User from '../../models/user';
import { sendRegisterEmail } from '../Mailer.js'

export const asyncVerifyJWTCtrl = async (req, reply) => {

  try {
    if (!req.headers.authorization) {
      throw new Error('No token was sent');
    }
    const token = req.headers.authorization.replace('Bearer ', '');
    const user = await User.findByToken(token);
    if (!user) {
      // handles logged out user with valid token
      throw new Error('Authentication failed!');
    }
    req.user = user;
    req.token = token; // used in logout route
  } catch (error) {
    reply.code(401).send(error);
  }

}

export const asyncVerifyUsernameAndPasswordCtrl = async (req, reply) => {

  try {
    if (!req.body) {
      throw new Error('username and Password is required!');
    }
    const user = await User.findByCredentials(req.body.username, req.body.password);
    req.user = user || false;
  } catch (error) {
    reply.code(400).send(error);
  }

}

/**
 * registerCtrl
 * @description Traitement de l'inscription utilisateur
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const registerCtrl = async (req, reply) => {

  const user = new User(req.body);
  try {
    await user.save();
    const email = await sendRegisterEmail(user)
    if (!email.hasOwnProperty('from') || !email.hasOwnProperty('to'))
      reply.status(400).send("Mail not send, please contact us!");
    else {
      reply.status(201).send({
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
        }
      });
    }
  } catch (error) {
    reply.status(400).send(error);
  }

}

/**
 * registerCtrl
 * @description Traitement de l'inscription utilisateur
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const loginCtrl = async (req, reply) => {

  if (req.user) {
    const remember = req.body.remember || false;
    await req.user.generateToken(remember);
  }

  reply.send({
    status: 'You are logged in',
    token: req.user.token,
    user: {
      id: req.user._id.toString(),
      firstname: req.user.firstname,
      lastname: req.user.lastname,
      username: req.user.username,
      email: req.user.email
    }
  });
}

export const logoutCtrl = async (req, reply) => {
  try {
    req.user.token = false
    const loggedOutUser = await req.user.save();
    reply.send({ status: 'You are logged out!', user: loggedOutUser });
  } catch (e) {
    res.status(500).send();
  }
}

export const profileCtrl = async (req, reply) => {
  reply.send({ status: 'Authenticated!', user: req.user });
}

export const confirmEmailCtrl = async (req, reply) => {

  const { confirm_token } = req.params;
  const user = await User.findByConfirmToken(confirm_token);

  if (!user)
    reply.code(303).redirect('http://localhost:5000?confirmation=notok')
  else
    reply.redirect('http://localhost:5000?confirmation=ok')

}
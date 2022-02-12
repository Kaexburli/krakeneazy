
import User from '../../models/user';
import { sendRegisterEmail, sendForgotPasswordEmail, sendNewPasswordEmail } from '../Mailer.js'

export const asyncVerifyJWTCtrl = async (req, reply) => {

  try {
    if (!req.headers.authorization) {
      throw new Error('No token was sent');
    }
    const token = req.headers.authorization.replace('Bearer ', '');
    const user = await User.findByToken(token);
    if (!user || user.hasOwnProperty('error')) {
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
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0] || " account ";
      reply.status(400).send({ message: `Your ${field} is already exist!` })
    }
    else {
      reply.status(400).send(error);
    }
  }

}

/**
 * loginCtrl
 * @description Traitement de la connexion utilisateur
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const loginCtrl = async (req, reply) => {

  if (req.user) {
    const remember = req.body.remember || false;
    await req.user.generateToken(remember, 1);
  }

  reply.send({
    ok: true,
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
    reply.send({ ok: true, status: 'You are logged out!', user: loggedOutUser });
  } catch (e) {
    reply.status(500).send(e);
  }
}

/**
 * refreshTokenCtrl
 * @description Traitement du rafraichissement du token utilisateur
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const refreshTokenCtrl = async (req, reply) => {

  if (req.user) {
    const remember = false;
    const tokenVersion = req.body.tokenVersion || 0;
    await req.user.generateToken(remember, tokenVersion);
  }

  reply.send({
    ok: true,
    status: 'You are refresh token',
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

/**
 * forgotPasswordCtrl
 * @description Traitement de la connexion utilisateur
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const confirmEmailCtrl = async (req, reply) => {

  const { confirm_token } = req.params;
  const user = await User.findByConfirmToken(confirm_token);

  if (!user)
    reply.code(303).redirect(process.env.FRONTEND_URI + '?confirmation=notok')
  else
    reply.redirect(process.env.FRONTEND_URI + '?confirmation=ok')

}

/**
 * forgotPasswordCtrl
 * @description Traitement du mot de passe perdu
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const forgotPasswordCtrl = async (req, reply) => {

  let response;
  const email = req.body.email || false;
  const user = await User.findByEmail(email, true);

  if (user) {
    const sendemail = await sendForgotPasswordEmail(user)
    if (!sendemail.hasOwnProperty('from') || !sendemail.hasOwnProperty('to'))
      reply.status(400).send("Mail not send, please contact us!");
    else
      response = { ok: true, status: `An email has been sent to ${email}` }
  } else {
    response = { ok: false, status: `We can't find you, sorry.` }
  }

  reply.send(response);
}

/**
 * forgotPasswordConfirmCtrl
 * @description Traitement du mot de passe perdu
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const forgotPasswordConfirmCtrl = async (req, reply) => {

  const { resetPasswordToken } = req.params;
  const response = await User.findByForgotToken(resetPasswordToken);

  if (!response)
    reply.code(303).redirect(process.env.FRONTEND_URI + '?reset=notok')
  else {
    const sendemail = await sendNewPasswordEmail(response)
    if (!sendemail.hasOwnProperty('from') || !sendemail.hasOwnProperty('to'))
      reply.code(303).redirect(process.env.FRONTEND_URI + '?reset=notok')
    else
      reply.redirect(process.env.FRONTEND_URI + '?reset=ok')
  }
}

/**
 * profileCtrl
 * @description Traitement de la page profile
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const profileCtrl = async (req, reply) => {
  reply.send({ ok: true, status: 'Authenticated!', user: req.user });
}
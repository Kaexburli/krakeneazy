
import User from '../../models/user';
import UserSettings from '../../models/userSettings';
import UserKraken from '../../models/userKraken';
import { sendRegisterEmail, sendForgotPasswordEmail, sendNewPasswordEmail } from '../Mailer.js'


export const websocketVerifyJWTCtrl = async (req, reply) => {
  const { authorization } = req.params

  try {
    const user = await User.findById(authorization);
    if (!user || user.hasOwnProperty('error')) {
      reply.code(401).send({ error: true, statusCode: 401, message: 'Authentication failed!' });
      throw new Error('Authentication failed!');
    }
    req.user = user;

  } catch (error) {
    reply.code(401).send(error.message);
  }

}

export const asyncVerifyJWTCtrl = async (req, reply) => {

  try {
    if (!req.headers.authorization) {
      throw new Error('No token was sent');
    }
    const token = req.headers.authorization.replace('Bearer ', '');
    const user = await User.findByToken(token);
    if (!user || user.hasOwnProperty('error')) {
      reply.code(401).send({ error: true, statusCode: 401, message: 'Authentication failed!' });
      throw new Error('Authentication failed!');
    }
    req.user = user;
    req.token = token; // used in logout route
  } catch (error) {
    reply.code(401).send(error.message);
  }

}

/**
 * asyncVerifyUsernameAndPasswordCtrl
 * @description Traitement de la connexion utilisateur
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const asyncVerifyUsernameAndPasswordCtrl = async (req, reply) => {

  try {
    if (!req.body) {
      throw new Error('username and Password is required!');
    }
    const user = await User.findByCredentials(req.body.email, req.body.password);
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
    // assume user ID is passed in body from frontend for simplicity
    // Create settings
    const setting = new UserSettings({ user: user._id })
    const savedSetting = await setting.save()
    user.settings = user.settings.concat(savedSetting)

    // Create user with settings
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
    await req.user.generateToken(remember, true);
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

/**
 * logoutCtrl
 * @description Traitement de la déconnexion utilisateur
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
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
    const remember = req.body.remember || false;
    await req.user.generateToken(remember);
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
 * confirmEmailCtrl
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
 * resendConfirmEmailCtrl
 * @description Traitement de l'inscription utilisateur
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const resendConfirmEmailCtrl = async (req, reply) => {

  let response;
  const email = req.body.email || false;
  const user = await User.findByEmail(email, true);

  if (user) {
    const sendemail = await sendRegisterEmail(user)
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
  reply.send({
    ok: true,
    status: 'Authenticated!',
    user: {
      _id: req.user._id,
      firstname: req.user.firstname,
      lastname: req.user.lastname,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      tokenVersion: req.user.tokenVersion,
      cgvConfirmed: req.user.cgvConfirmed,
      settings: {
        exports: req.user.settings[0].exports,
        interval: req.user.settings[0].interval,
        sound: req.user.settings[0].sound,
        maxratecount: req.user.settings[0].maxratecount,
      },
      apikeys: req.user.apikeys
    }
  });
}

/**
 * addApiKeyCtrl
 * @description Ajout une clé api dans la base de données
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const addApiKeyCtrl = async (req, reply) => {
  const { publicKey, privateKey } = req.body;

  // Add api key
  const apikey = new UserKraken({
    apiKeyPublic: publicKey,
    apiKeyPrivate: privateKey,
    user: req.user._id
  })

  try {
    const savedApikey = await apikey.save();
    // save user
    req.user.apikeys = req.user.apikeys.concat(savedApikey);
    await req.user.save();

    reply.send({ ok: true, id: savedApikey._id });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0] || " apikey ";
      reply.status(400).send({ ok: false, message: `Your ${field} is already exist!` })
    }
    else {
      reply.status(400).send({ ok: false, message: error.errors });
    }
  }
}

/**
 * removeApiKeyCtrl
 * @description Supprime une ou plusieurs clé api dans la base de données
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const removeApiKeyCtrl = async (req, reply) => {
  const { ids, userId } = req.body;

  if (req.user._id != userId)
    reply.status(400).send({ ok: false, message: `User ID does not match` })

  try {

    let removedIds = []
    for (const apikey of ids) {
      const removedApikey = await UserKraken.deleteOne({ _id: apikey, user: req.user._id });
      if (removedApikey.deletedCount)
        removedIds.push(apikey)
    }

    if (removedIds.length === ids.length) reply.send({ ok: true, removedIds });
    else reply.status(400).send({ ok: false, message: `An unexpected error is produced` })

  } catch (error) {
    reply.status(400).send({ ok: false, message: error.message })
  }
}

/**
 * changeUserDataCtrl
 * @description Ajout une clé api dans la base de données
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const changeUserDataCtrl = async (req, reply) => {
  const { firstname, lastname, username, email, password } = req.body.user;
  const field = req.body.field;

  try {
    if (firstname) req.user.firstname = firstname;
    if (lastname) req.user.lastname = lastname;
    if (username) req.user.username = username;
    if (email) req.user.email = email;
    if (password) req.user.password = password;

    // save user
    await req.user.save();

    reply.send({ ok: true, message: `Change ${field} done!` });
  } catch (error) {
    if (error.code === 11000) {
      reply.status(400).send({ ok: false, message: `Your ${field} is already exist!` })
    }
    else {
      reply.status(400).send({ ok: false, message: error.errors });
    }
  }
}

/**
 * confirmCGVCtrl
 * @description Modifie la confirmation des CGV
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const confirmCGVCtrl = async (req, reply) => {
  const { cgvConfirmed } = req.body;

  try {
    if (cgvConfirmed) req.user.cgvConfirmed = cgvConfirmed;
    // save user
    await req.user.save();
    reply.send({ ok: true, message: `CGV accepted!` });
  } catch (error) {
    reply.status(400).send({ ok: false, message: error.errors });
  }
}
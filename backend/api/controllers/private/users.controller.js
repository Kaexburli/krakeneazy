// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import User from '../../models/user.model.js'
import UserSettings from '../../models/userSettings.model.js'
import UserKraken from '../../models/userKraken.model.js'
import UserPriceAlerts from '../../models/userPriceAlerts.model.js'
import {
  sendRegisterEmail,
  sendForgotPasswordEmail,
  sendNewPasswordEmail
} from '../../utils/Mailer.js'
import { checkApiKeyPermissions } from './userdatas.controller.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export const websocketVerifyJWTCtrl = async (req, reply) => {
  const { id } = req.params || false

  try {
    const user = await User.findById(id, req)

    if (!user) {
      return reply.code(401).send({
        ok: false,
        statusCode: 401,
        message: 'authFail'
      })
    }

    req.user = user
  } catch (error) {
    return reply.code(401).send(error.message)
  }
}

export const asyncVerifyJWTCtrl = async (req, reply) => {
  if (
    !req.headers['x-webapp-header'] ||
    req.headers['x-webapp-header'] !== process.env.SITE_NAME
  ) {
    return reply.redirect('/')
  }

  const { authorization } = req.headers || false

  try {
    if (authorization) {
      const token = authorization.replace('Bearer ', '')
      const user = await User.findByToken(token, req)

      if (user) {
        req.user = user
        req.token = token // used in logout route
      }
    }

    if (!req.user) {
      return reply.code(401).send({
        ok: false,
        statusCode: 401,
        message: 'authFail'
      })
    }
  } catch (error) {
    return reply.code(401).send({
      ok: false,
      statusCode: 401,
      message: error.message
    })
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
  if (!req.body) {
    return reply.send({
      ok: false,
      message: 'usernameAndPasswordRequired'
    })
  }

  const { email, password } = req.body

  req.user = false

  try {
    const user = await User.findByCredentials(email, password)

    if (user instanceof Error) {
      return reply.code(200).send({
        ok: false,
        message: user.message
      })
    } else {
      req.user = user
      return req.user
    }
  } catch (error) {
    return reply.code(400).send({
      ok: false,
      message: error.message
    })
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
  const user = new User(req.body)
  try {
    // assume user ID is passed in body from frontend for simplicity
    // Create settings
    const setting = new UserSettings({
      user: user._id
    })
    const savedSetting = await setting.save()
    user.settings = user.settings.concat(savedSetting)

    // Create user with settings
    await user.save()

    const email = await sendRegisterEmail(user)

    if (!email) {
      return reply.status(200).send({
        ok: false,
        message: 'errorMailSend'
      })
    } else {
      return reply.status(201).send({
        ok: true,
        user: {
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email
        }
      })
    }
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0] || ' account '
      return reply.status(200).send({
        ok: false,
        message: 'fieldExist',
        field
      })
    } else {
      return reply.status(400).send(error)
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
  if (!req.user) {
    return reply.status(200).send(req.user)
  }

  try {
    const remember = req.body.remember || false
    await req.user.generateToken(remember, true)
  } catch (error) {
    return reply.status(400).send(error)
  }

  return reply.send({
    ok: true,
    status: 'loggedIn',
    token: req.user.token,
    user: {
      id: req.user._id.toString(),
      firstname: req.user.firstname,
      lastname: req.user.lastname,
      username: req.user.username,
      email: req.user.email
    }
  })
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
    const id = req.body.id || false
    const user = await User.findById(id, req)
    user.token = false
    user.isLogged = false

    const loggedOutUser = await user.save()

    if (!loggedOutUser.isLogged) {
      return reply.send({
        ok: true,
        status: 'loggedOut',
        user: loggedOutUser
      })
    } else {
      return reply.send({
        ok: false,
        status: 'loggedOutError'
      })
    }
  } catch (e) {
    return reply.status(500).send(e)
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
  if (req.user instanceof Error) return reply.status(400).send(req.user)

  const remember = req.body.remember || false
  await req.user.generateToken(remember)

  return reply.send({
    ok: true,
    status: 'refreshToken',
    token: req.user.token,
    user: {
      id: req.user._id.toString(),
      firstname: req.user.firstname,
      lastname: req.user.lastname,
      username: req.user.username,
      email: req.user.email
    }
  })
}

/**
 * confirmEmailCtrl
 * @description Traitement de la connexion utilisateur
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const confirmEmailCtrl = async (req, reply) => {
  const { confirmToken } = req.params
  const user = await User.findByConfirmToken(confirmToken)

  if (!user) reply.redirect('/?confirmation=notok')
  else reply.redirect('/?confirmation=ok')
}

/**
 * resendConfirmEmailCtrl
 * @description Traitement de l'inscription utilisateur
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const resendConfirmEmailCtrl = async (req, reply) => {
  const email = req.body.email || false

  if (!email) {
    return reply.send({
      ok: false,
      message: 'cantFindYou'
    })
  }

  try {
    const user = await User.findByEmail(email, true)

    if (!user) {
      return reply.send({
        ok: false,
        message: 'cantFindYou'
      })
    }

    const sendemail = await sendRegisterEmail(user)

    if (!sendemail) {
      return reply.send({
        ok: false,
        message: 'errorMailSend'
      })
    } else {
      return reply.send({
        ok: true,
        message: 'emailSend',
        email
      })
    }
  } catch (error) {
    return reply.send({
      ok: false,
      message: error
    })
  }
}

/**
 * forgotPasswordCtrl
 * @description Traitement du mot de passe perdu
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const forgotPasswordCtrl = async (req, reply) => {
  const email = req.body.email || false

  if (!email) {
    return reply.send({
      ok: false,
      message: 'cantFindYou',
      field: 'email'
    })
  }

  try {
    const user = await User.findByEmail(email, true)

    if (!user) {
      return reply.send({
        ok: false,
        message: 'cantFindYou',
        field: 'user'
      })
    }

    const sendemail = await sendForgotPasswordEmail(user)

    if (!sendemail) {
      return reply.send({
        ok: false,
        message: 'errorMailSend'
      })
    } else {
      return reply.send({
        ok: true,
        message: 'emailSend',
        email
      })
    }
  } catch (error) {
    return reply.send({
      ok: false,
      message: error
    })
  }
}

/**
 * forgotPasswordConfirmCtrl
 * @description Traitement du mot de passe perdu
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const forgotPasswordConfirmCtrl = async (req, reply) => {
  const { resetPasswordToken } = req.params
  const response = await User.findByForgotToken(resetPasswordToken)

  if (!response) {
    reply.code(303).redirect('/?reset=notok')
  } else {
    const sendemail = await sendNewPasswordEmail(response)
    if (!sendemail) {
      reply.code(303).redirect('/?reset=notok')
    } else {
      reply.redirect('/?reset=ok')
    }
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
    status: 'authenticated',
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
        maxratecount: req.user.settings[0].maxratecount
      },
      apikeys: req.user.apikeys
    }
  })
}

/**
 * addApiKeyCtrl
 * @description Ajout une clé api dans la base de données
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const addApiKeyCtrl = async (req, reply) => {
  const { publicKey, privateKey } = req.body

  try {
    // Add api key
    const apikey = new UserKraken({
      apiKeyPublic: publicKey,
      apiKeyPrivate: privateKey,
      user: req.user._id
    })

    const verifyKeys = await checkApiKeyPermissions(apikey)
    if (Object.prototype.hasOwnProperty.call(verifyKeys, 'error')) {
      reply.status(400).send({
        ok: false,
        message: `Your api key return an error : ${verifyKeys.error}`
      })
    } else {
      const savedApikey = await apikey.save()
      // save user
      req.user.apikeys = req.user.apikeys.concat(savedApikey)
      await req.user.save()

      reply.send({
        ok: true,
        id: savedApikey._id
      })
    }
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0] || ' apikey '
      reply.status(400).send({
        ok: false,
        message: `Your ${field} is already exist!`
      })
    } else {
      reply.status(400).send({
        ok: false,
        message: error.errors
      })
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
  const { ids, userId } = req.body

  if (req.user._id !== userId) {
    reply.status(400).send({
      ok: false,
      message: 'User ID does not match'
    })
  }

  try {
    const removedIds = []
    for (const apikey of ids) {
      const removedApikey = await UserKraken.deleteOne({
        _id: apikey,
        user: req.user._id
      })
      if (removedApikey.deletedCount) {
        removedIds.push(apikey)
      }
    }

    if (removedIds.length === ids.length) {
      reply.send({
        ok: true,
        removedIds
      })
    } else {
      reply.status(400).send({
        ok: false,
        message: 'An unexpected error is produced'
      })
    }
  } catch (error) {
    reply.status(400).send({
      ok: false,
      message: error.message
    })
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
  const { firstname, lastname, username, email, password } = req.body.user
  const field = req.body.field

  try {
    if (firstname) req.user.firstname = firstname
    if (lastname) req.user.lastname = lastname
    if (username) req.user.username = username
    if (email) req.user.email = email
    if (password) req.user.password = password

    // save user
    await req.user.save()

    reply.send({
      ok: true,
      message: `Change ${field} done!`
    })
  } catch (error) {
    if (error.code === 11000) {
      reply.status(400).send({
        ok: false,
        message: `Your ${field} is already exist!`
      })
    } else {
      reply.status(400).send({
        ok: false,
        message: error.errors
      })
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
  const { cgvConfirmed } = req.body

  try {
    if (cgvConfirmed) req.user.cgvConfirmed = cgvConfirmed
    // save user
    await req.user.save()
    reply.send({
      ok: true,
      message: 'CGV accepted!'
    })
  } catch (error) {
    reply.status(400).send({
      ok: false,
      message: error.errors
    })
  }
}

/**
 * setPriceAlertCtrl
 * @description Ajoute une alert a l'utilisateur
 * @param { Object } req Object request
 * @param { Object } reply Object replying
 * @returns { Object } HTTP response
 */
export const setPriceAlertCtrl = async (req, reply) => {
  const { alerts } = req.body

  let priceAlert

  const countAlert = req.user.alerts.length

  try {
    // Add price alert
    if (!countAlert) {
      priceAlert = new UserPriceAlerts({
        alerts: alerts,
        user: req.user._id
      })
    } else {
      priceAlert = await UserPriceAlerts.findOne({
        _id: req.user.alerts[0]._id
      })
      priceAlert.alerts = alerts
    }

    const savedPriceAlert = await priceAlert.save()

    // save user
    req.user.alerts = savedPriceAlert
    await req.user.save()

    reply.send({
      ok: true,
      id: priceAlert._id
    })
  } catch (error) {
    reply.status(400).send({
      ok: false,
      message: error.errors
    })
  }
}

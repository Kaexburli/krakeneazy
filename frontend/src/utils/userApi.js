// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------

/*eslint-disable */
const backendUri =
  __App['env'].BACKEND_URI || [location.protocol, location.host].join('//')
/*eslint-disable */

// ---------------------------------------------------------
//  headers
// ---------------------------------------------------------
const headers = {
  'Content-Type': 'application/json',
  /*eslint-disable */
  'x-webapp-header': __App['env'].SITE_NAME
  /*eslint-disable */
}

// ---------------------------------------------------------
//  parseJSON
// ---------------------------------------------------------
const parseJSON = (resp) => (resp.json ? resp.json() : resp)

// ---------------------------------------------------------
//  checkStatus
// ---------------------------------------------------------
const checkStatus = async (resp) => {
  if (!resp.ok) {
    await parseJSON(resp).then((resp) => {
      console.error(resp.message)
    })

    throw { ok: false, message: `${resp.status} (${resp.statusText})` }
  } else if (resp.status >= 200 && resp.status < 300) {
    return resp
  }
}

// ---------------------------------------------------------
//  sendBackendRequest
// ---------------------------------------------------------
const sendBackendRequest = async (endpoint, args, meth, heads) => {
  let req =
    meth === 'POST'
      ? {
          method: 'POST',
          headers: heads ? heads : headers,
          body: JSON.stringify(args)
        }
      : {
          method: 'GET',
          headers: heads ? heads : headers
        }

  try {
    return await fetch(`${backendUri}/api/${endpoint}`, req)
      .then(checkStatus)
      .then(parseJSON)
  } catch (error) {
    if (error.message.includes('Unexpected')) {
      return {
        ok: false,
        error: true,
        message: 'Unexpected token'
      }
    }

    return {
      ok: false,
      error: true,
      message: error.message
    }
  }
}

// ---------------------------------------------------------
//  userRegister
// ---------------------------------------------------------
export const userRegister = async (data) => {
  const args = {
    firstname: data.reg_firstname,
    lastname: data.reg_lastname,
    username: data.reg_email,
    email: data.reg_email,
    password: data.reg_password
  }
  return sendBackendRequest('register', args, 'POST', headers)
}

// ---------------------------------------------------------
//  userLogin
// ---------------------------------------------------------
export const userLogin = async (data) => {
  const args = {
    remember: data.remember_me,
    email: data.log_email,
    password: data.log_password
  }
  return sendBackendRequest('login', args, 'POST', headers)
}

// ---------------------------------------------------------
//  userLogout
// ---------------------------------------------------------
export const userLogout = async (id) => {
  const args = {
    id
  }
  return sendBackendRequest('logout', args, 'POST', headers)
}

// ---------------------------------------------------------
//  userRefreshToken
// ---------------------------------------------------------
export const userRefreshToken = async (token, remember) => {
  const args = {
    token,
    remember
  }
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    // eslint-disable-next-line no-undef, dot-notation
    'x-webapp-header': __App['env'].SITE_NAME
  }
  return sendBackendRequest('refresh-token', args, 'POST', headers)
}

// ---------------------------------------------------------
//  userForgotPassword
// ---------------------------------------------------------
export const userForgotPassword = async (data) => {
  const args = {
    email: data.forgot_email
  }
  return sendBackendRequest('forgot-password', args, 'POST', headers)
}

// ---------------------------------------------------------
//  resendConfirmEmail
// ---------------------------------------------------------
export const resendConfirmEmail = async (data) => {
  const args = {
    email: data.log_email
  }
  return sendBackendRequest('send-confirm-email', args, 'POST', headers)
}

// ---------------------------------------------------------
//  userProfile
// ---------------------------------------------------------
export const userProfile = async (token) => {
  const args = {}
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    // eslint-disable-next-line no-undef, dot-notation
    'x-webapp-header': __App['env'].SITE_NAME
  }
  return sendBackendRequest('me', args, 'GET', headers)
}

// ---------------------------------------------------------
//  addApiKey
// ---------------------------------------------------------
export const addApiKey = async (token, data) => {
  const { privateKey, publicKey } = data

  const args = {
    privateKey,
    publicKey
  }
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    // eslint-disable-next-line no-undef, dot-notation
    'x-webapp-header': __App['env'].SITE_NAME
  }
  return sendBackendRequest('add-apikey', args, 'POST', headers)
}

// ---------------------------------------------------------
//  removeApiKey
// ---------------------------------------------------------
export const removeApiKey = async (token, data) => {
  const { ids, userId } = data

  const args = {
    ids,
    userId
  }
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    // eslint-disable-next-line no-undef, dot-notation
    'x-webapp-header': __App['env'].SITE_NAME
  }
  return sendBackendRequest('remove-apikey', args, 'POST', headers)
}

// ---------------------------------------------------------
//  changeUserData
// ---------------------------------------------------------
export const changeUserData = async (token, data, field) => {
  const firstname = data.firstname || false
  const lastname = data.lastname || false
  const username = data.username || false
  const email = data.email || false
  const password = data.password || false

  const user = {
    firstname,
    lastname,
    username,
    email,
    password
  }

  const args = {
    user,
    field
  }
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    // eslint-disable-next-line no-undef, dot-notation
    'x-webapp-header': __App['env'].SITE_NAME
  }
  return sendBackendRequest('change-user-data', args, 'POST', headers)
}

// ---------------------------------------------------------
//  acceptCgv
// ---------------------------------------------------------
export const acceptCgv = async (token) => {
  const args = {
    cgvConfirmed: true
  }
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    // eslint-disable-next-line no-undef, dot-notation
    'x-webapp-header': __App['env'].SITE_NAME
  }
  return sendBackendRequest('accept-cgv', args, 'POST', headers)
}

// ---------------------------------------------------------
//  setPriceAlert
// ---------------------------------------------------------
export const setPriceAlert = async (token, data) => {
  const args = {
    alerts: data
  }
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    // eslint-disable-next-line no-undef, dot-notation
    'x-webapp-header': __App['env'].SITE_NAME
  }
  return sendBackendRequest('price-alerts', args, 'POST', headers)
}

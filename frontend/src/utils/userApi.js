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
  if (resp.status >= 200 && resp.status < 300) {
    return resp
  }
  return parseJSON(resp).then((resp) => {
    console.debug('ERROR userApi:33', resp)
    throw resp
  })
}

// ---------------------------------------------------------
//  checkStatus
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

  return await fetch(`${backendUri}/api/${endpoint}`, req)
    .then(checkStatus)
    .then(parseJSON)
}

// ---------------------------------------------------------
//  userRegister
// ---------------------------------------------------------
export const userRegister = async (data) => {
  try {
    const args = {
      firstname: data.reg_firstname,
      lastname: data.reg_lastname,
      username: data.reg_email,
      email: data.reg_email,
      password: data.reg_password
    }
    return sendBackendRequest('register', args, 'POST', headers)
  } catch (error) {
    return {
      error: true,
      message: error.message
    }
  }
}

// ---------------------------------------------------------
//  userLogin
// ---------------------------------------------------------
export const userLogin = async (data) => {
  try {
    const args = {
      remember: data.remember_me,
      email: data.log_email,
      password: data.log_password
    }
    return sendBackendRequest('login', args, 'POST', headers)
  } catch (error) {
    return {
      error: true,
      message: error.message
    }
  }
}

// ---------------------------------------------------------
//  userLogout
// ---------------------------------------------------------
export const userLogout = async (id) => {
  try {
    const args = {
      id
    }
    return sendBackendRequest('logout', args, 'POST', headers)
  } catch (error) {
    return {
      error: true,
      message: error.message
    }
  }
}

// ---------------------------------------------------------
//  userRefreshToken
// ---------------------------------------------------------
export const userRefreshToken = async (token, remember) => {
  try {
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
  } catch (error) {
    return {
      error: true,
      message: error.message
    }
  }
}

// ---------------------------------------------------------
//  userForgotPassword
// ---------------------------------------------------------
export const userForgotPassword = async (data) => {
  try {
    const args = {
      email: data.forgot_email
    }
    return sendBackendRequest('forgot-password', args, 'POST', headers)
  } catch (error) {
    return {
      error: true,
      message: error.message
    }
  }
}

// ---------------------------------------------------------
//  resendConfirmEmail
// ---------------------------------------------------------
export const resendConfirmEmail = async (data) => {
  try {
    const args = {
      email: data.log_email
    }
    return sendBackendRequest('send-confirm-email', args, 'POST', headers)
  } catch (error) {
    return {
      error: true,
      message: error.message
    }
  }
}

// ---------------------------------------------------------
//  userProfile
// ---------------------------------------------------------
export const userProfile = async (token) => {
  try {
    const args = {}
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      // eslint-disable-next-line no-undef, dot-notation
      'x-webapp-header': __App['env'].SITE_NAME
    }
    return sendBackendRequest('me', args, 'GET', headers)
  } catch (error) {
    return {
      error: true,
      message: error.message
    }
  }
}

// ---------------------------------------------------------
//  addApiKey
// ---------------------------------------------------------
export const addApiKey = async (token, data) => {
  const { privateKey, publicKey } = data

  try {
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
  } catch (error) {
    return error
  }
}

// ---------------------------------------------------------
//  removeApiKey
// ---------------------------------------------------------
export const removeApiKey = async (token, data) => {
  const { ids, userId } = data

  try {
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
  } catch (error) {
    return {
      error: true,
      message: error.message
    }
  }
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

  try {
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
  } catch (error) {
    return error
  }
}

// ---------------------------------------------------------
//  acceptCgv
// ---------------------------------------------------------
export const acceptCgv = async (token) => {
  try {
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
  } catch (error) {
    return error
  }
}

// ---------------------------------------------------------
//  setPriceAlert
// ---------------------------------------------------------
export const setPriceAlert = async (token, data) => {
  try {
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
  } catch (error) {
    return error
  }
}

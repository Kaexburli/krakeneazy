// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------

/*eslint-disable */
const backendUri =
  __App['env'].BACKEND_URI || [location.protocol, location.host].join('//')
/*eslint-disable */

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
    throw resp
  })
}

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
//  userRegister
// ---------------------------------------------------------
export const userRegister = async (data) => {
  try {
    return await fetch(`${backendUri}/api/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        firstname: data.reg_firstname,
        lastname: data.reg_lastname,
        username: data.reg_email,
        email: data.reg_email,
        password: data.reg_password
      })
    })
      .then(checkStatus)
      .then(parseJSON)
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
    return await fetch(`${backendUri}/api/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        remember: data.remember_me,
        email: data.log_email,
        password: data.log_password
      })
    })
      .then(checkStatus)
      .then(parseJSON)
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
    return await fetch(`${backendUri}/api/logout`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id
      })
    })
      .then(checkStatus)
      .then(parseJSON)
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
    return await fetch(`${backendUri}/api/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        // eslint-disable-next-line no-undef, dot-notation
        'x-webapp-header': __App['env'].SITE_NAME
      },
      body: JSON.stringify({
        token,
        remember
      })
    })
      .then(checkStatus)
      .then(parseJSON)
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
    return await fetch(`${backendUri}/api/forgot-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: data.forgot_email
      })
    })
      .then(checkStatus)
      .then(parseJSON)
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
    return await fetch(`${backendUri}/api/send-confirm-email`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: data.log_email
      })
    })
      .then(checkStatus)
      .then(parseJSON)
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
    return await fetch(`${backendUri}/api/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        // eslint-disable-next-line no-undef, dot-notation
        'x-webapp-header': __App['env'].SITE_NAME
      }
    })
      .then(checkStatus)
      .then(parseJSON)
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
    return await fetch(`${backendUri}/api/add-apikey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        // eslint-disable-next-line no-undef, dot-notation
        'x-webapp-header': __App['env'].SITE_NAME
      },
      body: JSON.stringify({
        privateKey,
        publicKey
      })
    })
      .then(checkStatus)
      .then(parseJSON)
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
    return await fetch(`${backendUri}/api/remove-apikey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        // eslint-disable-next-line no-undef, dot-notation
        'x-webapp-header': __App['env'].SITE_NAME
      },
      body: JSON.stringify({
        ids,
        userId
      })
    })
      .then(checkStatus)
      .then(parseJSON)
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
    return await fetch(`${backendUri}/api/change-user-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        // eslint-disable-next-line no-undef, dot-notation
        'x-webapp-header': __App['env'].SITE_NAME
      },
      body: JSON.stringify({
        user,
        field
      })
    })
      .then(checkStatus)
      .then(parseJSON)
  } catch (error) {
    return error
  }
}

// ---------------------------------------------------------
//  acceptCgv
// ---------------------------------------------------------
export const acceptCgv = async (token) => {
  try {
    return await fetch(`${backendUri}/api/accept-cgv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        // eslint-disable-next-line no-undef, dot-notation
        'x-webapp-header': __App['env'].SITE_NAME
      },
      body: JSON.stringify({
        cgvConfirmed: true
      })
    })
      .then(checkStatus)
      .then(parseJSON)
  } catch (error) {
    return error
  }
}

// ---------------------------------------------------------
//  setPriceAlert
// ---------------------------------------------------------
export const setPriceAlert = async (token, data) => {
  try {
    return await fetch(`${backendUri}/api/price-alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        // eslint-disable-next-line no-undef, dot-notation
        'x-webapp-header': __App['env'].SITE_NAME
      },
      body: JSON.stringify({
        alerts: data
      })
    })
      .then(checkStatus)
      .then(parseJSON)
  } catch (error) {
    return error
  }
}

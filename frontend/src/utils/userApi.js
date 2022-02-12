/**
 * parseJSON
************************************************************************************************/
const parseJSON = (resp) => (resp.json ? resp.json() : resp);

/**
 * checkStatus
************************************************************************************************/
const checkStatus = async (resp) => {
  if (resp.status >= 200 && resp.status < 300) {
    return resp;
  }
  return parseJSON(resp).then((resp) => {
    throw resp;
  });
};

/**
 * headers
************************************************************************************************/
const headers = {
  'Content-Type': 'application/json',
};

/**
 * userRegister
************************************************************************************************/
export const userRegister = async (data) => {
  try {
    return await fetch(__env["BACKEND_URI"] + "/register", {
      method: 'POST',
      headers,
      body: JSON.stringify({
        firstname: data.reg_firstname,
        lastname: data.reg_lastname,
        username: data.reg_email,
        email: data.reg_email,
        password: data.reg_password
      }),
    })
      .then(checkStatus)
      .then(parseJSON);
  } catch (error) {
    return { error: true, message: error.message }
  }
}

/**
 * userLogin
************************************************************************************************/
export const userLogin = async (data) => {
  try {
    return await fetch(__env["BACKEND_URI"] + "/login", {
      method: 'POST',
      headers,
      body: JSON.stringify({
        remember: data.remember_me,
        username: data.log_email,
        password: data.log_password,
      }),
    })
      .then(checkStatus)
      .then(parseJSON);
  } catch (error) {
    return { error: true, message: error.message }
  }
}

/**
 * userLogout
************************************************************************************************/
export const userLogout = async (token) => {
  try {
    return await fetch(__env["BACKEND_URI"] + "/logout", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        token
      })
    })
      .then(checkStatus)
      .then(parseJSON);
  } catch (error) {
    return { error: true, message: error.message }
  }
}

/**
 * userRefreshToken
************************************************************************************************/
export const userRefreshToken = async (token, tokenVersion) => {
  try {
    return await fetch(__env["BACKEND_URI"] + "/refresh-token", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        token,
        tokenVersion
      })
    })
      .then(checkStatus)
      .then(parseJSON);
  } catch (error) {
    return { error: true, message: error.message }
  }
}

/**
 * userForgotPassword
************************************************************************************************/
export const userForgotPassword = async (data) => {
  try {
    return await fetch(__env["BACKEND_URI"] + "/forgot-password", {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: data.forgot_email
      }),
    })
      .then(checkStatus)
      .then(parseJSON);
  } catch (error) {
    return { error: true, message: error.message }
  }
}

/**
 * resendConfirmEmail
************************************************************************************************/
export const resendConfirmEmail = async (data) => {
  try {
    return await fetch(__env["BACKEND_URI"] + "/send-confirm-email", {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: data.log_email
      }),
    })
      .then(checkStatus)
      .then(parseJSON);
  } catch (error) {
    return { error: true, message: error.message }
  }
}
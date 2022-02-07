const parseJSON = (resp) => (resp.json ? resp.json() : resp);

const checkStatus = async (resp) => {
  if (resp.status >= 200 && resp.status < 300) {
    return resp;
  }
  return parseJSON(resp).then((resp) => {
    throw resp;
  });
};

const headers = {
  'Content-Type': 'application/json',
};

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

export const userLogout = async (data) => {
  try {
    return await fetch(__env["BACKEND_URI"] + "/logout", {
      method: 'POST',
      headers,
      body: JSON.stringify({
        identifier: data.log_email,
        password: data.log_password,
      }),
    })
      .then(checkStatus)
      .then(parseJSON);
  } catch (error) {
    return { error: true, message: error.message }
  }
}

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
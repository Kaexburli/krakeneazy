// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { userLogout, userRefreshToken, userProfile } from 'utils/userApi.js'
import { openModal, closeModal } from 'svelte-modals'
import RefreshTokenModal from 'components/modal/RefreshTokenModal.svelte'
import jwtDecode from 'jwt-decode'
import { writable } from 'svelte/store'
import { BrowserTabTracker } from 'browser-session-tabs'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
const sessionId = BrowserTabTracker.sessionId
const logoutDelay = 500
const logoutRefresh = 30000
let setTimeOutLogout, setTimeOutRefresh, stoRefresh
const track = '../sound/warning_auto_logout_2.mp3'
let user

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
export const hasApikeysStore = writable(false)
const storedUser =
  JSON.parse(localStorage.getItem(`${sessionId}_user`)) || false
const { subscribe, set, update } = writable(storedUser)

subscribe((data) => {
  if (typeof data !== 'object') data = JSON.parse(data)
  user = data
})

/**
 * playSound
 ************************************************************************************************/
const playSound = () => {
  const audio = new Audio(track)
  audio.play()
}

/**
 * convertMilli
 ************************************************************************************************/
const convertMilli = (milli, end = false) => {
  const seconds = Math.floor((milli / 1000) % 60)
  const minutes = Math.floor((milli / 1000 / 60) % 60)
  const hours = Math.floor((milli / 1000 / 60 / 60) % 24)

  if (end) return seconds.toString().padStart(2, '0')

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':')
}

/**
 * init
 ************************************************************************************************/
const init = async () => {
  if (isLogged()) {
    const jwt = await parseJwt(user)

    if (jwt) {
      const verifyTime = await verifyValidity(jwt)

      if (verifyTime) {
        const { timerLogout, timerRefresh } = verifyTime

        setTimeOutLogout = setTimeout(() => {
          expiredJWT()
        }, timerLogout)

        setTimeOutRefresh = setTimeout(() => {
          playSound()
          refreshToken(jwt)
        }, timerRefresh)
      }
    }
  }
}

/**
 * parseJwt
 ************************************************************************************************/
const parseJwt = async (user) => {
  try {
    return await jwtDecode(user.token)
  } catch (error) {
    console.error('[ERROR]:', error)
    return null
  }
}

/**
 * verifyValidity
 ************************************************************************************************/
const verifyValidity = async (jwt) => {
  const currentTime = new Date().getTime() / 1000
  const timerLogout = Number(
    parseInt(parseInt(jwt.exp - parseInt(currentTime)) * 1000) - logoutDelay
  )

  const timerRefresh = parseInt(timerLogout - logoutRefresh)

  if (parseInt(timerLogout) <= 0) {
    expiredJWT()
    return false
  }

  return { timerLogout, timerRefresh }
}

/**
 * expiredJWT
 ************************************************************************************************/
const expiredJWT = async () => {
  await userLogout(user.id)
  User.signout()
  return location.reload()
}

/**
 * refreshToken
 ************************************************************************************************/
const refreshToken = async (jwt) => {
  if (!user) {
    clearTimeout(setTimeOutLogout)
    clearTimeout(setTimeOutRefresh)
    return false
  }
  const { timerLogout } = await verifyValidity(jwt)

  const timer = convertMilli(timerLogout, true)

  stoRefresh = setTimeout(() => {
    closeModal()
    refreshToken(jwt)
  }, 1000)

  openModal(RefreshTokenModal, {
    timer,
    confirm: async () => {
      callRefreshToken()
      clearTimeout(stoRefresh)
      clearTimeout(setTimeOutLogout)
      clearTimeout(setTimeOutRefresh)
      closeModal()
    },
    no: async () => {
      expiredJWT()
      closeModal()
    }
  })
}

/**
 * callRefreshToken
 ************************************************************************************************/
const callRefreshToken = async () => {
  try {
    const jwt = await parseJwt(user)
    const res = await userRefreshToken(user.token, jwt.remember)
    if (Object.prototype.hasOwnProperty.call(res, 'error')) {
      console.error('[ERROR]:', res.error)
    } else {
      const profile = await userProfile(res.token)
      if (profile.ok) {
        User.refresh({ token: res.token, id: profile.user._id })
        init()
      } else {
        User.signout()
        location.reload()
      }
    }
  } catch (error) {
    console.error('[ERROR]:', error)
  }
}

/**
 * isLogged
 ************************************************************************************************/
const isLogged = () => {
  return !!user
}

/**
 * getProfile
 ************************************************************************************************/
const getProfile = async () => {
  if (user) {
    const profile = await userProfile(user.token)
    if (profile.ok) return { token: user.token, user: profile.user }
    else return false
  } else return false
}

/**
 * getJWTData
 ************************************************************************************************/
const getJWTData = async () => {
  if (user) {
    return await parseJwt(user)
  } else return false
}

/**
 * refresh
 ************************************************************************************************/
const refresh = (user) => {
  if (
    !Object.prototype.hasOwnProperty.call(user, 'token') ||
    !Object.prototype.hasOwnProperty.call(user, 'id') ||
    !user.token ||
    !user.id
  ) {
    return false
  } else {
    user = JSON.stringify(user)
    localStorage.setItem(`${sessionId}_user`, user)
    return set(JSON.parse(localStorage.getItem(`${sessionId}_user`)))
  }
}

/**
 * signin
 ************************************************************************************************/
const signin = (user) => {
  if (
    !Object.prototype.hasOwnProperty.call(user, 'token') ||
    !Object.prototype.hasOwnProperty.call(user, 'id') ||
    !user.token ||
    !user.id
  ) {
    return false
  } else {
    user = JSON.stringify(user)
    localStorage.setItem(`${sessionId}_user`, user)
    return update((v) => JSON.parse(localStorage.getItem(`${sessionId}_user`)))
  }
}

/**
 * signout
 ************************************************************************************************/
const signout = () => {
  clearTimeout(stoRefresh)
  clearTimeout(setTimeOutLogout)
  clearTimeout(setTimeOutRefresh)

  localStorage.setItem(`${sessionId}_user`, false)
  return set(false)
}

export const User = (function () {
  return {
    init,
    getData: getJWTData,
    getProfile,
    isLogged,
    subscribe,
    signout,
    refresh,
    signin
  }
})()

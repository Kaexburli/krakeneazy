import { _ } from "svelte-i18n";
import { writable } from 'svelte/store';
import { userLogout, userRefreshToken } from "utils/userApi.js";
import { openModal, closeModal } from "svelte-modals";
import RefreshTokenModal from "components/modal/RefreshTokenModal.svelte";
import jwt_decode from "jwt-decode";

const storedUser = JSON.parse(localStorage.getItem("user")) || false;
const { subscribe, set, update } = writable(storedUser);

const logoutDelay = 60000;
const logoutRefresh = logoutDelay / 2;
let setTimeOutLogout, setTimeOutRefresh, stoRefresh;
let tokenVersion = 1;
const track = "../sound/warning_auto_logout_2.mp3";

let user;
subscribe((data) => {
  if (typeof data !== 'object') data = JSON.parse(data)
  user = data
})

/**
 * isLogged
************************************************************************************************/
const isLogged = () => {
  return !!user
}

/**
 * init
************************************************************************************************/
const init = async () => {
  if (isLogged()) {
    const jwt = await parseJwt(user);

    if (jwt) {
      const verifyTime = await verifyValidity(jwt);

      if (verifyTime) {
        const { timerLogout, timerRefresh } = verifyTime

        setTimeOutLogout = setTimeout(() => {
          expiredJWT();
        }, timerLogout);

        setTimeOutRefresh = setTimeout(() => {
          playSound();
          refreshToken(jwt);
        }, timerRefresh);
        tokenVersion++;
      }
    }
  }
}

/**
 * parseJwt
************************************************************************************************/
const parseJwt = async (user) => {
  try {
    return await jwt_decode(user.token);
  } catch (error) {
    console.error("[ERROR][parseJwt]:", error);
    return null;
  }
}

/**
 * verifyValidity
 ************************************************************************************************/
const verifyValidity = async (jwt) => {
  const currentTime = new Date().getTime() / 1000;
  let timerLogout = Number(
    parseInt(parseInt(jwt.exp - parseInt(currentTime)) * 1000) - logoutDelay
  );

  let timerRefresh = parseInt(timerLogout - logoutRefresh);

  if (parseInt(timerLogout) <= 0) {
    expiredJWT();
    return false;
  }

  return { timerLogout, timerRefresh }
}

/**
 * expiredJWT
 ************************************************************************************************/
const expiredJWT = async () => {
  await userLogout(user.token);
  User.signout();
  return location.reload();
};

/**
 * refreshToken
 ************************************************************************************************/
const refreshToken = async (jwt) => {
  if (!user) {
    clearTimeout(setTimeOutLogout);
    clearTimeout(setTimeOutRefresh);
    return false;
  }
  const { timerLogout } = await verifyValidity(jwt);

  let refresh = convertMilli(timerLogout, true);

  stoRefresh = setTimeout(() => {
    closeModal();
    refreshToken(jwt);
  }, 1000);

  openModal(RefreshTokenModal, {
    title: $_("modal.refreshToken.title"),
    btn: $_("modal.refreshToken.btn"),
    message: `${$_("modal.refreshToken.title")} ${refresh >= 0 && refresh <= 30 ? refresh : 0
      } ${refresh >= 2 ? $_("modal.refreshToken.sec_plurial") : $_("modal.refreshToken.sec_singular")}`,
    confirm: async () => {
      callRefreshToken();
      clearTimeout(stoRefresh);
      clearTimeout(setTimeOutLogout);
      clearTimeout(setTimeOutRefresh);
      closeModal();
    },
  });
};

/**
 * callRefreshToken
 ************************************************************************************************/
const callRefreshToken = async () => {
  try {
    const res = await userRefreshToken(user.token, tokenVersion);
    if (res.hasOwnProperty("error")) {
      console.log("ERROR:", res.error);
    } else {
      User.refresh({ token: res.token });
      init();
    }
  } catch (error) {
    console.error("ERROR:", error);
  }
};

/**
 * convertMilli
 ************************************************************************************************/
const convertMilli = (milli, end = false) => {
  const seconds = Math.floor((milli / 1000) % 60);
  const minutes = Math.floor((milli / 1000 / 60) % 60);
  const hours = Math.floor((milli / 1000 / 60 / 60) % 24);

  if (end) return seconds.toString().padStart(2, "0");

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
};


const refresh = (user) => {
  user = JSON.stringify(user)
  localStorage.setItem("user", user)
  return set(JSON.parse(localStorage.getItem("user")))
}
const signin = (user) => {
  user = JSON.stringify(user)
  localStorage.setItem("user", user)
  return update(v => JSON.parse(localStorage.getItem("user")))
}
const signout = () => {
  clearTimeout(stoRefresh);
  clearTimeout(setTimeOutLogout);
  clearTimeout(setTimeOutRefresh);

  localStorage.setItem("user", false)
  return set(false)
}

/**
 * playSound
 ************************************************************************************************/
const playSound = () => {
  let audio = new Audio(track);
  let playPromise = audio.play();
  playPromise;
};

export const User = function () {
  return {
    init,
    isLogged,
    subscribe,
    signout,
    refresh,
    signin,
  }
}()
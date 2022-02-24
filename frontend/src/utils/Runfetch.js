import { User } from "store/userStore.js";
import { fetchTimeout } from "store/store.js";
import checkRateCount from "utils/checkRateCount.js"
import Fetch, { hasBackground } from "svelte-fetch"

let background = 0;
let timeout = false;
hasBackground.subscribe((v) => background = v)
fetchTimeout.subscribe((v) => timeout = v)

const fetch = new Fetch()

/**
 *  *****************
 *  FETCH METHOD
 *  *****************
 */


const callApiFetch = async (url, endpoint, token = false) => {

  try {

    if (timeout.timeout) {
      let end = parseInt(timeout.started + timeout.timeout)
      let now = Date.now()
      if (now < end) {
        console.log("Timeout:", parseInt(end - now) / 60000)
        return false
      }
    }


    const checkratecount = checkRateCount(endpoint);
    if (!checkratecount) return false;

    // console.log('[Fetch Background]:', background, endpoint)

    let errorTimeout = false;
    let options = {}

    if (token) {
      options = {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      }
    }

    let response = await fetch.background.expect(JSON).get(url, options);

    // console.log(`[RUNFECTH] ${endpoint}`, response)


    if (response.hasOwnProperty("error")) {
      errorTimeout = response.timeout
      console.error(`[HAS ERROR]: ${endpoint} = ${response.error}`)
    }

    fetchTimeout.update((n) => {
      n['timeout'] = errorTimeout;
      n['started'] = Date.now();
      return n
    });

    if (
      response.hasOwnProperty("statusCode") &&
      response.statusCode === 401
    ) {
      User.signout();
      location.reload()
      return false;
    }
    else return response
  }
  catch (error) {
    console.error("CATCH ERROR RUNFECTH:", error)
    return { error, endpoint };
  }
}

export default callApiFetch
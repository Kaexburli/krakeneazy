import { User } from "store/userStore.js";
import checkRateCount from "utils/checkRateCount.js"
import Fetch, { hasBackground } from "svelte-fetch"

const fetch = new Fetch()

/**
 *  *****************
 *  FETCH METHOD
 *  *****************
 */


const callApiFetch = async (url, endpoint, token = false) => {

  try {

    // const checkratecount = checkRateCount(endpoint);
    // if (!checkratecount) return false;

    // hasBackground.subscribe((background) => {
    //   console.log('[Fetch Background]:', background, endpoint)
    // })

    let options = {}

    if (token) {
      options = {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      }
    }

    let response = await fetch.background.expect(JSON).get(url, options);

    if (response.hasOwnProperty("error")) {
      console.log(`[ERROR]: ${endpoint} = ${response.error.body.error ? response.error.body.error : error}`)
    }

    if (
      response.hasOwnProperty("statusCode") &&
      response.statusCode === 401
    ) {
      User.signout();
      location.reload()
      return false;
    }

    return response
  }
  catch (error) {
    const err = "[" + endpoint + "]" + (typeof error !== 'undefined' ? error : 'unknown error')
    return { error: err };
  }
}

export default callApiFetch
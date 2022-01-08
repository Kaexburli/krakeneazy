import checkRateCount from "utils/checkRateCount.js"
import Fetch, { hasBackground } from "svelte-fetch"

const fetch = new Fetch()

/**
 *  *****************
 *  FETCH METHOD
 *  *****************
 */


const callApiFetch = async (url, endpoint) => {

  try {

    const checkratecount = checkRateCount(endpoint);
    if (!checkratecount) return false;

    // hasBackground.subscribe((background) => {
    //   console.log('[Fetch Background]:', background, endpoint)
    // })

    let response = await fetch.background.expect(JSON).get(url);

    if (response.hasOwnProperty('error')) {
      let errmsg = `[${response.statusCode}] ${response.error} ${response.message}`;
      if (response.message === ('[\"EAPI:Invalid nonce\"]' || '["EAPI:Invalid nonce"]')) {
        throw errmsg
      }
      if (response.message === ('[\"EAPI:Rate limit exceeded\"]' || '["EAPI:Rate limit exceeded"]')) {
        throw errmsg
      }
    }
    else
      return response
  }
  catch (error) {
    console.error("[ERROR: " + endpoint + "]", (typeof error !== undefined ? error : false))
  }
}

export default callApiFetch
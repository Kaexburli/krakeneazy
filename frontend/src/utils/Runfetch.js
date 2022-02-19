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

    const checkratecount = checkRateCount(endpoint);
    if (!checkratecount) return false;

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
    const err = "[" + endpoint + "]" + (typeof error !== 'undefined' ? error : 'unknown error')
    return { error: err };
  }
}

export default callApiFetch
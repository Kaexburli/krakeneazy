// import { writable } from 'svelte/store'
import { maxratecount, maxratecount_data } from "store/store.js"
import Fetch, { hasBackground } from "svelte-fetch"

const fetch = new Fetch()

/**
 *  *****************
 *  FETCH METHOD
 *  *****************
 */

const rate_accounts = {
  60: { decayrate: '1' },
  125: { decayrate: '2.34' },
  180: { decayrate: '3.75' }
};
const rate_params = {
  two: ['ledgers', 'tradehistory', 'closedorders'],
  CancelOrder: { '5': 8, '10': 6, '15': 5, '45': 4, '90': 2, '300': 1 }
};

const getRateInfo = () => {
  let max_ratecount, max_ratecount_data;
  maxratecount.subscribe((v) => max_ratecount = v);
  maxratecount_data.subscribe((v) => max_ratecount_data = v);
  let rate_time_per_sec = (max_ratecount / rate_accounts[max_ratecount].decayrate / max_ratecount);
  return {
    max_ratecount_data: max_ratecount_data,
    max_ratecount: rate_accounts[max_ratecount],
    rate_time_per_sec,
    max_ratecount,
    params: rate_params
  }
}

const checkRateCount = (endpoint) => {
  let now = Date.now()
  let end = null;
  let diff_time_end = null;
  let rate_more_count;
  let rate = getRateInfo()

  // console.log('End Point : ', this.endpoint)
  // console.log('now:', now)
  // console.log('end avant vérification du timestamp:', rate.max_ratecount_data.ratecount_end)
  if (rate.max_ratecount_data.ratecount_end !== null) {
    // console.log('ratecount_end est pas null')
    end = rate.max_ratecount_data.ratecount_end
    end = (now > end) ? now : end;
    end = parseInt(end + rate.rate_time_per_sec * 1000)
    diff_time_end = end - now;
  }
  else {
    // console.log('ratecount_end est null')
    end = parseInt(now + rate.rate_time_per_sec * 1000)
    diff_time_end = end - now;
  }
  // console.log('Temps diff:', end - now)
  // console.log('end modifié', parseInt(end + rate.rate_time_per_sec * 1000))

  rate_more_count = (diff_time_end / (rate.rate_time_per_sec * 1000)).toFixed(1)
  // console.log('Count restant', rate_more_count)

  if (typeof rate.max_ratecount_data.rate_count !== 'undefined') {
    if (rate.params.two.includes(endpoint)) {
      // console.log('Coute 2 points', rate.params.two.includes(this.endpoint))
      rate.max_ratecount_data.rate_count.count = rate.max_ratecount_data.rate_count.count + 2
    }
    else {
      // console.log('Coute 1 points', rate.params.two.includes(this.endpoint))
      rate.max_ratecount_data.rate_count.count++
    }

    rate.max_ratecount_data.rate_count.count = rate_more_count - rate.max_ratecount_data.rate_count.count
    if (rate.max_ratecount_data.rate_count.count <= 0)
      rate.max_ratecount_data.rate_count.count = 0

    // console.log('Count:', rate.max_ratecount_data.rate_count.count)

    rate.max_ratecount_data.rate_count.count_total++

    maxratecount_data.set({
      rate_count: { count: rate.max_ratecount_data.rate_count.count, count_total: rate.max_ratecount_data.rate_count.count_total, timestamp: now },
      ratecount_end: end
    })

    if (rate.max_ratecount_data.rate_count.count > rate.max_ratecount)
      return false;
    return true
  }

  return false
}

const callApiFetch = async (url, endpoint) => {

  try {

    const checkratecount = checkRateCount(endpoint);
    if (!checkratecount) return false;

    hasBackground.subscribe((background) => {
      // console.log('[Fetch Background]:', background, endpoint)
    })

    let promise = fetch.background.expect(JSON).get(url)

    const response = await promise;

    if (response.hasOwnProperty('error')) {
      let errmsg = `[${response.statusCode}] ${response.error} ${response.message}`

      if (response.message === '["EAPI:Invalid nonce"]')
        throw errmsg
      if (response.message === '["EAPI:Rate limit exceeded"]')
        throw errmsg
    }
    else {
      return promise
    }
  }
  catch (error) {
    console.error("[ERROR] callApiFetch:", (typeof error !== undefined ? error : false))
  }
}

export default callApiFetch
import { _ } from 'svelte-i18n'
import { User } from 'store/userStore.js'
import { fetchTimeout } from 'store/store.js'
import checkRateCount from 'utils/checkRateCount.js'
import Fetch, { hasBackground } from 'svelte-fetch'

let background = 0
let timeout = false
let response = null
hasBackground.subscribe((v) => (background = v))
fetchTimeout.subscribe((v) => (timeout = v))

const fetchSvelte = new Fetch()

/**
 *  *****************
 *  FETCH METHOD
 *  *****************
 */

const parseJSON = (resp) => (resp.json ? resp.json() : resp)

const callApiFetch = async (params) => {
  const url = !params.url.includes('//')
    ? [location.protocol, location.host].join('//') + params.url
    : params.url
      ? params.url
      : false
  const method = params.method || 'GET'
  const endpoint = params.endpoint || false
  const token = params.token || false
  const body = params.body || false

  try {
    if (timeout.timeout) {
      const end = parseInt(timeout.started + timeout.timeout)
      const now = Date.now()
      if (now < end) {
        console.debug('Timeout:', parseInt(end - now) / 60000)
        return false
      }
    }

    // const checkratecount = checkRateCount(endpoint);
    // if (!checkratecount) return false;

    // console.log('[Fetch Background]:', background, endpoint)

    let errorTimeout = false
    let options = {
      headers: {
        'Content-Type': 'application/json',
        // eslint-disable-next-line no-undef, dot-notation
        'x-webapp-header': __App['env'].SITE_NAME
      }
    }

    if (token) {
      options = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          // eslint-disable-next-line no-undef, dot-notation
          'x-webapp-header': __App['env'].SITE_NAME
        }
      }
    }

    if (method === 'GET') {
      response = await fetchSvelte.background.expect(JSON).get(url, options)
    } else if (method === 'POST' && body) {
      response = await fetch(url, {
        method: 'POST',
        headers: options.headers,
        body: JSON.stringify(body)
      })

      if (response.status >= 200 && response.status < 300) {
        return response.json ? response.json() : response
      }
      return parseJSON(response).then((response) => {
        throw response
      })
    }

    // console.debug(`[RUNFECTH] ${endpoint}`, response)

    if (Object.prototype.hasOwnProperty.call(response, 'error')) {
      errorTimeout = response.timeout
      if (response.error === 'Permission denied') {
        alert($_('runfetch.permissionDenied'))
      }
      console.error(`[HAS ERROR]: ${endpoint} = ${response.error}`)
    }

    fetchTimeout.update((n) => {
      n.timeout = errorTimeout
      n.started = Date.now()
      return n
    })

    if (
      Object.prototype.hasOwnProperty.call(response, 'statusCode') &&
      response.statusCode === 401
    ) {
      User.signout()
      location.reload()
      return false
    } else return response
  } catch (error) {
    console.error('CATCH ERROR RUNFECTH:', error)
    return { error, endpoint }
  }
}

export default callApiFetch

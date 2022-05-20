// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
// eslint-disable-next-line no-unused-vars
import { _ } from 'svelte-i18n'
import Fetch from 'utils/Runfetch.js'
import { User } from 'store/userStore.js'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
let user

/*eslint-disable */
const backendUri =
  __App['env'].BACKEND_URI || [location.protocol, location.host].join('//')
/*eslint-disable */

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
User.subscribe((v) => (user = v))

class UserData {
  constructor() {
    this.promise = null
    this.endpoint = null
    this.params = null
    this.url = null
    this.server = backendUri + '/api/private/'
    this.token = user.token || false
  }

  /**
   *  *****************
   *  API REST METHOD
   *  *****************
   */

  // Get kraken /private/Balance
  async getBalance() {
    this.endpoint = 'balance'

    if (!this.token) {
      // eslint-disable-next-line no-undef
      console.error($_('userData.errorMessage') + ' : ' + this.endpoint)
    }

    try {
      this.url =
        this.server + this.endpoint + (this.params ? '/' + this.params : '')
      const res = await Fetch({
        url: this.url,
        endpoint: this.endpoint,
        token: this.token
      })
      return res
    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/TradeBalance
  async getTradeBalance(params) {
    this.endpoint = 'tradebalance'

    if (!this.token) {
      // eslint-disable-next-line no-undef
      console.error($_('userData.errorMessage') + ' : ' + this.endpoint)
    }

    try {
      this.params = typeof params !== 'undefined' ? params : ''
      this.url =
        this.server + this.endpoint + (this.params ? '/' + this.params : '')
      const res = await Fetch({
        url: this.url,
        endpoint: this.endpoint,
        token: this.token
      })
      return res
    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/OpenOrders
  async getOpenOrders(params) {
    this.endpoint = 'openorders'

    if (!this.token) {
      // eslint-disable-next-line no-undef
      console.error($_('userData.errorMessage') + ' : ' + this.endpoint)
    }

    params = Object.values(params).join('/')

    try {
      this.params = typeof params !== 'undefined' ? params : ''
      this.url =
        this.server + this.endpoint + (this.params ? '/' + this.params : '')
      const res = await Fetch({
        url: this.url,
        endpoint: this.endpoint,
        token: this.token
      })
      return res
    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/OpenOrders
  async getClosedOrders(params) {
    this.endpoint = 'closedorders'

    if (!this.token) {
      // eslint-disable-next-line no-undef
      console.error($_('userData.errorMessage') + ' : ' + this.endpoint)
    }

    params = Object.values(params).join('/')

    try {
      this.params = typeof params !== 'undefined' ? params : ''
      this.url =
        this.server + this.endpoint + (this.params ? '/' + this.params : '')
      const res = await Fetch({
        url: this.url,
        endpoint: this.endpoint,
        token: this.token
      })
      return res
    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/TradeVolume
  async getTradeVolume(params) {
    this.endpoint = 'tradevolume'

    if (!this.token) {
      // eslint-disable-next-line no-undef
      console.error($_('userData.errorMessage') + ' : ' + this.endpoint)
    }

    if (typeof params.pair === 'undefined' && !params.pair) {
      return {
        error: 'ERROR: No pair found!'
      }
    }

    try {
      this.params = params.pair
      this.url =
        this.server + this.endpoint + (this.params ? '/' + this.params : '')
      const res = await Fetch({
        url: this.url,
        endpoint: this.endpoint,
        token: this.token
      })
      return res
    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/Ledgers
  async getLedgers(params) {
    this.endpoint = 'ledgers'

    if (!this.token) {
      // eslint-disable-next-line no-undef
      console.error($_('userData.errorMessage') + ' : ' + this.endpoint)
    }

    try {
      this.url =
        this.server + this.endpoint + (this.params ? '/' + this.params : '')
      const res = await Fetch({
        url: this.url,
        endpoint: this.endpoint,
        token: this.token
      })
      return res
    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/TradeHistory
  async getTradesHistory(params) {
    this.endpoint = 'tradeshistory'

    if (!this.token) {
      // eslint-disable-next-line no-undef
      console.error($_('userData.errorMessage') + ' : ' + this.endpoint)
    }

    try {
      this.url =
        this.server + this.endpoint + (this.params ? '/' + this.params : '')
      const res = await Fetch({
        url: this.url,
        endpoint: this.endpoint,
        token: this.token
      })
      return res
    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/openPositions
  async getOpenPositions(params) {
    this.endpoint = 'openpositions'

    if (!this.token) {
      // eslint-disable-next-line no-undef
      console.error($_('userData.errorMessage') + ' : ' + this.endpoint)
    }

    params =
      typeof params !== 'undefined' ? Object.values(params).join('/') : params

    try {
      this.params = typeof params !== 'undefined' ? params : ''
      this.url =
        this.server + this.endpoint + (this.params ? '/' + this.params : '')
      const res = await Fetch({
        url: this.url,
        endpoint: this.endpoint,
        token: this.token
      })
      return res
    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/AddOrder
  async addOrder(params) {
    this.endpoint = 'addorder'

    if (!this.token) {
      // eslint-disable-next-line no-undef
      console.error($_('userData.errorMessage') + ' : ' + this.endpoint)
    }

    try {
      this.params = typeof params !== 'undefined' ? params : ''
      this.url = this.server + this.endpoint
      return await Fetch({
        url: this.url,
        endpoint: this.endpoint,
        token: this.token,
        method: 'POST',
        body: this.params
      })
    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/addExport
  async addExport(params) {
    this.endpoint = 'addexport'

    if (!this.token) {
      // eslint-disable-next-line no-undef
      console.error($_('userData.errorMessage') + ' : ' + this.endpoint)
    }

    params =
      typeof params !== 'undefined' ? Object.values(params).join('/') : params

    try {
      this.params = typeof params !== 'undefined' ? params : ''
      this.url =
        this.server + this.endpoint + (this.params ? '/' + this.params : '')
      const res = await Fetch({
        url: this.url,
        endpoint: this.endpoint,
        token: this.token
      })
      return res
    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/statusExport
  async statusExport(params) {
    this.endpoint = 'statusexport'

    if (!this.token) {
      // eslint-disable-next-line no-undef
      console.error($_('userData.errorMessage') + ' : ' + this.endpoint)
    }

    params =
      typeof params !== 'undefined' ? Object.values(params).join('/') : params

    try {
      this.params = typeof params !== 'undefined' ? params : ''
      this.url =
        this.server + this.endpoint + (this.params ? '/' + this.params : '')
      const res = await Fetch({
        url: this.url,
        endpoint: this.endpoint,
        token: this.token
      })

      return res
    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/retrieveExport
  async retrieveExport(params) {
    this.endpoint = 'retrieveexport'

    if (!this.token) {
      // eslint-disable-next-line no-undef
      console.error($_('userData.errorMessage') + ' : ' + this.endpoint)
    }

    params =
      typeof params !== 'undefined' ? Object.values(params).join('/') : params

    try {
      this.params = typeof params !== 'undefined' ? params : ''
      this.url =
        this.server + this.endpoint + (this.params ? '/' + this.params : '')
      const res = await Fetch({
        url: this.url,
        endpoint: this.endpoint,
        token: this.token
      })
      return res
    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/removeOldFile
  async removeOldFile(params) {
    this.endpoint = 'removeoldexport'

    if (!this.token) {
      // eslint-disable-next-line no-undef
      console.error($_('userData.errorMessage') + ' : ' + this.endpoint)
    }

    params =
      typeof params !== 'undefined' ? Object.values(params).join('/') : params

    try {
      this.params = typeof params !== 'undefined' ? params : ''
      this.url =
        this.server + this.endpoint + (this.params ? '/' + this.params : '')
      const res = await Fetch({
        url: this.url,
        endpoint: this.endpoint,
        token: this.token
      })
      return res
    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/readExport
  async readExport(params) {
    this.endpoint = 'readexport'

    if (!this.token) {
      // eslint-disable-next-line no-undef
      console.error($_('userData.errorMessage') + ' : ' + this.endpoint)
    }

    params =
      typeof params !== 'undefined' ? Object.values(params).join('/') : params
    try {
      this.params = typeof params !== 'undefined' ? params : ''
      this.url =
        this.server + this.endpoint + (this.params ? '/' + this.params : '')
      const res = await Fetch({
        url: this.url,
        endpoint: this.endpoint,
        token: this.token
      })
      return res
    } catch (error) {
      console.error(error)
    }
  }

  // Check if folder exist
  async checkExportExist(params) {
    this.endpoint = 'checkexport'

    if (!this.token) {
      // eslint-disable-next-line no-undef
      console.error($_('userData.errorMessage') + ' : ' + this.endpoint)
    }

    params =
      typeof params === 'object' ? Object.values(params).join('/') : params

    try {
      this.params = typeof params !== 'undefined' ? params : ''
      this.url =
        this.server + this.endpoint + (this.params ? '/' + this.params : '')
      return await Fetch({
        url: this.url,
        endpoint: this.endpoint,
        token: this.token
      })
    } catch (error) {
      console.error(error)
    }
  }
} // End class

export default UserData

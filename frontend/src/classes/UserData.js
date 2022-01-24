import Fetch from "utils/Runfetch.js"
import { fetchurl } from "store/store.js";

let url;
fetchurl.subscribe((v) => url = v);

class UserData {
  constructor() {
    this.promise = null;
    this.endpoint = null;
    this.params = null;
    this.url = null;
    this.server = url + "/api/private/";
  }

  /**
   *  *****************
   *  API REST METHOD
   *  *****************
   */

  // Get kraken /private/Balance
  async getBalance() {
    try {
      this.endpoint = "balance"
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/TradeBalance
  async getTradeBalance(params) {
    try {
      this.endpoint = "tradebalance"
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/OpenOrders
  async getOpenOrders(params) {

    params = Object.values(params).join('/')

    try {
      this.endpoint = "openorders"
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/OpenOrders
  async getClosedOrders(params) {

    params = Object.values(params).join('/')

    try {
      this.endpoint = "closedorders"
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/TradeVolume
  async getTradeVolume(params) {

    if (typeof params.pair === undefined && !params.pair) {
      params.pair = "XBTUSD"
    }

    try {
      this.endpoint = "tradevolume"
      this.params = params.pair
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/Ledgers
  async getLedgers(params) {
    try {
      this.endpoint = "ledgers"
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/TradeHistory
  async getTradesHistory(params) {
    try {
      this.endpoint = "tradeshistory"
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/openPositions
  async getOpenPositions(params) {

    params = (typeof params !== "undefined") ? Object.values(params).join('/') : params

    try {
      this.endpoint = "openpositions"
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/addExport
  async addExport(params) {

    params = (typeof params !== "undefined") ? Object.values(params).join('/') : params

    try {
      this.endpoint = "addexport"
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/statusExport
  async statusExport(params) {

    params = (typeof params !== "undefined") ? Object.values(params).join('/') : params

    try {
      this.endpoint = "statusexport"
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error')) {
        if (res.hasOwnProperty('statusCode') && res.hasOwnProperty('message'))
          return { error: "ERROR: " + res.statusCode + " " + res.message }
      }

      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/retrieveExport
  async retrieveExport(params) {

    params = (typeof params !== "undefined") ? Object.values(params).join('/') : params

    try {
      this.endpoint = "retrieveexport"
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/removeOldFile
  async removeOldFile(params) {

    params = (typeof params !== "undefined") ? params : ''

    try {
      this.endpoint = "removeoldexport"
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      const res = await Fetch(this.url, this.endpoint)
      return res;
    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/readExport
  async readExport(params) {

    params = (typeof params !== "undefined") ? Object.values(params).join('/') : params
    try {
      this.endpoint = "readexport"
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Check if folder exist
  async checkExportExist(params) {
    params = (typeof params === "object") ? Object.values(params).join('/') : params

    try {
      this.endpoint = "checkexport"
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      return await Fetch(this.url, this.endpoint)
    } catch (error) {
      console.error(error)
    }
  }

} // End class

export default UserData
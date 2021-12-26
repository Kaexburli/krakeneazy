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

    // if (typeof params.pair === undefined && !params.pair) {
    //   params.pair = "XBTUSD"
    // }

    try {
      this.endpoint = "ledgers"
      // this.params = params.pair
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

    // if (typeof params.pair === undefined && !params.pair) {
    //   params.pair = "XBTUSD"
    // }

    try {
      this.endpoint = "tradeshistory"
      // this.params = params.pair
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

} // End class

export default UserData
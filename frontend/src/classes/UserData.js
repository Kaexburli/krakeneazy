import { _ } from "svelte-i18n";
import Fetch from "utils/Runfetch.js"
import { fetchurl } from "store/store.js";
import { User } from "store/userStore.js";

let url;
let user;
fetchurl.subscribe((v) => url = v);
User.subscribe((v) => user = v);

class UserData {
  constructor() {
    this.promise = null;
    this.endpoint = null;
    this.params = null;
    this.url = null;
    this.server = url + "/api/private/";
    this.token = user.token || false;
  }

  /**
   *  *****************
   *  API REST METHOD
   *  *****************
   */

  // Get kraken /private/Balance
  async getBalance() {
    this.endpoint = "balance";

    if (!this.token) {
      console.log($_("userData.errorMessage") + " : " + this.endpoint)
    }

    try {
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint, this.token)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/TradeBalance
  async getTradeBalance(params) {
    this.endpoint = "tradebalance";

    if (!this.token) {
      console.log($_("userData.errorMessage") + " : " + this.endpoint)
    }

    try {
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint, this.token)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/OpenOrders
  async getOpenOrders(params) {
    this.endpoint = "openorders";

    if (!this.token) {
      console.log($_("userData.errorMessage") + " : " + this.endpoint);
    }

    params = Object.values(params).join('/');

    try {
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint, this.token)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/OpenOrders
  async getClosedOrders(params) {
    this.endpoint = "closedorders";

    if (!this.token) {
      console.log($_("userData.errorMessage") + " : " + this.endpoint)
    }

    params = Object.values(params).join('/');

    try {
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint, this.token)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/TradeVolume
  async getTradeVolume(params) {
    this.endpoint = "tradevolume"

    if (!this.token) {
      console.log($_("userData.errorMessage") + " : " + this.endpoint)
    }

    if (typeof params.pair === undefined && !params.pair) {
      params.pair = "XBTUSD"
    }

    try {
      this.params = params.pair
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint, this.token)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/Ledgers
  async getLedgers(params) {
    this.endpoint = "ledgers";

    if (!this.token) {
      console.log($_("userData.errorMessage") + " : " + this.endpoint)
    }

    try {
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint, this.token)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/TradeHistory
  async getTradesHistory(params) {
    this.endpoint = "tradeshistory";

    if (!this.token) {
      console.log($_("userData.errorMessage") + " : " + this.endpoint)
    }

    try {
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint, this.token)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/openPositions
  async getOpenPositions(params) {
    this.endpoint = "openpositions";

    if (!this.token) {
      console.log($_("userData.errorMessage") + " : " + this.endpoint)
    }

    params = (typeof params !== "undefined") ? Object.values(params).join('/') : params

    try {
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint, this.token)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/addExport
  async addExport(params) {
    this.endpoint = "addexport";

    if (!this.token) {
      console.log($_("userData.errorMessage") + " : " + this.endpoint)
    }

    params = (typeof params !== "undefined") ? Object.values(params).join('/') : params

    try {
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint, this.token)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/statusExport
  async statusExport(params) {
    this.endpoint = "statusexport";

    if (!this.token) {
      console.log($_("userData.errorMessage") + " : " + this.endpoint)
    }

    params = (typeof params !== "undefined") ? Object.values(params).join('/') : params

    try {
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint, this.token)

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
    this.endpoint = "retrieveexport";

    if (!this.token) {
      console.log($_("userData.errorMessage") + " : " + this.endpoint)
    }

    params = (typeof params !== "undefined") ? Object.values(params).join('/') : params

    try {
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint, this.token)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/removeOldFile
  async removeOldFile(params) {
    this.endpoint = "removeoldexport";

    if (!this.token) {
      console.log($_("userData.errorMessage") + " : " + this.endpoint)
    }

    params = (typeof params !== "undefined") ? params : ''

    try {
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      const res = await Fetch(this.url, this.endpoint, this.token)
      return res;
    } catch (error) {
      console.error(error)
    }
  }

  // Get kraken /private/readExport
  async readExport(params) {
    this.endpoint = "readexport";

    if (!this.token) {
      console.log($_("userData.errorMessage") + " : " + this.endpoint)
    }

    params = (typeof params !== "undefined") ? Object.values(params).join('/') : params
    try {
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      let res = await Fetch(this.url, this.endpoint, this.token)

      if ((typeof res !== 'undefined') && res.hasOwnProperty('error'))
        return { error: "ERROR: " + res.statusCode + " " + res.message }
      return res

    } catch (error) {
      console.error(error)
    }
  }

  // Check if folder exist
  async checkExportExist(params) {
    this.endpoint = "checkexport";

    if (!this.token) {
      console.log($_("userData.errorMessage") + " : " + this.endpoint)
    }

    params = (typeof params === "object") ? Object.values(params).join('/') : params

    try {
      this.params = (typeof params !== "undefined") ? params : "";
      this.url = this.server + this.endpoint + (this.params ? "/" + this.params : "")
      return await Fetch(this.url, this.endpoint, this.token)
    } catch (error) {
      console.error(error)
    }
  }

} // End class

export default UserData
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Variables
import { writable } from 'svelte/store';
import { wssurl, devise } from "store/store.js";
import checkRateCount from "utils/checkRateCount.js";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Variables
const debug = false;
const tradebalance = writable({});
const worker = new Worker("../service-worker.js");

let wss_tradebalance, devise_val;
devise.subscribe((value) => devise_val = value);
wssurl.subscribe((value) => wss_tradebalance = value + "/tradebalance/" + devise_val);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Fonction CreateWorker
const createWorker = () => {
  //send message to Worker.js
  worker.postMessage({
    command: 'connect',
    subscribe: 'tradebalance',
    message: '[TRADEBALANCE] Websocket connect',
    wssurl: wss_tradebalance
  });
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Fonction listenerWorker
const listenerWorker = () => {
  // Listen response from worker
  worker.addEventListener("message", function (oEvent) {

    let command = oEvent.data.command;

    switch (command) {
      case ("connect"): case ("onOpen"):
        if (debug) console.info("[WORKER][" + command + "] %c" + oEvent.data.message, "color: lawngreen;", command);
        break;

      case ("disconnect"): case ("onClose"): case ("closeworker"):
        if (debug) console.warn("[WORKER][" + command + "] %c" + JSON.stringify(oEvent.data.message), "color: yellow;");
        break;

      case ("onError"): case ("listener"):
        if (debug) console.error("[WORKER][" + command + "] %c" + oEvent.data.message, "color: darkred;");
        break;

      case ("inComing"):
        if (debug) console.info("[WORKER][" + command + "] %c" + oEvent.data.message, "color: cyan;");

        if (oEvent.data.hasOwnProperty("status") && oEvent.data.status) {
          if (oEvent.data.status.hasOwnProperty('errorMessage')) {
            console.error(
              oEvent.data.status.event,
              oEvent.data.status.errorMessage,
              oEvent.data.status.subscription.name
            )
            // closeWorker();
            // createWorker();
          } else {
            if (debug) console.info("[WORKER][" + oEvent.data.status.channelName + "] %c" + oEvent.data.status.status, "color: lawngreen;");
          }
        }

        let response = oEvent.data.data

        let rate = response.rate;
        delete response.rate;
        let rateinfo = checkRateCount("tradebalance", rate);
        if (rateinfo.rate_count.count >= rateinfo.rate_count.max_counter) closeWorker()

        if (response) tradebalance.set(response);
        break;

      default:
        console.log('Switch default', command)
        if (oEvent.data.hasOwnProperty('error') && oEvent.data.error) {
          console.error("[WORKER][" + command + "]", oEvent.data.message);
        }
        else {
          if (debug) console.info("[WORKER][" + command + "] %c" + JSON.stringify(oEvent.data.message), "color: darkcyan;");
          break;
        }
    }
  }, false);
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Fonction closeWorker
const closeWorker = () => {
  if (debug) console.log('[MAIN] closeWorker')
  worker.postMessage({
    unsubscribe: 'tradebalance',
    command: 'disconnect',
    message: '[TRADEBALANCE] Websocket disconnect.',
    wssurl: wss_tradebalance
  });
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Fonction runTradeBalanceWs
const runTradeBalanceWs = () => {
  createWorker();
  listenerWorker();
}
runTradeBalanceWs()

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ export
export const wstradebalance = {
  subscribe: tradebalance.subscribe,
  unsubscribe: closeWorker
}
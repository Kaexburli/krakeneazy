// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Variables
import { writable } from 'svelte/store';
import { wssurl, maxratecount } from "store/store.js";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Variables
const debug = false;
const openorders = writable({});
const worker = new Worker("../service-worker.js");
let wss_openorders;
wssurl.subscribe((value) => wss_openorders = value + "/openorders");


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Fonction CreateWorker
const createWorker = () => {
  //send connect message to service-worker.js
  worker.postMessage({
    command: 'connect',
    subscribe: 'openorders',
    message: '[OPENORDERS] Websocket connect.',
    wssurl: wss_openorders,
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

          // Ajoute la valeur maxratecount au localsotrage
          if (typeof oEvent.data.status.subscription.maxratecount !== 'undefined')
            maxratecount.set(oEvent.data.status.subscription.maxratecount)

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
        if (response) openorders.set(response);
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
    unsubscribe: 'openorders',
    command: 'disconnect',
    message: '[OPENORDERS] Websocket disconnect.',
    wssurl: wss_openorders
  });
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Fonction runOpenOrdersWs
const runOpenOrdersWs = () => {
  createWorker();
  listenerWorker();
}
runOpenOrdersWs()

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ export
export const wsopenorders = {
  subscribe: openorders.subscribe,
  unsubscribe: closeWorker
}
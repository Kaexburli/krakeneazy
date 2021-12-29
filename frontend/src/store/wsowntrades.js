// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Variables
import { writable } from 'svelte/store';
import { wssurl } from "store/store.js";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Variables
const debug = false;
const owntrades = writable({});
const worker = new Worker("../service-worker.js");

let wss_owntrades;
wssurl.subscribe((value) => wss_owntrades = value + "/owntrades");


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Fonction CreateWorker
const createWorker = () => {
  //send connect message to service-worker.js
  worker.postMessage({
    command: 'connect',
    subscribe: 'owntrades',
    message: '[OWNTRADES]  Websocket connect',
    wssurl: wss_owntrades,
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
        if (response) owntrades.set(response);
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
    unsubscribe: 'owntrades',
    command: 'disconnect',
    message: '[OWNTRADES] Websocket disconnect.',
    wssurl: wss_owntrades
  });
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Fonction runOwnTradesWs
const runOwnTradesWs = () => {
  createWorker();
  listenerWorker();
}
runOwnTradesWs()

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ export
export const wsowntrades = {
  subscribe: owntrades.subscribe,
  unsubscribe: closeWorker
}
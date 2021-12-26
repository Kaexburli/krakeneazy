const debug = false;
import { writable } from 'svelte/store';
import { wssurl } from "store/store.js";

//Create a workers object
const owntrades = writable({});
const worker = new Worker("../service-worker.js");

let wss_owntrades;
wssurl.subscribe((value) => wss_owntrades = value + "/owntrades");


// Fonction CreateWorker
const createWorker = () => {
  //send connect message to service-worker.js
  worker.postMessage({
    command: 'connect',
    subscribe: 'owntrades',
    message: '[OWNTRADES] Call websocket connect.',
    wssurl: wss_owntrades,
  });
}

const listenWorker = () => {
  // Listen response from worker
  worker.addEventListener("message", function (oEvent) {

    let command = oEvent.data.command;

    switch (command) {
      case ("connect"): case ("onOpen"):
        if (debug) console.info("[SERVICE WORKER][" + command + "] %c" + oEvent.data.message, "color: lawngreen;", command);
        break;

      case ("disconnect"): case ("onClose"): case ("closeworker"):
        if (debug) console.warn("[SERVICE WORKER][" + command + "] %c" + JSON.stringify(oEvent.data.message), "color: yellow;");
        break;

      case ("onError"): case ("listener"):
        if (debug) console.error("[SERVICE WORKER][" + command + "] %c" + oEvent.data.message, "color: darkred;");
        break;

      case ("inComing"):
        if (debug) console.info("[SERVICE WORKER][" + command + "] %c" + oEvent.data.message, "color: cyan;");

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
            if (debug) console.info("[SERVICE WORKER][" + oEvent.data.status.channelName + "] %c" + oEvent.data.status.status, "color: lawngreen;");
          }
        }

        let response = oEvent.data.data
        if (response) owntrades.set(response);
        break;

      default:
        console.log('Switch default', command)
        if (oEvent.data.hasOwnProperty('error') && oEvent.data.error) {
          console.error("[SERVICE WORKER][" + command + "]", oEvent.data.message);
        }
        else {
          if (debug) console.info("[SERVICE WORKER][" + command + "] %c" + JSON.stringify(oEvent.data.message), "color: darkcyan;");
          break;
        }
    }
  }, false);
}

const closeWorker = () => {
  if (debug) console.log('[MAIN] closeWorker')

  worker.postMessage({
    unsubscribe: 'owntrades',
    command: 'disconnect',
    message: '[OWNTRADES] Call websocket disconnect.',
    wssurl: wss_owntrades
  });
  if (debug) console.log('[MAIN] Disconnect')
}

// runOwnTradesWs
const runOwnTradesWs = () => {
  createWorker();
  listenWorker();
}

runOwnTradesWs()
export const wsowntrades = {
  subscribe: owntrades.subscribe,
  unsubscribe: closeWorker
}
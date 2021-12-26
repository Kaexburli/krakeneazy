import { writable } from 'svelte/store';
import { wssurl, devise } from "store/store.js";

const debug = false;

const tradebalance = writable({});

let wssurl_val, devise_val;
wssurl.subscribe((value) => wssurl_val = value);
devise.subscribe((value) => devise_val = value);

let wss_tradebalance = wssurl_val + "/tradebalance/";

//Create a workers object
let worker = new Worker("../service-worker.js");

const createWorker = () => {

  //send message to Worker.js
  worker.postMessage({
    command: 'connect',
    subscribe: 'tradebalance',
    message: '[' + devise_val + '] Call websocket connect.',
    wssurl: wss_tradebalance + devise_val
  });

  // Listen response from worker
  worker.addEventListener("message", function (oEvent) {

    let command = oEvent.data.command;

    if ((command === "connect" || command === "onOpen") && debug)
      console.info("%c" + oEvent.data.message, "color: lawngreen;");
    if ((command === "disconnect" || command === "onClose" || command === "closeworker") && debug)
      console.warn(oEvent.data.message);
    if ((command === "onError" || command === "listener") && debug)
      console.error(oEvent.data.message);
    if (oEvent.data.hasOwnProperty('error') && oEvent.data.error) {
      console.error(oEvent.data.message);
    }
    else {
      if (debug) console.info("%c[MASTER] " + oEvent.data.message, "color: darkcyan;");

      if (command === "inComing")
        tradebalance.set(oEvent.data.data);
    }
  }, false);
}

const closeWorker = () => {
  if (debug) console.log('[MAIN] closeWorker')

  worker.postMessage({
    command: 'disconnect',
    message: '[WSTRADE BALANCE] Call websocket connect.',
    wssurl: wss_tradebalance
  });

  if (debug) console.log('[MAIN] Disconnect', worker)

}

createWorker();

export const wstradebalance = {
  subscribe: tradebalance.subscribe,
  unsubscribe: closeWorker
}
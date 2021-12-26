import { writable } from 'svelte/store';
import { wssurl, pair, assetpair } from "store/store.js";

const spread = writable({});

const debug = false;

let wssurl_val, pair_val, assetpair_val, spread_val;
wssurl.subscribe((value) => wssurl_val = value);
pair.subscribe((value) => pair_val = value);
assetpair.subscribe((value) => assetpair_val = value);
spread.subscribe((value) => spread_val = value);

let wss_spread = wssurl_val + "/spread/";

//Create a workers object
let worker = new Worker("../service-worker.js");

const createWorker = (pair) => {

  if (typeof pair === "undefined") return false;

  //send message to Worker.js
  worker.postMessage({
    command: 'connect',
    subscribe: 'spread',
    message: '[' + pair + '] Call websocket connect.',
    wssurl: wss_spread + pair
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
        spread.set(oEvent.data.data);
    }
  }, false);
}

const closeWorker = () => {
  if (debug) console.log('[MAIN] closeWorker')

  worker.postMessage({
    command: 'disconnect',
    message: '[WSSPREAD] Call websocket disconnect.',
    wssurl: wss_openorders + trades
  });
  if (debug) console.log('[MAIN] Disconnect', worker)

}

createWorker(assetpair_val.wsname);

export const wsspread = {
  subscribe: spread.subscribe,
  unsubscribe: closeWorker
}
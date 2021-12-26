import { writable } from 'svelte/store';
import { wssurl, devise } from "store/store.js";

const debug = false;

const systemstatus = writable({});

let wssurl_val;
wssurl.subscribe((value) => wssurl_val = value);

let wss_systemstatus = wssurl_val + "/systemstatus";

//Create a workers object
let worker = new Worker("../service-worker.js");

const createWorker = () => {

  //send message to Worker.js
  worker.postMessage({
    command: 'connect',
    subscribe: 'systemstatus',
    message: '[SYSTEMSTATUS] Call websocket connect.',
    wssurl: wss_systemstatus
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
        systemstatus.set(oEvent.data.data);
    }
  }, false);
}

const closeWorker = () => {
  if (debug) console.log('[MAIN] closeWorker')

  worker.postMessage({
    command: 'disconnect',
    message: '[SYSTEMSTATUS] Call websocket connect.',
    wssurl: wss_systemstatus
  });

  if (debug) console.log('[MAIN] Disconnect', worker)

}

createWorker();

export const wssystemstatus = {
  subscribe: systemstatus.subscribe,
  unsubscribe: closeWorker
}
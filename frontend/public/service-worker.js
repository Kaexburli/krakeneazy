//Define WebSocket and protocol variables
let ws = null;
let debug = false;
let debug_service = 'openOrders';
const clients = new Set();

// Message receive from Master
self.addEventListener('message', function (oEvent) {

  if (debug) console.info("%c[WORKER] ", "color: chocolate;", oEvent.data.message);

  let data = oEvent.data;
  let command = data.command;

  if (!data.hasOwnProperty('wssurl')) {
    self.postMessage({
      command: 'listener',
      error: true,
      message: '[WORKER] ERROR: No websocket url found',
    });
    return false
  }

  if (command === 'connect') {
    connect(data); //Establish WebSocket connection
  }
  else if (command === 'disconnect') {
    disconnect(oEvent); //Disconnect WebSocket connection
  }
  else if (command === 'closeworker') {
    console.log('close')
    self.close(1000); // Close worker connection
  }
}, false);

/* -----------------  Application events functions */

const connect = (data) => {

  if (debug) console.info("%c[WORKER] connect", "color: chocolate;")

  if (clients.size === 0) {
    ws = new WebSocket(data.wssurl);
    let addClient = []
    addClient[data.subscribe] = ws
    clients.add(addClient);
  }
  else {
    for (let client of clients) {
      if (client.hasOwnProperty(data.subscribe)) {

        if (client[data.subscribe].readyState === 1) {
          ws = client[data.subscribe]
        } else {
          ws = new WebSocket(data.wssurl);
        }
      }
      else {
        ws = new WebSocket(data.wssurl);
      }
    }
  }


  if (debug) console.info("%c[WORKER] WEBSOCKET: ", "color: chocolate;", ws.url)

  ws.onopen = onOpen(data.subscribe);
  ws.onmessage = onMessage;
  ws.onerror = onError;
  ws.onclose = onClose;

  self.postMessage({
    command: 'connect',
    error: false,
    message: 'Connecting....' + JSON.stringify(data.subscribe),
  });

}

const disconnect = (data) => {
  console.info("%c[WORKER] Disconnect", "color: red;", data.data.unsubscribe, data.data.command, data.data.message)

  self.postMessage({
    service: data.data.unsubscribe,
    command: 'disconnect',
    error: false,
    message: 'Disconnect',
  });

  clients.forEach((client) => {
    client[data.data.unsubscribe].close(1000)
    clients.delete(client[data.data.unsubscribe])
  });

  console.log('clients', clients)
}

/* -----------------  WS events */

const onOpen = (event) => {
  if (debug) console.info("%c[WORKER] onOpen:", "color: chocolate;", JSON.stringify(event))
  self.postMessage({
    command: 'onOpen',
    error: false,
    message: `[${event}] Connected !!`,
  });
}

const onMessage = (event) => {
  let service = "NO SERVICE"
  let data = JSON.parse(event.data.toString())

  let response = {
    command: 'nothing',
    error: true,
    message: '[' + service + '] response from worker',
    data: data
  }

  if (typeof data !== 'undefined') {

    service = (data.hasOwnProperty('service')) ? data.service : service;
    status = (data.hasOwnProperty('status')) ? data.status : false;
    data = (data.hasOwnProperty('data')) ? data.data : data.eventMessage;

    response = {
      command: 'inComing',
      error: false,
      message: '[' + service + '] response from worker',
      data: data,
      status
    }

    // if (service === 'OpenOrders') console.log(event)
  }
  if (debug || (service === debug_service)) console.log(response)

  self.postMessage(response);
};

const onError = (event) => {
  if (debug) console.info("%c[WORKER] onError:", "color: chocolate;", JSON.stringify(event))
  self.postMessage({
    command: 'onError',
    error: true,
    message: 'ERROR' + event,
  });
};

const onClose = (event) => {
  if (debug) console.info("%c[WORKER] onClose:", "color: chocolate;", JSON.stringify(event))
  self.postMessage({
    command: 'onClose',
    error: false,
    message: 'Close (' + event.code + ") " + event.reason,
  });
};
import { derived } from 'svelte/store';
import { assetpair, interval, devise, pricealertlist } from "store/store.js";
import { User } from "store/userStore.js";
import websocketStore from "svelte-websocket-store";
const environment = __env["ENVIRONMENT"] === "development" ? true : false
const server = __env["BACKEND_WS_URI"];
const depth = 10;

/**
 * Call Ticker Websocket
 *************************/
export const WSTicker = derived([assetpair], ([$assetpair], set) => {

  const ticker_url = $assetpair ? `${server}/ticker/${$assetpair.wsname}` : false;
  const ticker_websocket = websocketStore(ticker_url);
  const stop = ticker_websocket.subscribe((tick) => {
    if (tick) {
      if (tick.hasOwnProperty('status') && environment) {
        if (tick.status.status === 'error') {
          console.error(`[${tick.status.pair}] Websocket Ticker ${tick.status.errorMessage}`)
        } else {
          console.warn(`[${tick.status.channelID}] ${tick.status.status === "subscribed" ? "Connect" : "Disconnect"} to channel [${tick.status.channelName.toUpperCase()}|${tick.status.pair}] ${tick.status.status}!`)
        }
      }
      else if (tick.hasOwnProperty('data') && tick.data) {
        if (tick.service === 'Ticker') set(tick.data);
      }
    }
  });

  return stop;
}, false);


/**
 * Call Ticker Websocket for alert
 **********************************/
export const WSTickerAlert = derived([assetpair, pricealertlist, WSTicker], ([$assetpair, $pricealertlist, $WSTicker], set) => {

  let wsTickerAlert = [],
    ticker_alert_urls = [],
    hasCurrentAssetPair = false;
  // List des pairs
  let ticker_pair = Object.keys($pricealertlist);
  // Si la pair selectionné n'est pas dans la liste on l'ajoute
  if (ticker_pair.includes($assetpair.wsname)) {
    hasCurrentAssetPair = true;
    const index = ticker_pair.indexOf($assetpair.wsname)
    ticker_pair.splice(index, 1)
  }
  // On boucle sur la liste et on créer une connexion websocket pour chaque pair
  ticker_pair.map((tickpair) => {
    ticker_alert_urls[tickpair] = `${server}/ticker/${tickpair}`;
    wsTickerAlert[tickpair] = websocketStore(ticker_alert_urls[tickpair]);
  });
  // // On boucle chaque connexion websocket pour y souscrire
  let obj = {}, objStop = {};
  for (const tickpair in wsTickerAlert) {
    if (Object.hasOwnProperty.call(wsTickerAlert, tickpair)) {
      const socket = wsTickerAlert[tickpair];
      objStop[tickpair] = socket.subscribe((tick) => {
        if (tick) {
          if (tick.hasOwnProperty('status') && environment) {
            if (tick.status.status === 'error') {
              console.error(`[${tick.status.pair}] Websocket Ticker ${tick.status.errorMessage}`)
            } else {
              console.warn(`[${tick.status.channelID}] ${tick.status.status === "subscribed" ? "Connect" : "Disconnect"} to channel [TICKER ALERT|${tick.status.pair}] ${tick.status.status}!`)
            }
          }
          else if (tick.hasOwnProperty('data') && tick.data) {
            if (tick.service === 'Ticker') {
              if (hasCurrentAssetPair && $WSTicker) {
                obj[$assetpair.wsname] = $WSTicker;
              }
              // On set toutes les données
              obj[tickpair] = tick.data;
              set(obj);
            }
          }
        }
      });
    }
  }

  return objStop;
}, false);


/**
 * Call Book Websocket
 *************************/
export const WSBook = derived([assetpair], ([$assetpair], set) => {
  const book_url = $assetpair ? `${server}/book/${$assetpair.wsname}/${depth}` : false;
  const book_websocket = websocketStore(book_url);
  const stop = book_websocket.subscribe((tick) => {
    if (tick) {
      if (tick.hasOwnProperty('status') && environment) {
        if (tick.status.status === 'error') {
          console.error(`[${tick.status.pair}] Websocket Book ${tick.status.errorMessage}`)
        } else {
          console.warn(`[${tick.status.channelID}] ${tick.status.status === "subscribed" ? "Connect" : "Disconnect"} to channel [${tick.status.channelName.toUpperCase()}|${tick.status.pair}] ${tick.status.status}!`)
        }
      }
      else if (tick.hasOwnProperty('data') && tick.data) {
        if (tick.service === 'OrderBook') set(tick.data);
      }
    }
  });

  return stop;
}, false);


/**
 * Call Ohlc Websocket
 *************************/
export const WSOhlc = derived([assetpair, interval], ([$assetpair, $interval], set) => {
  const ohlc_url = $assetpair ? `${server}/ohlc/${$assetpair.wsname}/${$interval}` : false;
  const ohlc_websocket = websocketStore(ohlc_url);
  const stop = ohlc_websocket.subscribe((tick) => {
    if (tick) {
      if (tick.hasOwnProperty('status') && environment) {
        if (tick.status.status === 'error') {
          console.error(`[${tick.status.pair}] Websocket Ohlc ${tick.status.errorMessage}`)
        } else {
          console.warn(`[${tick.status.channelID}] ${tick.status.status === "subscribed" ? "Connect" : "Disconnect"} to channel [${tick.status.channelName.toUpperCase()}|${tick.status.pair}] ${tick.status.status}!`)
        }
      }
      else if (tick.hasOwnProperty('data') && tick.data) {
        if (tick.service === 'Ohlc') set(tick.data);
      }
    }
  });

  return stop;
}, false);


/**
 * Call Spread Websocket
 *************************/
export const WSSpread = derived([assetpair], ([$assetpair], set) => {
  const spread_url = $assetpair ? `${server}/spread/${$assetpair.wsname}` : false;
  const spread_websocket = websocketStore(spread_url);
  const stop = spread_websocket.subscribe((tick) => {
    if (tick) {
      if (tick.hasOwnProperty('status') && environment) {
        if (tick.status.status === 'error') {
          console.error(`[${tick.status.pair}] Websocket Spread ${tick.status.errorMessage}`)
        } else {
          console.warn(`[${tick.status.channelID}] ${tick.status.status === "subscribed" ? "Connect" : "Disconnect"} to channel [${tick.status.channelName.toUpperCase()}|${tick.status.pair}] ${tick.status.status}!`)
        }
      }
      else if (tick.hasOwnProperty('data') && tick.data) {
        if (tick.service === 'Spread') set(tick.data);
      }
    }
  });

  return stop;
}, false);


/**
 * Call Trade Websocket
 *************************/
export const WSTrade = derived([assetpair], ([$assetpair], set) => {
  const trade_url = $assetpair ? `${server}/trade/${$assetpair.wsname}` : false;
  const trade_websocket = websocketStore(trade_url);
  const stop = trade_websocket.subscribe((tick) => {
    if (tick) {
      if (tick.hasOwnProperty('status') && environment) {
        if (tick.status.status === 'error') {
          console.error(`[${tick.status.pair}] Websocket Trade ${tick.status.errorMessage}`)
        } else {
          console.warn(`[${tick.status.channelID}] ${tick.status.status === "subscribed" ? "Connect" : "Disconnect"} to channel [${tick.status.channelName.toUpperCase()}|${tick.status.pair}] ${tick.status.status}!`)
        }
      }
      else if (tick.hasOwnProperty('data') && tick.data) {
        if (tick.service === 'Trade') set(tick.data);
      }
    }
  });

  return stop;
}, false);


/**
 * Call OpenOrders Websocket
 *************************/
export const WSOpenOrders = derived([User], ([$User], set) => {
  const openorders_url = $User.id ? `${server}/openorders/${$User.id}` : false;
  const openorders_websocket = websocketStore(openorders_url);
  const stop = openorders_websocket.subscribe((tick) => {
    if (tick) {
      if (tick.hasOwnProperty('status') && environment) {
        if (tick.status.status === 'error') {
          console.error(`[${tick.status.pair}] Websocket OpenOrders ${tick.status.errorMessage}`)
        } else {
          console.warn(`${tick.status.status === "subscribed" ? "Connect" : "Disconnect"} to channel [${tick.status.channelName.toUpperCase()}|${tick.status.subscription.maxratecount}] ${tick.status.status}!`)
          console.error('maxratecount a mettre dans la base de données !!!!!!!!!!!!!!')
        }
      }
      else if (tick.hasOwnProperty('data') && tick.data) {
        if (tick.service === 'OpenOrders') set(tick.data);
      }
    }
  });

  return stop;
}, false);


/**
 * Call OwnTrades Websocket
 *************************/
export const WSOwnTrades = derived([User], ([$User], set) => {
  const owntrades_url = $User.id ? `${server}/owntrades/${$User.id}` : false;
  const owntrades_websocket = websocketStore(owntrades_url);
  const stop = owntrades_websocket.subscribe((tick) => {
    if (tick) {
      if (tick.hasOwnProperty('status') && environment) {
        if (tick.status.status === 'error') {
          console.error(`[${tick.status.pair}] Websocket OwnTrades ${tick.status.errorMessage}`)
        } else {
          console.warn(`${tick.status.status === "subscribed" ? "Connect" : "Disconnect"} to channel [${tick.status.channelName.toUpperCase()}] ${tick.status.status}!`)
        }
      }
      else if (tick.hasOwnProperty('data') && tick.data) {
        if (tick.service === 'OwnTrades') set(tick.data);
      }
    }
  });

  return stop;
}, false);


/**
 * Call TradeBalance Websocket
 *************************/
export const WSTradeBalance = derived([User, devise], ([$User, $devise], set) => {
  const tradebalance_url = ($devise && $User.id) ? `${server}/tradebalance/${$devise}/${$User.id}` : false;
  const tradebalance_websocket = websocketStore(tradebalance_url);
  const stop = tradebalance_websocket.subscribe((tick) => {
    if (tick) {
      if (tick.hasOwnProperty('data') && tick.data) {
        if (tick.service === 'WsTradeBalance') set(tick.data);
      }
    }
  });

  return stop;
}, false);
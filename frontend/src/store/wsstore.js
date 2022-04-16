import { derived } from 'svelte/store'
import {
  assetpair,
  interval,
  devise,
  pricealertlist,
  depth
} from 'store/store.js'
import { User } from 'store/userStore.js'
import websocketStore from 'svelte-websocket-store'
// eslint-disable-next-line no-undef
const environment = __env.ENVIRONMENT === 'development'
const server =
  location.protocol === 'http:'
    ? `${['ws:', location.host].join('//')}`
    : `${['wss:', location.host].join('//')}`

/**
 * Call Ticker Websocket
 *************************/
export const WSTicker = derived(
  [assetpair],
  ([$assetpair], set) => {
    const tickerUrl = $assetpair
      ? `${server}/api/ws/ticker/${$assetpair.wsname}`
      : false
    const tickerWebsocket = websocketStore(tickerUrl)
    const stop = tickerWebsocket.subscribe((tick) => {
      if (tick) {
        if (
          Object.prototype.hasOwnProperty.call(tick, 'status') &&
          environment
        ) {
          if (tick.status.status === 'error') {
            console.error(
              `[${tick.status.pair}] Websocket Ticker ${tick.status.errorMessage}`
            )
          } else {
            console.warn(
              `[${tick.status.channelID}] ${
                tick.status.status === 'subscribed' ? 'Connect' : 'Disconnect'
              } to channel [${tick.status.channelName.toUpperCase()}|${
                tick.status.pair
              }] ${tick.status.status}!`
            )
          }
        } else if (
          Object.prototype.hasOwnProperty.call(tick, 'data') &&
          tick.data
        ) {
          if (tick.service === 'Ticker') set(tick.data)
        }
      }
    })

    return stop
  },
  false
)

/**
 * Call Ticker Websocket for alert
 **********************************/
export const WSTickerAlert = derived(
  [assetpair, pricealertlist, WSTicker],
  ([$assetpair, $pricealertlist, $WSTicker], set) => {
    const wsTickerAlert = []
    const tickerAlertUrls = []
    let hasCurrentAssetPair = false
    // List des pairs
    const tickerPair = Object.keys($pricealertlist)
    // Si la pair selectionné n'est pas dans la liste on l'ajoute
    if (tickerPair.includes($assetpair.wsname)) {
      hasCurrentAssetPair = true
      const index = tickerPair.indexOf($assetpair.wsname)
      tickerPair.splice(index, 1)
    }
    // On boucle sur la liste et on créer une connexion websocket pour chaque pair
    tickerPair.map((tickpair) => {
      tickerAlertUrls[tickpair] = `${server}/api/ws/ticker/${tickpair}`
      wsTickerAlert[tickpair] = websocketStore(tickerAlertUrls[tickpair])
      return true
    })
    // // On boucle chaque connexion websocket pour y souscrire
    const obj = {}
    const objStop = {}
    for (const tickpair in wsTickerAlert) {
      if (Object.hasOwnProperty.call(wsTickerAlert, tickpair)) {
        const socket = wsTickerAlert[tickpair]
        objStop[tickpair] = socket.subscribe((tick) => {
          if (tick) {
            if (
              Object.prototype.hasOwnProperty.call(tick, 'status') &&
              environment
            ) {
              if (tick.status.status === 'error') {
                console.error(
                  `[${tick.status.pair}] Websocket Ticker ${tick.status.errorMessage}`
                )
              } else {
                console.warn(
                  `[${tick.status.channelID}] ${
                    tick.status.status === 'subscribed'
                      ? 'Connect'
                      : 'Disconnect'
                  } to channel [TICKER ALERT|${tick.status.pair}] ${
                    tick.status.status
                  }!`
                )
              }
            } else if (
              Object.prototype.hasOwnProperty.call(tick, 'data') &&
              tick.data
            ) {
              if (tick.service === 'Ticker') {
                if (hasCurrentAssetPair && $WSTicker) {
                  obj[$assetpair.wsname] = $WSTicker
                }
                // On set toutes les données
                obj[tickpair] = tick.data
                set(obj)
              }
            }
          }
        })
      }
    }

    return objStop
  },
  false
)

/**
 * Call Book Websocket
 *************************/
export const WSBook = derived(
  [assetpair, depth],
  ([$assetpair, $depth], set) => {
    const bookUrl = $assetpair
      ? `${server}/api/ws/book/${$assetpair.wsname}/${$depth}`
      : false
    const bookWebsocket = websocketStore(bookUrl)
    const stop = bookWebsocket.subscribe((tick) => {
      if (tick) {
        if (
          Object.prototype.hasOwnProperty.call(tick, 'status') &&
          environment
        ) {
          if (tick.status.status === 'error') {
            console.error(
              `[${tick.status.pair}] Websocket Book ${tick.status.errorMessage}`
            )
          } else {
            console.warn(
              `[${tick.status.channelID}] ${
                tick.status.status === 'subscribed' ? 'Connect' : 'Disconnect'
              } to channel [${tick.status.channelName.toUpperCase()}|${
                tick.status.pair
              }] ${tick.status.status}!`
            )
          }
        } else if (
          Object.prototype.hasOwnProperty.call(tick, 'data') &&
          tick.data
        ) {
          if (tick.service === 'OrderBook') set(tick.data)
        }
      }
    })

    return stop
  },
  false
)

/**
 * Call Ohlc Websocket
 *************************/
export const WSOhlc = derived(
  [assetpair, interval],
  ([$assetpair, $interval], set) => {
    const ohlcUrl = $assetpair
      ? `${server}/api/ws/ohlc/${$assetpair.wsname}/${$interval}`
      : false
    const ohlcWebsocket = websocketStore(ohlcUrl)
    const stop = ohlcWebsocket.subscribe((tick) => {
      if (tick) {
        if (
          Object.prototype.hasOwnProperty.call(tick, 'status') &&
          environment
        ) {
          if (tick.status.status === 'error') {
            console.error(
              `[${tick.status.pair}] Websocket Ohlc ${tick.status.errorMessage}`
            )
          } else {
            console.warn(
              `[${tick.status.channelID}] ${
                tick.status.status === 'subscribed' ? 'Connect' : 'Disconnect'
              } to channel [${tick.status.channelName.toUpperCase()}|${
                tick.status.pair
              }] ${tick.status.status}!`
            )
          }
        } else if (
          Object.prototype.hasOwnProperty.call(tick, 'data') &&
          tick.data
        ) {
          if (tick.service === 'Ohlc') set(tick.data)
        }
      }
    })

    return stop
  },
  false
)

/**
 * Call Spread Websocket
 *************************/
export const WSSpread = derived(
  [assetpair],
  ([$assetpair], set) => {
    const spreadUrl = $assetpair
      ? `${server}/api/ws/spread/${$assetpair.wsname}`
      : false
    const spreadWebsocket = websocketStore(spreadUrl)
    const stop = spreadWebsocket.subscribe((tick) => {
      if (tick) {
        if (
          Object.prototype.hasOwnProperty.call(tick, 'status') &&
          environment
        ) {
          if (tick.status.status === 'error') {
            console.error(
              `[${tick.status.pair}] Websocket Spread ${tick.status.errorMessage}`
            )
          } else {
            console.warn(
              `[${tick.status.channelID}] ${
                tick.status.status === 'subscribed' ? 'Connect' : 'Disconnect'
              } to channel [${tick.status.channelName.toUpperCase()}|${
                tick.status.pair
              }] ${tick.status.status}!`
            )
          }
        } else if (
          Object.prototype.hasOwnProperty.call(tick, 'data') &&
          tick.data
        ) {
          if (tick.service === 'Spread') set(tick.data)
        }
      }
    })

    return stop
  },
  false
)

/**
 * Call Trade Websocket
 *************************/
export const WSTrade = derived(
  [assetpair],
  ([$assetpair], set) => {
    const tradeUrl = $assetpair
      ? `${server}/api/ws/trade/${$assetpair.wsname}`
      : false
    const tradeWebsocket = websocketStore(tradeUrl)
    const stop = tradeWebsocket.subscribe((tick) => {
      if (tick) {
        if (
          Object.prototype.hasOwnProperty.call(tick, 'status') &&
          environment
        ) {
          if (tick.status.status === 'error') {
            console.error(
              `[${tick.status.pair}] Websocket Trade ${tick.status.errorMessage}`
            )
          } else {
            console.warn(
              `[${tick.status.channelID}] ${
                tick.status.status === 'subscribed' ? 'Connect' : 'Disconnect'
              } to channel [${tick.status.channelName.toUpperCase()}|${
                tick.status.pair
              }] ${tick.status.status}!`
            )
          }
        } else if (
          Object.prototype.hasOwnProperty.call(tick, 'data') &&
          tick.data
        ) {
          if (tick.service === 'Trade') set(tick.data)
        }
      }
    })

    return stop
  },
  false
)

/**
 * Call OpenOrders Websocket
 *************************/
export const WSOpenOrders = derived(
  [User],
  ([$User], set) => {
    const openordersUrl = $User.id
      ? `${server}/api/ws/openorders/${$User.id}`
      : false
    const openordersWebsocket = websocketStore(openordersUrl)
    const stop = openordersWebsocket.subscribe((tick) => {
      if (tick) {
        if (
          Object.prototype.hasOwnProperty.call(tick, 'status') &&
          environment
        ) {
          if (tick.status.status === 'error') {
            console.error(
              `[${tick.status.pair}] Websocket OpenOrders ${tick.status.errorMessage}`
            )
          } else {
            console.warn(
              `${
                tick.status.status === 'subscribed' ? 'Connect' : 'Disconnect'
              } to channel [${tick.status.channelName.toUpperCase()}|${
                tick.status.subscription.maxratecount
              }] ${tick.status.status}!`
            )
            console.error(
              'maxratecount a mettre dans la base de données !!!!!!!!!!!!!!'
            )
          }
        } else if (
          Object.prototype.hasOwnProperty.call(tick, 'data') &&
          tick.data
        ) {
          if (tick.service === 'OpenOrders') set(tick.data)
        }
      }
    })

    return stop
  },
  false
)

/**
 * Call OwnTrades Websocket
 *************************/
export const WSOwnTrades = derived(
  [User],
  ([$User], set) => {
    const owntradesUrl = $User.id
      ? `${server}/api/ws/owntrades/${$User.id}`
      : false
    const owntradesWebsocket = websocketStore(owntradesUrl)
    const stop = owntradesWebsocket.subscribe((tick) => {
      if (tick) {
        if (
          Object.prototype.hasOwnProperty.call(tick, 'status') &&
          environment
        ) {
          if (tick.status.status === 'error') {
            console.error(
              `[${tick.status.pair}] Websocket OwnTrades ${tick.status.errorMessage}`
            )
          } else {
            console.warn(
              `${
                tick.status.status === 'subscribed' ? 'Connect' : 'Disconnect'
              } to channel [${tick.status.channelName.toUpperCase()}] ${
                tick.status.status
              }!`
            )
          }
        } else if (
          Object.prototype.hasOwnProperty.call(tick, 'data') &&
          tick.data
        ) {
          if (tick.service === 'OwnTrades') set(tick.data)
        }
      }
    })

    return stop
  },
  false
)

/**
 * Call TradeBalance Websocket
 *************************/
export const WSTradeBalance = derived(
  [User, devise],
  ([$User, $devise], set) => {
    const tradebalanceUrl =
      $devise && $User.id
        ? `${server}/api/ws/tradebalance/${$devise}/${$User.id}`
        : false
    const tradebalanceWebsocket = websocketStore(tradebalanceUrl)
    const stop = tradebalanceWebsocket.subscribe((tick) => {
      if (tick) {
        if (Object.prototype.hasOwnProperty.call(tick, 'data') && tick.data) {
          if (tick.service === 'WsTradeBalance') set(tick.data)
        }
      }
    })

    return stop
  },
  false
)

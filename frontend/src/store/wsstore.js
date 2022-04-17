// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
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

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
const debug = false
const server =
  location.protocol === 'http:'
    ? `${['ws:', location.host].join('//')}`
    : `${['wss:', location.host].join('//')}`

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
/**
 * Call Ticker Websocket
 *************************/
export const WSTicker = derived(
  [assetpair],
  ([$assetpair], set) => {
    const tickerUrl = $assetpair
      ? `${server}/api/ws/ticker/${$assetpair.wsname}`
      : false

    if (tickerUrl) {
      const tickerWebsocket = websocketStore(tickerUrl)
      const ticker = tickerWebsocket.subscribe((tick) => {
        if (tick) {
          if (
            Object.prototype.hasOwnProperty.call(tick, 'status') &&
            // eslint-disable-next-line no-undef, dot-notation
            __App['env'].ENVIRONMENT === 'development'
          ) {
            if (tick.status.status === 'error') {
              console.error(
                `[${tick.status.pair}] Websocket Ticker ${tick.status.errorMessage}`
              )
            } else {
              if (debug) {
                console.debug(
                  `[${tick.status.channelID}] ${
                    tick.status.status === 'subscribed'
                      ? 'Connect'
                      : 'Disconnect'
                  } to channel [${tick.status.channelName.toUpperCase()}|${
                    tick.status.pair
                  }] ${tick.status.status}!`
                )
              }
            }
          } else if (
            Object.prototype.hasOwnProperty.call(tick, 'data') &&
            tick.data
          ) {
            if (tick.service === 'Ticker') set(tick.data)
          }
        }
      })

      return ticker
    }

    return false
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
      tickerAlertUrls[tickpair] = tickpair
        ? `${server}/api/ws/ticker/${tickpair}`
        : false
      if (tickerAlertUrls[tickpair]) {
        wsTickerAlert[tickpair] = websocketStore(tickerAlertUrls[tickpair])
      }
      return true
    })
    // // On boucle chaque connexion websocket pour y souscrire
    const obj = {}
    const tickerAlert = {}
    for (const tickpair in wsTickerAlert) {
      if (Object.hasOwnProperty.call(wsTickerAlert, tickpair)) {
        const socket = wsTickerAlert[tickpair]
        tickerAlert[tickpair] = socket.subscribe((tick) => {
          if (tick) {
            if (
              Object.prototype.hasOwnProperty.call(tick, 'status') &&
              // eslint-disable-next-line no-undef, dot-notation
              __App['env'].ENVIRONMENT === 'development'
            ) {
              if (tick.status.status === 'error') {
                console.error(
                  `[${tick.status.pair}] Websocket Ticker ${tick.status.errorMessage}`
                )
              } else {
                if (debug) {
                  console.debug(
                    `[${tick.status.channelID}] ${
                      tick.status.status === 'subscribed'
                        ? 'Connect'
                        : 'Disconnect'
                    } to channel [TICKER ALERT|${tick.status.pair}] ${
                      tick.status.status
                    }!`
                  )
                }
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

    return tickerAlert
  },
  false
)

/**
 * Call Book Websocket
 *************************/
export const WSBook = derived(
  [assetpair, depth],
  ([$assetpair, $depth], set) => {
    const bookUrl =
      $assetpair && $depth
        ? `${server}/api/ws/book/${$assetpair.wsname}/${$depth}`
        : false

    if (bookUrl) {
      const bookWebsocket = websocketStore(bookUrl)
      const book = bookWebsocket.subscribe((tick) => {
        if (tick) {
          if (
            Object.prototype.hasOwnProperty.call(tick, 'status') &&
            // eslint-disable-next-line no-undef, dot-notation
            __App['env'].ENVIRONMENT === 'development'
          ) {
            if (tick.status.status === 'error') {
              console.error(
                `[${tick.status.pair}] Websocket Book ${tick.status.errorMessage}`
              )
            } else {
              if (debug) {
                console.debug(
                  `[${tick.status.channelID}] ${
                    tick.status.status === 'subscribed'
                      ? 'Connect'
                      : 'Disconnect'
                  } to channel [${tick.status.channelName.toUpperCase()}|${
                    tick.status.pair
                  }] ${tick.status.status}!`
                )
              }
            }
          } else if (
            Object.prototype.hasOwnProperty.call(tick, 'data') &&
            tick.data
          ) {
            if (tick.service === 'OrderBook') set(tick.data)
          }
        }
      })

      return book
    }

    return false
  },
  false
)

/**
 * Call Ohlc Websocket
 *************************/
export const WSOhlc = derived(
  [assetpair, interval],
  ([$assetpair, $interval], set) => {
    const ohlcUrl =
      $assetpair && $interval
        ? `${server}/api/ws/ohlc/${$assetpair.wsname}/${$interval}`
        : false

    if (ohlcUrl) {
      const ohlcWebsocket = websocketStore(ohlcUrl)
      const ohlc = ohlcWebsocket.subscribe((tick) => {
        if (tick) {
          if (
            Object.prototype.hasOwnProperty.call(tick, 'status') &&
            // eslint-disable-next-line no-undef, dot-notation
            __App['env'].ENVIRONMENT === 'development'
          ) {
            if (tick.status.status === 'error') {
              console.error(
                `[${tick.status.pair}] Websocket Ohlc ${tick.status.errorMessage}`
              )
            } else {
              if (debug) {
                console.debug(
                  `[${tick.status.channelID}] ${
                    tick.status.status === 'subscribed'
                      ? 'Connect'
                      : 'Disconnect'
                  } to channel [${tick.status.channelName.toUpperCase()}|${
                    tick.status.pair
                  }] ${tick.status.status}!`
                )
              }
            }
          } else if (
            Object.prototype.hasOwnProperty.call(tick, 'data') &&
            tick.data
          ) {
            if (tick.service === 'Ohlc') set(tick.data)
          }
        }
      })

      return ohlc
    }

    return false
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

    if (spreadUrl) {
      const spreadWebsocket = websocketStore(spreadUrl)
      const spread = spreadWebsocket.subscribe((tick) => {
        if (tick) {
          if (
            Object.prototype.hasOwnProperty.call(tick, 'status') &&
            // eslint-disable-next-line no-undef, dot-notation
            __App['env'].ENVIRONMENT === 'development'
          ) {
            if (tick.status.status === 'error') {
              console.error(
                `[${tick.status.pair}] Websocket Spread ${tick.status.errorMessage}`
              )
            } else {
              if (debug) {
                console.debug(
                  `[${tick.status.channelID}] ${
                    tick.status.status === 'subscribed'
                      ? 'Connect'
                      : 'Disconnect'
                  } to channel [${tick.status.channelName.toUpperCase()}|${
                    tick.status.pair
                  }] ${tick.status.status}!`
                )
              }
            }
          } else if (
            Object.prototype.hasOwnProperty.call(tick, 'data') &&
            tick.data
          ) {
            if (tick.service === 'Spread') set(tick.data)
          }
        }
      })

      return spread
    }

    return false
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

    if (tradeUrl) {
      const tradeWebsocket = websocketStore(tradeUrl)
      const trade = tradeWebsocket.subscribe((tick) => {
        if (tick) {
          if (
            Object.prototype.hasOwnProperty.call(tick, 'status') &&
            // eslint-disable-next-line no-undef, dot-notation
            __App['env'].ENVIRONMENT === 'development'
          ) {
            if (tick.status.status === 'error') {
              console.error(
                `[${tick.status.pair}] Websocket Trade ${tick.status.errorMessage}`
              )
            } else {
              if (debug) {
                console.debug(
                  `[${tick.status.channelID}] ${
                    tick.status.status === 'subscribed'
                      ? 'Connect'
                      : 'Disconnect'
                  } to channel [${tick.status.channelName.toUpperCase()}|${
                    tick.status.pair
                  }] ${tick.status.status}!`
                )
              }
            }
          } else if (
            Object.prototype.hasOwnProperty.call(tick, 'data') &&
            tick.data
          ) {
            if (tick.service === 'Trade') set(tick.data)
          }
        }
      })

      return trade
    }

    return false
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

    if (openordersUrl) {
      const openordersWebsocket = websocketStore(openordersUrl)
      const openorders = openordersWebsocket.subscribe((tick) => {
        if (tick) {
          if (
            Object.prototype.hasOwnProperty.call(tick, 'status') &&
            // eslint-disable-next-line no-undef, dot-notation
            __App['env'].ENVIRONMENT === 'development'
          ) {
            if (tick.status.status === 'error') {
              console.error(
                `[${tick.status.pair}] Websocket OpenOrders ${tick.status.errorMessage}`
              )
            } else {
              if (debug) {
                console.debug(
                  `${
                    tick.status.status === 'subscribed'
                      ? 'Connect'
                      : 'Disconnect'
                  } to channel [${tick.status.channelName.toUpperCase()}|${
                    tick.status.subscription.maxratecount
                  }] ${tick.status.status}!`
                )
              }
              console.debug(
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

      return openorders
    }

    return false
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

    if (owntradesUrl) {
      const owntradesWebsocket = websocketStore(owntradesUrl)
      const owntrades = owntradesWebsocket.subscribe((tick) => {
        if (tick) {
          if (
            Object.prototype.hasOwnProperty.call(tick, 'status') &&
            // eslint-disable-next-line no-undef, dot-notation
            __App['env'].ENVIRONMENT === 'development'
          ) {
            if (tick.status.status === 'error') {
              console.error(
                `[${tick.status.pair}] Websocket OwnTrades ${tick.status.errorMessage}`
              )
            } else {
              if (debug) {
                console.debug(
                  `${
                    tick.status.status === 'subscribed'
                      ? 'Connect'
                      : 'Disconnect'
                  } to channel [${tick.status.channelName.toUpperCase()}] ${
                    tick.status.status
                  }!`
                )
              }
            }
          } else if (
            Object.prototype.hasOwnProperty.call(tick, 'data') &&
            tick.data
          ) {
            if (tick.service === 'OwnTrades') set(tick.data)
          }
        }
      })

      return owntrades
    }

    return false
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

    if (tradebalanceUrl) {
      const tradebalanceWebsocket = websocketStore(tradebalanceUrl)
      const tradebalance = tradebalanceWebsocket.subscribe((tick) => {
        if (tick) {
          if (Object.prototype.hasOwnProperty.call(tick, 'data') && tick.data) {
            if (tick.service === 'WsTradeBalance') set(tick.data)
          }
        }
      })

      return tradebalance
    }

    return false
  },
  false
)

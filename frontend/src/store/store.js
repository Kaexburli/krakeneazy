// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import { writable, readable, derived } from 'svelte/store'
import { BrowserTabTracker } from 'browser-session-tabs'

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
BrowserTabTracker.initialize({
  // eslint-disable-next-line no-undef, dot-notation
  storageKey: __App['env'].SITE_NAME,
  sessionIdGenerator: () => {
    return Math.floor(new Date().getTime() * (Math.random() * 1000000))
  },
  sessionStartedCallback: (sessionId, tabId) => {}
})

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
const sessionId = BrowserTabTracker.sessionId
const tabId = BrowserTabTracker.tabId
const prefixStorage = sessionId + '_' + tabId

// Tableau de remplacement des assets
const assetReplace = {
  DOT: { name: 'Polkadot', icon: 'dot', symbol: 'DOT' },
  FLOW: { name: 'Flow', icon: 'flo', symbol: 'FLOW' },
  USDT: { name: 'Tether USD', icon: 'usdt', symbol: 'USDT' },
  XETH: { name: 'Ethereum', icon: 'eth', symbol: 'ETH' },
  XXBT: { name: 'Bitcoin', icon: 'btc', symbol: '₿' },
  XXDG: { name: 'Dogecoin', icon: 'doge', symbol: 'DOGE' },
  XXRP: { name: 'Ripple', icon: 'xrp', symbol: 'XRP' },
  ZEUR: { name: 'EUR', icon: 'eur', symbol: '€' },
  ZUSD: { name: 'Dollar US', icon: 'usd', symbol: '$' }
}

export const setResizeChart = writable(false)
export const candleTimeout = writable(false)
export const asymbole = writable(assetReplace)
export const depth = writable(1000)
export const ledgersdata = writable(false)
export const tradedata = writable(false)
export const closedordersdata = writable(false)
export const tradeshistorydata = writable(false)
export const openordersdata = writable(false)
export const ohlcchart = writable(false)
export const volumechart = writable(false)
export const ledgersregister = writable([])
export const tradesregister = writable(false)

// Affichage date et heure /Clok.svelte
export const time = readable(new Date(), function start (set) {
  const intval = setInterval(() => {
    set(new Date())
  }, 1000)

  return function stop () {
    clearInterval(intval)
  }
})

// compteur /Clok.svelte
const start = new Date()
export const elapsed = derived(time, ($time) =>
  Math.round(($time - start) / 1000)
)

// Storage maxratecount (STRING)
const storedMaxratecount = localStorage.getItem('maxratecount') || 60
export const maxratecount = writable(storedMaxratecount)
maxratecount.subscribe((value) => {
  localStorage.setItem('maxratecount', value !== false ? value : 60)
})

// Storage devise (STRING)
const storedDevise = localStorage.getItem(`${prefixStorage}_devise`) || 'ZUSD'
export const devise = writable(storedDevise)
devise.subscribe((value) => {
  localStorage.setItem(
    `${prefixStorage}_devise`,
    value !== false ? value : 'ZUSD'
  )
})

// Storage sound (STRING)
const storedSound = localStorage.getItem(`${prefixStorage}_sound`) || 'up'
export const sound = writable(storedSound)
sound.subscribe((value) => {
  localStorage.setItem(
    `${prefixStorage}_sound`,
    value !== false ? value : false
  )
})

// Storage online (STRING)
const storedOnline = localStorage.getItem(`${prefixStorage}_online`) || true
export const online = writable(storedOnline)
online.subscribe((value) => {
  localStorage.setItem(
    `${prefixStorage}_online`,
    value !== 'false' ? value : true
  )
})

// Storage page (STRING)
const storedPage = localStorage.getItem(`${prefixStorage}_page`) || 'home'
export const page = writable(storedPage)
page.subscribe((value) => {
  localStorage.setItem(
    `${prefixStorage}_page`,
    value !== 'home' ? value : 'home'
  )
})

// Storage interval (STRING)
const storedInterval = localStorage.getItem(`${prefixStorage}_interval`) || '60'
const availableInterval = ['1', '5', '15', '30', '60', '240', '1440', '10080']
export const interval = writable(storedInterval)
interval.subscribe((value) => {
  if (!availableInterval.includes(value)) value = '60'
  localStorage.setItem(
    `${prefixStorage}_interval`,
    value !== '60' ? value : '60'
  )
})

// Storage searched pair name (STRING)
const storedPair = localStorage.getItem(`${prefixStorage}_pair`) || false
export const pair = writable(storedPair)
pair.subscribe((value) => {
  localStorage.setItem(
    `${prefixStorage}_pair`,
    value !== 'false' ? value : false
  )
})

// Storage toogleBoxTicker (STRING)
const storedToogleBoxTicker =
  localStorage.getItem(`${prefixStorage}_toogleBoxTicker`) || 'open'
export const toogleBoxTicker = writable(storedToogleBoxTicker)
toogleBoxTicker.subscribe((value) => {
  localStorage.setItem(
    `${prefixStorage}_toogleBoxTicker`,
    value !== false ? value : 'open'
  )
})

// Storage devise (OBJECT)
const storedMaxratecountDataDefault = JSON.stringify({
  rate_count: {
    count: 0,
    count_total: 0,
    timestamp: Date.now(),
    ratecount_end: null
  }
})
const storedMaxratecountData =
  JSON.parse(localStorage.getItem('maxratecountData')) ||
  storedMaxratecountDataDefault
export const maxratecountData = writable(storedMaxratecountData)
maxratecountData.subscribe((value) => {
  value = typeof value === 'object' ? JSON.stringify(value) : value
  localStorage.setItem(
    'maxratecountData',
    value !== false ? value : storedMaxratecountDataDefault
  )
})

// Storage assetpairs all (OBJECT)
const storedAssetPairs =
  JSON.parse(localStorage.getItem(`${sessionId}_assetpairs`)) || false
export const assetpairs = writable(storedAssetPairs)
assetpairs.subscribe((value) => {
  value = typeof value === 'object' ? JSON.stringify(value) : false
  localStorage.setItem(
    `${sessionId}_assetpairs`,
    value !== 'false' ? value : false
  )
})

// Storage assets (OBJECT)
const storedAssets =
  JSON.parse(localStorage.getItem(`${sessionId}_assets`)) || false
export const assets = writable(storedAssets)
assets.subscribe((value) => {
  value = typeof value === 'object' ? JSON.stringify(value) : false
  localStorage.setItem(`${sessionId}_assets`, value !== 'false' ? value : false)
})

// Storage asset pair value (OBJECT)
const storedAssetPair =
  JSON.parse(localStorage.getItem(`${prefixStorage}_assetpair`)) || false
export const assetpair = writable(storedAssetPair)
assetpair.subscribe((value) => {
  value = typeof value === 'object' ? JSON.stringify(value) : false
  localStorage.setItem(`${prefixStorage}_assetpair`, value || Boolean(false))
})

// Storage asset pair value (OBJECT)
const storedSeries =
  JSON.parse(localStorage.getItem(`${prefixStorage}_series`)) || false
export const series = writable(storedSeries)
series.subscribe((value) => {
  value = typeof value === 'object' ? JSON.stringify(value) : false
  localStorage.setItem(`${prefixStorage}_series`, value || Boolean(false))
})

// Storage price alert list (OBJECT)
const storedPriceAlertList =
  JSON.parse(localStorage.getItem(`${sessionId}_pricealertlist`)) || {}
export const pricealertlist = writable(storedPriceAlertList)
pricealertlist.subscribe((value) => {
  value = typeof value === 'object' ? JSON.stringify(value) : {}
  localStorage.setItem(
    `${sessionId}_pricealertlist`,
    value !== 'false' ? value : {}
  )
})

// Storage exportcsv all (OBJECT)
const defaultStoredExportCSV = JSON.stringify({ ledgers: false, trades: false })
const storedExportCSV =
  JSON.parse(localStorage.getItem(`${sessionId}_exportcsv`)) ||
  defaultStoredExportCSV
export const exportcsv = writable(storedExportCSV)
exportcsv.subscribe((value) => {
  value =
    typeof value === 'object' ? JSON.stringify(value) : defaultStoredExportCSV
  localStorage.setItem(
    `${sessionId}_exportcsv`,
    value !== 'false' ? value : defaultStoredExportCSV
  )
})

// Storage fetchTimeout (STRING)
const storedFetchTimeoutDataDefault = JSON.stringify({
  timeout: false,
  started: Date.now()
})
const storedFetchTimeout = JSON.parse(
  localStorage.getItem(`${sessionId}_fetchTimeout`) ||
    storedFetchTimeoutDataDefault
)
export const fetchTimeout = writable(storedFetchTimeout)
fetchTimeout.subscribe((value) => {
  value = typeof value === 'object' ? JSON.stringify(value) : value
  localStorage.setItem(
    `${sessionId}_fetchTimeout`,
    value !== false ? value : storedFetchTimeoutDataDefault
  )
})

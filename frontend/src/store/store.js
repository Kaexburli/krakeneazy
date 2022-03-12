import { writable, readable, derived } from 'svelte/store';





// Tableau de remplacement des assets
const asset_replace = {
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



export const setResizeChart = writable(false);
export const candleTimeout = writable(false);
export const asymbole = writable(asset_replace);
export const ledgersdata = writable(false);
export const closedordersdata = writable(false);
export const tradeshistorydata = writable(false);
export const openordersdata = writable(false);
export const ohlcchart = writable(false);
export const volumechart = writable(false);
export const ledgersregister = writable([]);
export const tradesregister = writable(false);





// Affichage date et heure /Clok.svelte
export const time = readable(new Date(), function start(set) {
  const intval = setInterval(() => {
    set(new Date());
  }, 1000);

  return function stop() {
    clearInterval(intval);
  };
});

// compteur /Clok.svelte
const start = new Date();
export const elapsed = derived(
  time,
  $time => Math.round(($time - start) / 1000)
);







// Storage maxratecount (STRING)
const storedMaxratecount = localStorage.getItem("maxratecount") || 60;
export const maxratecount = writable(storedMaxratecount);
maxratecount.subscribe(value => {
  localStorage.setItem("maxratecount", (value !== false) ? value : 60);
});

// Storage devise (STRING)
const storedDevise = localStorage.getItem("devise") || "ZUSD";
export const devise = writable(storedDevise);
devise.subscribe(value => {
  localStorage.setItem("devise", (value !== false) ? value : "ZUSD");
});

// Storage sound (STRING)
const storedSound = localStorage.getItem("sound") || "up";
export const sound = writable(storedSound);
sound.subscribe(value => {
  localStorage.setItem("sound", (value !== false) ? value : false);
});

// Storage online (STRING)
const storedOnline = localStorage.getItem("online") || true;
export const online = writable(storedOnline);
online.subscribe(value => {
  localStorage.setItem("online", (value !== "false") ? value : true);
});

// Storage page (STRING)
const storedPage = localStorage.getItem("page") || "home";
export const page = writable(storedPage);
page.subscribe(value => {
  localStorage.setItem("page", (value !== "home") ? value : "home");
});

// Storage interval (STRING)
const storedInterval = localStorage.getItem("interval") || "60";
let availableInterval = ['1', '5', '15', '30', '60', '240', '1440', '10080'];
export const interval = writable(storedInterval);
interval.subscribe(value => {
  if (!availableInterval.includes(value)) value = "60"
  localStorage.setItem("interval", (value !== "60") ? value : "60");
});

// Storage searched pair name (STRING)
const storedPair = localStorage.getItem("pair") || false;
export const pair = writable(storedPair);
pair.subscribe(value => {
  localStorage.setItem("pair", (value !== "false") ? value : false);
});




// Storage devise (OBJECT)
const storedMaxratecountDataDefault = JSON.stringify({ rate_count: { count: 0, count_total: 0, timestamp: Date.now(), ratecount_end: null } });
const storedMaxratecountData = JSON.parse(localStorage.getItem("maxratecount_data")) || storedMaxratecountDataDefault;
export const maxratecount_data = writable(storedMaxratecountData);
maxratecount_data.subscribe(value => {
  value = (typeof value === 'object') ? JSON.stringify(value) : value
  localStorage.setItem("maxratecount_data", (value !== false) ? value : storedMaxratecountDataDefault);
});

// Storage assetpairs all (OBJECT)
const storedAssetPairs = JSON.parse(localStorage.getItem("assetpairs")) || false;
export const assetpairs = writable(storedAssetPairs);
assetpairs.subscribe(value => {
  value = (typeof value === 'object') ? JSON.stringify(value) : false
  localStorage.setItem("assetpairs", (value !== "false") ? value : false);
});

// Storage assets (OBJECT)
const storedAssets = JSON.parse(localStorage.getItem("assets")) || false;
export const assets = writable(storedAssets);
assets.subscribe(value => {
  value = (typeof value === 'object') ? JSON.stringify(value) : false
  localStorage.setItem("assets", (value !== "false") ? value : false);
});

// Storage asset pair value (OBJECT)
const storedAssetPair = JSON.parse(localStorage.getItem("assetpair")) || false;
export const assetpair = writable(storedAssetPair);
assetpair.subscribe(value => {
  value = (typeof value === 'object') ? JSON.stringify(value) : false
  localStorage.setItem("assetpair", value ? value : Boolean(false));
});

// Storage asset pair value (OBJECT)
const storedSeries = JSON.parse(localStorage.getItem("series")) || false;
export const series = writable(storedSeries);
series.subscribe(value => {
  value = (typeof value === 'object') ? JSON.stringify(value) : false
  localStorage.setItem("series", value ? value : Boolean(false));
});

// Storage price alert list (OBJECT)
const storedPriceAlertList = JSON.parse(localStorage.getItem("pricealertlist")) || {};
export const pricealertlist = writable(storedPriceAlertList);
pricealertlist.subscribe(value => {
  value = (typeof value === 'object') ? JSON.stringify(value) : {};
  localStorage.setItem("pricealertlist", (value !== "false") ? value : {});
});

// Storage exportcsv all (OBJECT)
const defaultStoredExportCSV = JSON.stringify({ ledgers: false, trades: false })
const storedExportCSV = JSON.parse(localStorage.getItem("exportcsv")) || defaultStoredExportCSV;
export const exportcsv = writable(storedExportCSV);
exportcsv.subscribe(value => {
  value = (typeof value === 'object') ? JSON.stringify(value) : defaultStoredExportCSV
  localStorage.setItem("exportcsv", (value !== "false") ? value : defaultStoredExportCSV);
});

// Storage fetchTimeout (STRING)
const storedFetchTimeoutDataDefault = JSON.stringify({ timeout: false, started: Date.now() })
const storedFetchTimeout = JSON.parse(localStorage.getItem("fetchTimeout") || storedFetchTimeoutDataDefault);
export const fetchTimeout = writable(storedFetchTimeout);
fetchTimeout.subscribe(value => {
  value = (typeof value === 'object') ? JSON.stringify(value) : value
  localStorage.setItem("fetchTimeout", (value !== false) ? value : storedFetchTimeoutDataDefault);
});
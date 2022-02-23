<script>
  import { onMount } from "svelte";
  import { page } from "store/store.js";
  import Home from "components/pages/Home/MainHome.svelte";
  import Account from "components/pages/account/MainAccount.svelte";
  import Trading from "components/pages/trading/MainTrading.svelte";
  import Statistic from "components/pages/statistics/MainStatistics.svelte";
  import Settings from "components/pages/settings/MainSettings.svelte";
  import Reports from "components/pages/reports/MainReports.svelte";
  import { hasApikeysStore } from "store/userStore.js";

  // User
  export let userId;

  import websocketStore from "svelte-websocket-store";
  import { assetpair, interval, devise, pricealertlist } from "store/store.js";
  import {
    book,
    ticker,
    spread,
    trade,
    ohlc,
    openorders,
    owntrades,
    tradebalance,
    tickeralert,
  } from "store/wsstore.js";

  // Appel Websocket
  let wss_book,
    wss_trade,
    wss_spread,
    wss_ohlc,
    wss_openorders,
    wss_owntrades,
    wss_tradebalance,
    wss_server,
    depth = 10,
    wss_ticker_alert = [];

  const server = __env["BACKEND_WS_URI"];

  const initWebsocketUri = () => {
    wss_server = server;
    wss_book = $assetpair
      ? `${server}/book/${$assetpair.wsname}/${depth}`
      : false;
    wss_trade = $assetpair ? `${server}/trade/${$assetpair.wsname}` : false;
    wss_spread = $assetpair ? `${server}/spread/${$assetpair.wsname}` : false;
    wss_ohlc = $assetpair
      ? `${server}/ohlc/${$assetpair.wsname}/${$interval}`
      : false;
    wss_openorders = `${server}/openorders/${userId}`;
    wss_owntrades = `${server}/owntrades/${userId}`;
    wss_tradebalance = $devise
      ? `${server}/tradebalance/${$devise}/${userId}`
      : false;
  };

  const initWebsocket = () => {
    initWebsocketUri();
    const wsOpenOrders = websocketStore(wss_openorders);
    wsOpenOrders.subscribe((tick) => {
      if (typeof tick !== "undefined" && tick) openorders.set(tick);
    });

    const wsOwnTrades = websocketStore(wss_owntrades);
    wsOwnTrades.subscribe((tick) => {
      if (typeof tick !== "undefined" && tick) owntrades.set(tick);
    });

    if ($devise) {
      const wsTradeBalance = websocketStore(wss_tradebalance);
      wsTradeBalance.subscribe((tick) => {
        if (typeof tick !== "undefined" && tick) tradebalance.set(tick);
      });
    }

    if ($assetpair) {
      // Book websocket
      const wsBook = websocketStore(wss_book);
      wsBook.subscribe((tick) => {
        if (typeof tick !== "undefined" && tick) book.set(tick);
      });

      // Ticker websocket
      let wsTickerAlert = [];
      // List des pairs
      let ticker_pair = Object.keys($pricealertlist);
      // Si la pair selectionné n'est pas dans la liste on l'ajoute
      if (!ticker_pair.includes($assetpair.wsname))
        ticker_pair.push($assetpair.wsname);
      // On boucle sur la liste et on créer une connexion websocket pour chaque pair
      ticker_pair.map((tickpair) => {
        wss_ticker_alert[tickpair] = wss_server + "/ticker/" + tickpair;
        wsTickerAlert[tickpair] = websocketStore(wss_ticker_alert[tickpair]);
      });
      // On boucle chaque connexion websocket pour y souscrire
      let obj = {};
      for (const tickpair in wsTickerAlert) {
        if (Object.hasOwnProperty.call(wsTickerAlert, tickpair)) {
          const socket = wsTickerAlert[tickpair];
          socket.subscribe((tick) => {
            // On set toutes les données dans tickeralert
            obj[tickpair] = tick;
            tickeralert.set(obj);

            // On set les données de la pair selectionné dans le store ticker
            if (tickpair === $assetpair.wsname) {
              ticker.set(tick);
            }
          });
        }
      }

      // Trade websocket
      const wsTrade = websocketStore(wss_trade);
      wsTrade.subscribe((tick) => {
        if (typeof tick !== "undefined" && tick) trade.set(tick);
      });
      // Spread websocket
      const wsSpread = websocketStore(wss_spread);
      wsSpread.subscribe((tick) => {
        if (typeof tick !== "undefined" && tick) spread.set(tick);
      });
      // OHLC websocket
      const wsOhlc = websocketStore(wss_ohlc);
      wsOhlc.subscribe((tick) => {
        if (typeof tick !== "undefined" && tick) ohlc.set(tick);
      });
    }
  };
  // Appel Websocket

  onMount(() => {
    initWebsocket();
  });

  $: if ($interval) {
    initWebsocket();
  }
</script>

<div class="main">
  {#if $page === "home"}
    <div class:hidden={$page !== "home"}><Home /></div>
  {:else if $page === "account" && $hasApikeysStore}
    <div class:hidden={$page !== "account"}><Account /></div>
  {:else if $page === "trading" && $hasApikeysStore}
    <div class:hidden={$page !== "trading"}><Trading /></div>
  {:else if $page === "statistic" && $hasApikeysStore}
    <div class:hidden={$page !== "statistic"}><Statistic /></div>
  {:else if $page === "settings"}
    <div class:hidden={$page !== "settings"}><Settings /></div>
  {:else if $page === "reports" && $hasApikeysStore}
    <div class:hidden={$page !== "reports"}><Reports /></div>
  {/if}
</div>

<style>
  .main {
    background: #1e1e1e;
    color: #cdcdcd;

    width: calc(100% - 175px);
    margin-left: 175px;
    transition: all 0.5s ease;
    padding: 60px 10px;
    width: auto;
    min-height: 100%;
    flex: 1 0 auto;
  }

  .main .hidden {
    display: none;
  }

  :global(.main h1) {
    background-color: #1c1c1c;
    padding: 5px 10px;
    border-top: 1px solid #181818;
    border-left: 1px solid #181818;
    border-right: 1px solid #181818;
    border-bottom: none;
    text-shadow: 2px 3px #0a0a0a;
    font-size: 1.6em;
  }

  :global(.main h2) {
    background-color: #1c1c1c;
    padding: 5px 10px;
    border-top: 1px solid #181818;
    border-left: 1px solid #181818;
    border-right: 1px solid #181818;
    border-bottom: none;
    text-shadow: 2px 3px #0a0a0a;
    font-size: 1.2em;
  }

  /* :global(.main h3) {
    background-color: #1c1c1c;
    padding: 5px 10px;
    border-top: 1px solid #181818;
    border-left: 1px solid #181818;
    border-right: 1px solid #181818;
    border-bottom: none;
    text-shadow: 2px 3px #0a0a0a;
    font-size: 1.4em;
  } */

  :global(.main .main-info) {
    background-color: darkcyan;
    padding: 10px;
    border: 2px solid #414141;
    border-radius: 10px;

    font-weight: bold;
    color: #222222;
    margin-top: 10px;
  }

  :global(.main .main-warning) {
    background-color: rgb(139, 118, 0);
    padding: 10px;
    border: 2px solid #85834a;
    border-radius: 10px;

    font-weight: bold;
    color: #222222;
    margin-top: 10px;
  }
</style>

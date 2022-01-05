<script>
  import { onMount } from "svelte";
  import { page } from "store/store.js";
  import Home from "components/pages/Home/MainHome.svelte";
  import Account from "components/pages/account/MainAccount.svelte";
  import Trading from "components/pages/trading/MainTrading.svelte";
  import Statistic from "components/pages/statistics/MainStatistics.svelte";
  import Settings from "components/pages/settings/MainSettings.svelte";
  import Reports from "components/pages/reports/MainReports.svelte";

  import websocketStore from "svelte-websocket-store";
  import { wssurl, assetpair, interval, devise } from "store/store.js";
  import {
    book,
    ticker,
    spread,
    trade,
    ohlc,
    openorders,
    owntrades,
    tradebalance,
  } from "store/wsstore.js";

  // Appel Websocket
  let wss_book,
    wss_ticker,
    wss_trade,
    wss_spread,
    wss_ohlc,
    wss_openorders,
    wss_owntrades,
    wss_tradebalance,
    depth = 10;

  wssurl.subscribe((server) => {
    wss_book = $assetpair
      ? server + "/book/" + $assetpair.wsname + "/" + depth
      : false;
    wss_ticker = $assetpair ? server + "/ticker/" + $assetpair.wsname : false;
    wss_trade = $assetpair ? server + "/trade/" + $assetpair.wsname : false;
    wss_spread = $assetpair ? server + "/spread/" + $assetpair.wsname : false;
    wss_ohlc = $assetpair
      ? server + "/ohlc/" + $assetpair.wsname + "/" + $interval
      : false;
    wss_openorders = server + "/openorders";
    wss_owntrades = server + "/owntrades";
    wss_tradebalance = $devise ? server + "/tradebalance/" + $devise : false;
  });
  // Appel Websocket

  onMount(() => {
    const wsOpenOrders = websocketStore(wss_openorders);
    wsOpenOrders.subscribe((tick) => {
      openorders.set(tick);
    });

    const wsOwnTrades = websocketStore(wss_owntrades);
    wsOwnTrades.subscribe((tick) => {
      owntrades.set(tick);
    });

    if ($devise) {
      const wsTradeBalance = websocketStore(wss_tradebalance);
      wsTradeBalance.subscribe((tick) => {
        tradebalance.set(tick);
      });
    }

    if ($assetpair && wss_ohlc) {
      // Book websocket
      const wsBook = websocketStore(wss_book);
      wsBook.subscribe((tick) => {
        book.set(tick);
      });
      // Ticker websocket
      const wsTicker = websocketStore(wss_ticker);
      wsTicker.subscribe((tick) => {
        ticker.set(tick);
      });
      // Trade websocket
      const wsTrade = websocketStore(wss_trade);
      wsTrade.subscribe((tick) => {
        trade.set(tick);
      });
      // Spread websocket
      const wsSpread = websocketStore(wss_spread);
      wsSpread.subscribe((tick) => {
        spread.set(tick);
      });
      // OHLC websocket
      const wsOhlc = websocketStore(wss_ohlc);
      wsOhlc.subscribe((tick) => {
        ohlc.set(tick);
      });
    }
  });
</script>

<div class="main">
  {#if $page === "home"}
    <div class:hidden={$page !== "home"}><Home /></div>
  {:else if $page === "account"}
    <div class:hidden={$page !== "account"}><Account /></div>
  {:else if $page === "trading"}
    <div class:hidden={$page !== "trading"}><Trading /></div>
  {:else if $page === "statistic"}
    <div class:hidden={$page !== "statistic"}><Statistic /></div>
  {:else if $page === "settings"}
    <div class:hidden={$page !== "settings"}><Settings /></div>
  {:else if $page === "reports"}
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
</style>

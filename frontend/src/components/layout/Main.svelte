<script>
  import { page } from "store/store.js";

  import Home from "components/pages/Home/MainHome.svelte";
  import Account from "components/pages/account/MainAccount.svelte";
  import Trading from "components/pages/trading/MainTrading.svelte";
  import Statistic from "components/pages/statistics/MainStatistics.svelte";
  import Settings from "components/pages/settings/MainSettings.svelte";
  import Reports from "components/pages/reports/MainReports.svelte";
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

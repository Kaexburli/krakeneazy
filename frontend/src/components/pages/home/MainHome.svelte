<script>
  import { pair, assetpair } from "store/store.js";
  import { slide } from "svelte/transition";

  import ChartCtrl from "components/pages/home/ChartCtrl.svelte";
  import ChartOhlc from "components/pages/home/WsChartOhlc.svelte";
  import TickerWs from "components/pages/home/WsTicker.svelte";
  import OrderBooksWs from "components/pages/home/WsOrderBooks.svelte";
</script>

<div id="page-home" in:slide out:slide>
  {#if $pair !== "false" && $pair}
    <h1>Kraken {$assetpair.wsname}</h1>
    <div id="home-wrapper">
      <div id="ChartCtrl"><ChartCtrl /></div>
      <div id="BlockChartOhlc"><ChartOhlc /></div>
      <div id="BlockTicker"><TickerWs /></div>
      <div id="BlockOrderBooks"><OrderBooksWs /></div>
    </div>
  {:else}
    <h1>Accueil</h1>
    <div class="main-info">
      <i class="fas fa-info-circle" />
      <span>Veuillez choisir une paire</span>
    </div>
  {/if}
</div>

<style>
  #home-wrapper {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  #ChartCtrl {
    grid-column: 1 / 3;
    grid-row: 1;
  }
  #BlockChartOhlc {
    grid-column: 1 / 3;
    grid-row: 2;
  }
  #BlockTicker {
    grid-column: 1;
    grid-row: 3;
  }
  #BlockOrderBooks {
    grid-column: 2;
    grid-row: 3;
  }
</style>

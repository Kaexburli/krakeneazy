<script>
  import { _ } from "svelte-i18n";
  import { pair, assetpair } from "store/store.js";
  import { slide } from "svelte/transition";
  import { Moon } from "svelte-loading-spinners";

  import ChartCtrl from "components/pages/home/ChartCtrl.svelte";
  import ChartOhlc from "components/pages/home/WsChartOhlc.svelte";
  import SpreadBox from "components/pages/trading/SpreadBox.svelte";
  import TickerWs from "components/pages/home/WsTicker.svelte";
  import OrderBooksWs from "components/pages/home/WsOrderBooks.svelte";

  let loading = false;

  const handleLoading = (e) => {
    loading = e.detail.loading;
  };
</script>

<div id="page-home" in:slide out:slide>
  {#if $pair !== "false" && $pair}
    <h1>
      <div id="clockloader">
        {#if !loading}<Moon
            size="30"
            color="#e8e8e8"
            unit="px"
            duration="0.5s"
          />{/if}
      </div>
      Kraken {$assetpair.wsname}
    </h1>
    <div id="home-wrapper">
      <div id="ChartCtrl"><ChartCtrl /></div>
      <div id="BlockChartOhlc"><ChartOhlc /></div>
      <div id="SpreadBox"><SpreadBox /></div>
      <div id="BlockTicker"><TickerWs on:loading={handleLoading} /></div>
      <div id="BlockOrderBooks"><OrderBooksWs /></div>
    </div>
  {:else}
    <h1>{$_("home.title")}</h1>
    <div class="main-info">
      <i class="fas fa-info-circle" />
      <span>{$_("home.choosePair")}</span>
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
  #SpreadBox {
    grid-column: 1 / 3;
    grid-row: 3;
  }
  #BlockTicker {
    grid-column: 1;
    grid-row: 4;
  }
  #BlockOrderBooks {
    grid-column: 2;
    grid-row: 4;
  }
  #clockloader {
    float: right;
    margin-top: 3px;
  }
</style>

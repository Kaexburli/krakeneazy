<script>
  import { _ } from "svelte-i18n";
  import { pair } from "store/store.js";
  import { slide, fade } from "svelte/transition";
  import { Moon } from "svelte-loading-spinners";
  import ChartOhlc from "components/pages/home/WsChartOhlc.svelte";
  import SpreadBox from "components/pages/trading/SpreadBox.svelte";
  import TickerWs from "components/pages/home/WsTicker.svelte";
  import OrderBooksWs from "components/pages/home/WsOrderBooks.svelte";
  import { hasApikeysStore } from "store/userStore.js";
  import Paper, { Content } from "@smui/paper";
  import LinearProgress from "@smui/linear-progress";

  let loading = false;
  export let User;

  const handleLoading = (e) => {
    loading = e.detail.loading;
  };
</script>

<div id="page-home" in:fade out:slide>
  {#if !$hasApikeysStore}
    <Paper color="primary" square>
      <Content>
        <i class="fas fa-info-circle" />
        <span>{$_("site.addApiKey")}</span>
      </Content>
    </Paper>
  {:else if $pair !== "false" && $pair}
    <h1>
      {#if !loading}
        <div id="clockloader">
          <Moon size="30" color="#e8e8e8" unit="px" duration="0.5s" />
        </div>
      {/if}
    </h1>
    {#if !loading}
      <div class="loader">
        <LinearProgress indeterminate />
      </div>
    {/if}
    <div id="home-wrapper">
      <div id="BlockChartOhlc">
        <ChartOhlc {User} on:loading={handleLoading} />
      </div>
      <div id="BlockOrderBooks">
        <OrderBooksWs on:loading={handleLoading} />
      </div>
      <div id="BlockTicker">
        <TickerWs on:loading={handleLoading} />
      </div>
      <div id="SpreadBox">
        <SpreadBox />
      </div>
    </div>
  {:else}
    <h1>{$_("home.title")}</h1>
    <Paper color="secondary" square>
      <Content>
        <i class="fas fa-info-circle" />
        <span>{$_("site.choosePair")}</span>
      </Content>
    </Paper>
    <br />
  {/if}
</div>

<style>
  #home-wrapper {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  #BlockChartOhlc {
    grid-column: 1 / 6;
    grid-row: 1;
  }
  #SpreadBox {
    grid-column: 1 / 8;
    grid-row: 3;
  }
  #BlockTicker {
    grid-row: 1;
  }
  #BlockOrderBooks {
    grid-row: 1;
  }
  #clockloader {
    float: right;
    margin-top: 3px;
  }
</style>

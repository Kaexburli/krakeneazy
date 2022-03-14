<script>
  import { _ } from "svelte-i18n";
  import { User } from "store/userStore.js";
  import { slide } from "svelte/transition";
  import { assetpair } from "store/store.js";
  import SpreadBox from "components/pages/trading/SpreadBox.svelte";
  import TradingOrder from "components/pages/trading/TradingOrder.svelte";
  import BlockOpenOrders from "components/pages/account/BlockOpenOrders.svelte";
  import Paper, { Content } from "@smui/paper";

  const isLogged = User.isLogged();
</script>

{#if isLogged}
  <div id="page-trading" in:slide out:slide>
    {#if $assetpair !== "false" && $assetpair}
      <h1>{$_("trading.title")} {$assetpair.wsname}</h1>
      <div class="box">
        <BlockOpenOrders />
      </div>
      <div class="trading">
        <h2>{$_("trading.subtitle")}</h2>
        <TradingOrder />
        <SpreadBox />
      </div>
    {:else}
      <h1>{$_("trading.title")}</h1>
      <Paper color="secondary" square>
        <Content>
          <i class="fas fa-info-circle" />
          <span>{$_("site.choosePair")}</span>
        </Content>
      </Paper>
    {/if}
  </div>
{/if}

<style>
  .trading {
    display: grid;
    /* grid-template-rows: repeat(2, 50px); */

    background-color: #212121;
    padding: 5px 10px;
    border: 1px solid #2e2e2e;
  }
  .box {
    margin: 10px 0;
  }
  :global(.trading div.block) {
    margin: 5px;
    padding: 10px;
    min-width: 200px;
    background-color: #282828;
    font-size: 0.8em;
  }
  :global(.trading div.block h3) {
    background-color: darkgrey;
    color: #222222;
    padding: 5px;
    margin: -10px -10px 5px -10px;
    font-size: 1.1em;
  }
</style>

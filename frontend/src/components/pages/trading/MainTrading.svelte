<script>
  import { slide } from "svelte/transition";
  import { assetpair } from "store/store.js";
  import TradingOrder from "components/pages/trading/TradingOrder.svelte";
</script>

<div id="page-trading" in:slide out:slide>
  {#if $assetpair !== "false" && $assetpair}
    <h1>Trading {$assetpair.wsname}</h1>
    <div class="trading">
      <TradingOrder />
    </div>
  {:else}
    <h1>Trading</h1>
    <div class="main-info">
      <i class="fas fa-info-circle" />
      <span>Veuillez choisir une paire</span>
    </div>
  {/if}
</div>

<style>
  .trading {
    display: grid;
    /* grid-template-rows: repeat(2, 50px); */

    background-color: #212121;
    padding: 5px 10px;
    border: 1px solid #2e2e2e;
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

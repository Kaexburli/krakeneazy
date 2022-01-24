<script>
  import { sound, pair } from "store/store.js";
  import { slide } from "svelte/transition";

  import BlockBalance from "components/pages/account/BlockBalance.svelte";
  import BlockTradeBalance from "components/pages/account/BlockTradeBalance.svelte";
  import BlockOpenOrders from "components/pages/account/BlockOpenOrders.svelte";
  import BlockClosedOrders from "components/pages/account/BlockClosedOrders.svelte";
  import BlockOwnTrades from "components/pages/account/BlockOwnTrades.svelte";
  import BlockTradeVolume from "components/pages/account/BlockTradeVolume.svelte";
  import BlockLedgers from "components/pages/account/BlockLedgers.svelte";
  import BlockTradesHistory from "components/pages/account/BlockTradesHistory.svelte";

  import { Tabs, TabList, TabPanel, Tab } from "components/tabs/tabs.js";

  const handleClickSound = () => {
    sound.update((n) => (n == "up" ? "mute" : "up"));
  };
</script>

<div id="page-account" in:slide out:slide>
  <h1>
    Mon compte kraken
    <i
      class="btn-sound fa fa-volume-{$sound}"
      on:click={handleClickSound}
      muted="true"
    />
  </h1>
  {#if $pair !== "false" && $pair}
    <div class="account">
      <BlockTradeVolume />
      <BlockTradeBalance />
      <BlockBalance />
    </div>
    <Tabs>
      <TabList>
        <Tab>Ordres ouverts</Tab>
        <Tab>Ordres fermés</Tab>
        <Tab>Transactions</Tab>
        <Tab>Trades</Tab>
        <Tab>Registre</Tab>
      </TabList>

      <TabPanel>
        <BlockOpenOrders />
      </TabPanel>

      <TabPanel>
        <BlockClosedOrders />
      </TabPanel>

      <TabPanel>
        <BlockOwnTrades />
      </TabPanel>

      <TabPanel>
        <BlockTradesHistory />
      </TabPanel>

      <TabPanel>
        <BlockLedgers />
      </TabPanel>
    </Tabs>
  {:else}
    <div class="main-info">
      <i class="fas fa-info-circle" />
      <span>Veuillez choisir une paire</span>
    </div>
  {/if}
</div>

<style>
  .account {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    /* grid-template-rows: repeat(2, 50px); */

    background-color: #212121;
    border: 1px solid #181818;
  }
  .btn-sound {
    cursor: pointer;
  }
  :global(.account div.block) {
    margin: 5px;
    padding: 10px;
    min-width: 200px;
    background-color: #282828;
    font-size: 0.8em;
  }
  :global(.account div.block h3) {
    background-color: darkgrey;
    color: #222222;
    padding: 5px;
    margin: -10px -10px 5px -10px;
    font-size: 1.1em;
    -webkit-border-top-left-radius: 5px;
    -webkit-border-top-right-radius: 5px;
    -moz-border-radius-topleft: 5px;
    -moz-border-radius-topright: 5px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }
</style>

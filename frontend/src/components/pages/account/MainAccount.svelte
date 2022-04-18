<script>
  // ---------------------------------------------------------
  //  Imports
  // ---------------------------------------------------------
  import { _ } from "svelte-i18n";
  import { User } from "store/userStore.js";
  import { sound, pair } from "store/store.js";
  import { slide } from "svelte/transition";

  import BlockBalance from "components/pages/account/BlockBalance.svelte";
  import BlockTradeBalance from "components/pages/account/BlockTradeBalance.svelte";
  import BlockOpenOrders from "components/pages/account/BlockOpenOrders.svelte";
  import BlockClosedOrders from "components/pages/account/BlockClosedOrders.svelte";
  import BlockTradeVolume from "components/pages/account/BlockTradeVolume.svelte";
  import BlockLedgers from "components/pages/account/BlockLedgers.svelte";
  import BlockTradesHistory from "components/pages/account/BlockTradesHistory.svelte";

  import Paper, { Content } from "@smui/paper";
  import Tab, { Label } from "@smui/tab";
  import TabBar from "@smui/tab-bar";

  // ---------------------------------------------------------
  //  Props
  // ---------------------------------------------------------
  let active = $_("account.tabs.openOrders");
  const isLogged = User.isLogged();
  const tabList = [
    $_("account.tabs.openOrders"),
    $_("account.tabs.closedOrders"),
    $_("account.tabs.transaction"),
    $_("account.tabs.register"),
  ];

  // ---------------------------------------------------------
  //  Methods Declarations
  // ---------------------------------------------------------
  const handleClickSound = () => {
    sound.update((n) => (n == "up" ? "mute" : "up"));
  };
</script>

{#if isLogged}
  <div id="page-account" in:slide out:slide>
    <h1>
      {$_("account.title")}
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
      <div class="tab-barre">
        <TabBar tabs={tabList} let:tab bind:active>
          <Tab {tab} minWidth>
            <Label>{tab}</Label>
          </Tab>
        </TabBar>
        <hr />
        {#if active === $_("account.tabs.openOrders")}
          <BlockOpenOrders />
        {:else if active === $_("account.tabs.closedOrders")}
          <BlockClosedOrders />
        {:else if active === $_("account.tabs.transaction")}
          <BlockTradesHistory />
        {:else if active === $_("account.tabs.register")}
          <BlockLedgers />
        {:else}
          <BlockOpenOrders />
        {/if}
      </div>
    {:else}
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
  .tab-barre {
    margin-top: 10px;
    background-color: #1b1b1b;
    border: 1px solid #434343;
  }
  hr {
    background-color: #222222;
    border: 1px dashed #000000;
  }
  :global(.account div.block) {
    margin: 5px;
    padding: 10px;
    min-width: 200px;
    background-color: #1c1c1c;
    font-size: 0.8em;
  }
  :global(.account div.block h3) {
    background-color: #1b1b1b;
    color: #a1a1a1;
    padding: 10px;
    margin: -10px -10px 5px -10px;
    font-size: 1.1em;
  }
</style>

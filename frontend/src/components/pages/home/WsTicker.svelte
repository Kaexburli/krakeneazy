<script>
  import { _ } from "svelte-i18n";
  import { onMount, createEventDispatcher } from "svelte";
  import { ticker } from "store/wsstore.js";
  import { assetpair } from "store/store.js";

  const dispatch = createEventDispatcher();

  let tickerdata;

  onMount(() => {
    ticker.subscribe((tick) => {
      if (typeof tick !== "undefined" && Object.keys(tick).length > 1) {
        if (tick.service === "Ticker" && tick.data) {
          tickerdata = tick.data;
          dispatch("loading", { loading: true });
        }
      }
    });
  });

  let spread;
  let quote = $assetpair.quote;
  let decimals = $assetpair.pair_decimals;

  $: {
    if (typeof tickerdata !== "undefined" && tickerdata.hasOwnProperty("a")) {
      spread = (tickerdata["a"][0] - tickerdata["b"][0]).toFixed(decimals);
    }
  }
</script>

<div class="tick-block">
  {#if typeof tickerdata !== "undefined" && tickerdata.hasOwnProperty("a")}
    <div class="tick ask-tick">
      <h3>{$_("home.ticker.ask")}</h3>
      <span class="label">{$_("home.ticker.askValue")} : </span>{Number(
        tickerdata["a"][0]
      ).toFixed(decimals)}&nbsp;{quote}
      <br />
      <span class="label">
        {$_("home.ticker.totalVolume")} :
      </span>{tickerdata["a"][1]} <br />
      <span class="label">
        {$_("home.ticker.lotVolume")} :
      </span>{tickerdata["a"][2]}
    </div>
    <div class="tick close-tick">
      <h3>{$_("home.ticker.currentPrice")}</h3>
      <span class="label"> {$_("home.ticker.price")} : </span>{Number(
        tickerdata["c"][0]
      ).toFixed(decimals)}&nbsp;{quote}
      <br />
      <span class="label">
        {$_("home.ticker.totalVolume")} :
      </span>{tickerdata["c"][1]} <br />
      <span class="label">{$_("home.ticker.spread")} : </span>{spread}
    </div>
    <div class="tick bid-tick">
      <h3>{$_("home.ticker.bid")}</h3>
      <span class="label">{$_("home.ticker.bidValue")} : </span>{Number(
        tickerdata["b"][0]
      ).toFixed(decimals)}&nbsp;{quote} <br />
      <span class="label">
        {$_("home.ticker.totlaVolume")} :
      </span>{tickerdata["b"][1]} <br />
      <span class="label">
        {$_("home.ticker.lotVolume")} :
      </span>{tickerdata["b"][2]}
    </div>
    <div class="tick volume-tick">
      <h3>{$_("home.ticker.volume")}</h3>
      <span class="label">
        {$_("home.ticker.today")} :
      </span>{tickerdata["v"][0]} <br />
      <span class="label">
        {$_("home.ticker.last24h")} :
      </span>{tickerdata["v"][1]}
    </div>
    <div class="tick vwap-tick">
      <h3>{$_("home.ticker.vwap")}</h3>
      <span class="label">
        {$_("home.ticker.today")} :
      </span>{Number(tickerdata["p"][0]).toFixed(decimals)}&nbsp;{quote} <br />
      <span class="label">
        {$_("home.ticker.last24h")} :
      </span>{Number(tickerdata["p"][1]).toFixed(decimals)}&nbsp;{quote}
    </div>
    <div class="tick trade-tick">
      <h3>{$_("home.ticker.numberOfTrade")}</h3>
      <span class="label">
        {$_("home.ticker.today")} :
      </span>{tickerdata["t"][0]} <br />
      <span class="label">
        {$_("home.ticker.last24h")} :
      </span>{tickerdata["t"][1]}
    </div>
    <div class="tick low-tick">
      <h3>{$_("home.ticker.lowPrice")}</h3>
      <span class="label">
        {$_("home.ticker.today")} :
      </span>{Number(tickerdata["l"][0]).toFixed(decimals)}&nbsp;{quote} <br />
      <span class="label">
        {$_("home.ticker.last24h")} :
      </span>{Number(tickerdata["l"][1]).toFixed(decimals)}&nbsp;{quote}
    </div>
    <div class="tick hight-tick">
      <h3>{$_("home.ticker.highPrice")}</h3>
      <span class="label">
        {$_("home.ticker.today")} :
      </span>{Number(tickerdata["h"][0]).toFixed(decimals)}&nbsp;{quote} <br />
      <span class="label">
        {$_("home.ticker.last24h")} :
      </span>{Number(tickerdata["h"][1]).toFixed(decimals)}&nbsp;{quote}
    </div>
    <div class="tick open-tick">
      <h3>{$_("home.ticker.openPrice")}</h3>
      <span class="label">
        {$_("home.ticker.today")} :
      </span>{Number(tickerdata["o"][0]).toFixed(decimals)}&nbsp;{quote} <br />
      <span class="label">
        {$_("home.ticker.last24h")} :
      </span>{Number(tickerdata["h"][1]).toFixed(decimals)}&nbsp;{quote}
    </div>
  {/if}
</div>

<style>
  .tick-block {
    background-color: #212121;
    border: 1px solid #181818;

    display: flex;
    flex-wrap: wrap;
  }
  .tick {
    padding: 10px;
    min-width: 100px;
    /* background-color: #282828; */
    font-size: 0.8em;
  }
  .tick .label {
    color: brown;
  }
  .tick-block h3 {
    /* background-color: darkgrey; */
    /* color: #222222; */
    /* margin: -10px -10px 5px -10px; */
    font-size: 1.1em;
  }
  .ask-tick h3 {
    background-color: firebrick;
  }
  .bid-tick h3 {
    background-color: darkgreen;
  }
  .close-tick h3 {
    background-color: darkslategrey;
  }
</style>

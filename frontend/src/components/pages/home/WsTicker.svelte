<script>
  import { _ } from "svelte-i18n";
  import { createEventDispatcher } from "svelte";
  import { WSTicker } from "store/wsstore.js";
  import { assetpair, setResizeChart } from "store/store.js";

  const dispatch = createEventDispatcher();

  let tickerdata,
    spread,
    base = $assetpair.wsname.split("/")[0],
    quote = $assetpair.wsname.split("/")[1],
    decimals = $assetpair.pair_decimals,
    toogleBox = "close",
    slideWay = toogleBox === "open" ? "right" : "left";

  const toogleTicker = () => {
    toogleBox = toogleBox === "open" ? "close" : "open";
    slideWay = toogleBox === "open" ? "right" : "left";
    $setResizeChart = true;
  };

  $: if ($WSTicker) {
    tickerdata = $WSTicker;
    dispatch("loading", { loading: true });

    if (typeof tickerdata !== "undefined" && tickerdata.hasOwnProperty("a")) {
      spread = (tickerdata["a"][0] - tickerdata["b"][0]).toFixed(decimals);
    }
  }
</script>

<div class="slideBtn" on:click={toogleTicker} on:resizeChart>
  <i class="fa fa-caret-{slideWay}" />
</div>
<div class="tick-block {toogleBox}">
  {#if typeof tickerdata !== "undefined" && tickerdata.hasOwnProperty("a")}
    <div class="tick close-tick">
      <h3>&#x58D;&nbsp;{$_("home.ticker.currentPrice")}</h3>
      <div class="content">
        <span class="label"> {$_("home.ticker.price")} : </span>{Number(
          tickerdata["c"][0]
        ).toFixed(decimals)}&nbsp;{quote}
        <br />
        <span class="label">
          {$_("home.ticker.totalVolume")} :
        </span>{tickerdata["c"][1]} <br />
        <span class="label">{$_("home.ticker.spread")} : </span>{spread}
      </div>
    </div>
    <div class="tick ask-tick">
      <h3>&#x58D;&nbsp;{$_("home.ticker.ask")}</h3>
      <div class="content">
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
    </div>
    <div class="tick bid-tick">
      <h3>&#x58D;&nbsp;{$_("home.ticker.bid")}</h3>
      <div class="content">
        <span class="label">{$_("home.ticker.bidValue")} : </span>{Number(
          tickerdata["b"][0]
        ).toFixed(decimals)}&nbsp;{quote} <br />
        <span class="label">
          {$_("home.ticker.totalVolume")} :
        </span>{tickerdata["b"][1]} <br />
        <span class="label">
          {$_("home.ticker.lotVolume")} :
        </span>{tickerdata["b"][2]}
      </div>
    </div>
    <div class="tick low-tick">
      <h3>&#x58D;&nbsp;{$_("home.ticker.lowPrice")}</h3>
      <div class="content">
        <span class="label">
          {$_("home.ticker.today")} :
        </span>
        <span class={tickerdata["l"][0] < tickerdata["l"][1] ? "green" : ""}>
          {Number(tickerdata["l"][0]).toFixed(decimals)}&nbsp;{quote}
        </span>
        <br />
        <span class="label">
          {$_("home.ticker.last24h")} :
        </span>
        <span class={tickerdata["l"][0] > tickerdata["l"][1] ? "green" : ""}>
          {Number(tickerdata["l"][1]).toFixed(decimals)}&nbsp;{quote}
        </span>
      </div>
    </div>
    <div class="tick hight-tick">
      <h3>&#x58D;&nbsp;{$_("home.ticker.highPrice")}</h3>
      <div class="content">
        <span class="label">
          {$_("home.ticker.today")} :
        </span>
        <span class={tickerdata["h"][0] > tickerdata["h"][1] ? "green" : ""}>
          {Number(tickerdata["h"][0]).toFixed(decimals)}&nbsp;{quote}
        </span>
        <br />
        <span class="label">
          {$_("home.ticker.last24h")} :
        </span>
        <span class={tickerdata["h"][0] < tickerdata["h"][1] ? "green" : ""}>
          {Number(tickerdata["h"][1]).toFixed(decimals)}&nbsp;{quote}
        </span>
      </div>
    </div>
    <div class="tick volume-tick">
      <h3>&#x58D;&nbsp;{$_("home.ticker.volume")}</h3>
      <div class="content">
        <span class="label">
          {$_("home.ticker.today")} :
        </span>
        <span class={tickerdata["v"][0] > tickerdata["v"][1] ? "green" : ""}>
          {tickerdata["v"][0]}
        </span><br />
        <span class="label">
          {$_("home.ticker.last24h")} :
        </span>
        <span class={tickerdata["v"][0] < tickerdata["v"][1] ? "green" : ""}>
          {tickerdata["v"][1]}
        </span>
      </div>
    </div>
    <div class="tick vwap-tick">
      <h3>&#x58D;&nbsp;{$_("home.ticker.vwap")}</h3>
      <div class="content">
        <span class="label">
          {$_("home.ticker.today")} :
        </span>
        <span class={tickerdata["p"][0] > tickerdata["p"][1] ? "green" : ""}>
          {Number(tickerdata["p"][0]).toFixed(decimals)}&nbsp;{quote}
        </span>
        <br />
        <span class="label">
          {$_("home.ticker.last24h")} :
        </span>
        <span class={tickerdata["p"][0] < tickerdata["p"][1] ? "green" : ""}>
          {Number(tickerdata["p"][1]).toFixed(decimals)}&nbsp;{quote}
        </span>
      </div>
    </div>
    <div class="tick trade-tick">
      <h3>&#x58D;&nbsp;{$_("home.ticker.numberOfTrade")}</h3>
      <div class="content">
        <span class="label">
          {$_("home.ticker.today")} :
        </span>
        <span class={tickerdata["t"][0] > tickerdata["t"][1] ? "green" : ""}>
          {tickerdata["t"][0]}
        </span> <br />
        <span class="label">
          {$_("home.ticker.last24h")} :
        </span>
        <span class={tickerdata["t"][0] < tickerdata["t"][1] ? "green" : ""}>
          {tickerdata["t"][1]}
        </span>
      </div>
    </div>
    <div class="tick open-tick">
      <h3>&#x58D;&nbsp;{$_("home.ticker.openPrice")}</h3>
      <div class="content">
        <span class="label">
          {$_("home.ticker.today")} :
        </span>
        <span class={tickerdata["o"][0] > tickerdata["h"][1] ? "green" : ""}>
          {Number(tickerdata["o"][0]).toFixed(decimals)}&nbsp;{quote}
        </span>
        <br />
        <span class="label">
          {$_("home.ticker.last24h")} :
        </span>
        <span class={tickerdata["o"][0] < tickerdata["h"][1] ? "green" : ""}>
          {Number(tickerdata["h"][1]).toFixed(decimals)}&nbsp;{quote}
        </span>
      </div>
    </div>
  {/if}
</div>

<style>
  .slideBtn {
    font-size: 0.6em;
    padding: 241px 0;
    width: 10px;
    height: 482px;
    color: #ffffff;
    background-color: #212121;
    float: left;
    text-align: center;
    vertical-align: middle;
    margin: 0 auto;
    cursor: pointer;
    border-left: 1px solid #2f2f2f;
    border-right: 1px solid #2f2f2f;
  }
  .slideBtn:hover {
    background-color: #303030;
  }
  .tick-block {
    float: left;

    background-color: #212121;
    border: 1px solid #181818;

    display: flex;
    flex-wrap: wrap;

    width: 210px;
    height: 482px;
    overflow: auto;
  }
  .tick-block.close {
    transition: all 0s ease-out;
    visibility: hidden;
    opacity: 0;
    right: -210px;
    position: absolute;
  }
  .tick-block.open {
    transition: all 0.2s ease-out;
    visibility: visible;
    opacity: 1;
    right: 0;
    position: relative;
  }
  .tick-block .content {
    color: #bbbbbb;
    padding: 5px;
    font-size: 0.7em;
  }
  .tick {
    width: 100%;
  }
  .tick .label {
    color: brown;
  }
  .tick-block h3 {
    background-color: #1b1b1b;
    color: #d5d5d5;
    font-size: 0.8em;
    padding: 3px;
  }
</style>

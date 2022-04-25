<script>
  import { _ } from "svelte-i18n";
  import { fade } from "svelte/transition";
  import { mounted } from "store/mounted.js";
  import { createEventDispatcher } from "svelte";
  import { WSTicker } from "store/wsStore.js";
  import { assetpair, toogleBoxTicker, setResizeChart } from "store/store.js";

  const dispatch = createEventDispatcher();

  let quote = $assetpair.wsname.split("/")[1],
    decimals = $assetpair.pair_decimals,
    slideWay = $toogleBoxTicker === "open" ? "right" : "left";

  /**
   * toogleTicker
   ************************/
  const toogleTicker = () => {
    $toogleBoxTicker = $toogleBoxTicker === "open" ? "close" : "open";
    slideWay = $toogleBoxTicker === "open" ? "right" : "left";
    $setResizeChart = true;
  };

  // $: if ($WSTicker) {
  // if (
  //   typeof $WSTicker !== "undefined" &&
  //   Object.prototype.hasOwnProperty.call($WSTicker, "a")
  // ) {
  //   let spread = ($WSTicker["a"][0] - $WSTicker["b"][0]).toFixed(decimals);
  // }
  // }

  if ($mounted) dispatch("loading", { loading: true });
</script>

{#if $mounted}
  <div class="slideBtn" on:click={toogleTicker} on:resizeChart>
    <i class="fa fa-caret-{slideWay}" />
  </div>
  <div class="tick-block {$toogleBoxTicker}" in:fade>
    {#if $WSTicker}
      <div class="tick close-tick">
        <h3>&#x58D;&nbsp;{$_("home.ticker.currentPrice")}</h3>
        <div class="content">
          <span class="label"> {$_("home.ticker.price")} : </span>{Number(
            $WSTicker["c"][0]
          ).toFixed(decimals)}&nbsp;{quote}
          <br />
          <span class="label">
            {$_("home.ticker.totalVolume")} :
          </span>{$WSTicker["c"][1]} <br />
          <!-- <span class="label">{$_("home.ticker.spread")} : </span>{spread} -->
        </div>
      </div>
      <div class="tick ask-tick">
        <h3>&#x58D;&nbsp;{$_("home.ticker.ask")}</h3>
        <div class="content">
          <span class="label">{$_("home.ticker.askValue")} : </span>{Number(
            $WSTicker["a"][0]
          ).toFixed(decimals)}&nbsp;{quote}
          <br />
          <!-- <span class="label">
          {$_("home.ticker.wholeLotVolume")} :
        </span>{$WSTicker["a"][1]} <br /> -->
          <span class="label">
            {$_("home.ticker.lotVolume")} :
          </span>{$WSTicker["a"][2]}
        </div>
      </div>
      <div class="tick bid-tick">
        <h3>&#x58D;&nbsp;{$_("home.ticker.bid")}</h3>
        <div class="content">
          <span class="label">{$_("home.ticker.bidValue")} : </span>{Number(
            $WSTicker["b"][0]
          ).toFixed(decimals)}&nbsp;{quote} <br />
          <!-- <span class="label">
          {$_("home.ticker.wholeLotVolume")} :
        </span>{$WSTicker["b"][1]} <br /> -->
          <span class="label">
            {$_("home.ticker.lotVolume")} :
          </span>{$WSTicker["b"][2]}
        </div>
      </div>
      <div class="tick low-tick">
        <h3>&#x58D;&nbsp;{$_("home.ticker.lowPrice")}</h3>
        <div class="content">
          <div class="titles">
            <span class="label">
              {$_("home.ticker.today")}
            </span>
            <span class="label">
              {$_("home.ticker.last24h")}
            </span>
          </div>
          <div class="jauge">
            <span
              class={Number($WSTicker["l"][0]) < Number($WSTicker["l"][1])
                ? "high"
                : "low"}
            >
              {Number($WSTicker["l"][0]).toFixed(decimals)}&nbsp;{quote}
            </span>
            <span
              class={Number($WSTicker["l"][0]) > Number($WSTicker["l"][1])
                ? "high"
                : "low"}
            >
              {Number($WSTicker["l"][1]).toFixed(decimals)}&nbsp;{quote}
            </span>
          </div>
        </div>
      </div>
      <div class="tick hight-tick">
        <h3>&#x58D;&nbsp;{$_("home.ticker.highPrice")}</h3>
        <div class="content">
          <div class="titles">
            <span class="label">
              {$_("home.ticker.today")}
            </span>
            <span class="label">
              {$_("home.ticker.last24h")}
            </span>
          </div>
          <div class="jauge">
            <span
              class={Number($WSTicker["h"][0]) > Number($WSTicker["h"][1])
                ? "high"
                : "low"}
            >
              {Number($WSTicker["h"][0]).toFixed(decimals)}&nbsp;{quote}
            </span>
            <span
              class={Number($WSTicker["h"][0]) < Number($WSTicker["h"][1])
                ? "high"
                : "low"}
            >
              {Number($WSTicker["h"][1]).toFixed(decimals)}&nbsp;{quote}
            </span>
          </div>
        </div>
      </div>
      <div class="tick volume-tick">
        <h3>&#x58D;&nbsp;{$_("home.ticker.volume")}</h3>
        <div class="content">
          <div class="titles">
            <span class="label">
              {$_("home.ticker.today")}
            </span>
            <span class="label">
              {$_("home.ticker.last24h")}
            </span>
          </div>
          <div class="jauge">
            <span
              class={Number($WSTicker["v"][0]) > Number($WSTicker["v"][1])
                ? "high"
                : "low"}
            >
              {$WSTicker["v"][0]}
            </span>

            <span
              class={Number($WSTicker["v"][0]) < Number($WSTicker["v"][1])
                ? "high"
                : "low"}
            >
              {$WSTicker["v"][1]}
            </span>
          </div>
        </div>
      </div>
      <div class="tick vwap-tick">
        <h3>&#x58D;&nbsp;{$_("home.ticker.vwap")}</h3>
        <div class="content">
          <div class="titles">
            <span class="label">
              {$_("home.ticker.today")}
            </span>
            <span class="label">
              {$_("home.ticker.last24h")}
            </span>
          </div>
          <div class="jauge">
            <span
              class={Number($WSTicker["p"][0]) > Number($WSTicker["p"][1])
                ? "high"
                : "low"}
            >
              {Number($WSTicker["p"][0]).toFixed(decimals)}&nbsp;{quote}
            </span>
            <span
              class={Number($WSTicker["p"][0]) < Number($WSTicker["p"][1])
                ? "high"
                : "low"}
            >
              {Number($WSTicker["p"][1]).toFixed(decimals)}&nbsp;{quote}
            </span>
          </div>
        </div>
      </div>
      <div class="tick trade-tick">
        <h3>&#x58D;&nbsp;{$_("home.ticker.numberOfTrade")}</h3>
        <div class="content">
          <div class="titles">
            <span class="label">
              {$_("home.ticker.today")}
            </span>
            <span class="label">
              {$_("home.ticker.last24h")}
            </span>
          </div>
          <div class="jauge">
            <span
              class={Number($WSTicker["t"][0]) > Number($WSTicker["t"][1])
                ? "high"
                : "low"}
            >
              {$WSTicker["t"][0]}
            </span>
            <span
              class={Number($WSTicker["t"][0]) < Number($WSTicker["t"][1])
                ? "high"
                : "low"}
            >
              {$WSTicker["t"][1]}
            </span>
          </div>
        </div>
      </div>
      <div class="tick open-tick">
        <h3>&#x58D;&nbsp;{$_("home.ticker.openPrice")}</h3>
        <div class="content">
          <div class="titles">
            <span class="label">
              {$_("home.ticker.today")}
            </span>
            <span class="label">
              {$_("home.ticker.last24h")}
            </span>
          </div>
          <div class="jauge">
            <span
              class={Number($WSTicker["o"][0]) > Number($WSTicker["h"][1])
                ? "high"
                : "low"}
            >
              {Number($WSTicker["o"][0]).toFixed(decimals)}&nbsp;{quote}
            </span>
            <span
              class={Number($WSTicker["o"][0]) < Number($WSTicker["h"][1])
                ? "high"
                : "low"}
            >
              {Number($WSTicker["h"][1]).toFixed(decimals)}&nbsp;{quote}
            </span>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .slideBtn {
    font-size: 0.6em;
    padding: 281px 0;
    width: 10px;
    height: 575px;
    color: #ffffff;
    background-color: #212121;
    float: left;
    text-align: center;
    vertical-align: middle;
    margin: 0 auto;
    cursor: pointer;
    border-left: 1px solid #212121;
    border-right: 1px solid #212121;
    border-top: 1px solid #1a1a1a;
    border-bottom: 1px solid #1a1a1a;
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
    height: 575px;
    overflow: auto;
  }
  .tick-block.close {
    transition: all 0s ease-out;
    visibility: hidden;
    opacity: 0;
    display: none;
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
  .titles span {
    display: block;
    width: 50%;
    float: left;
    text-align: center;
    padding: 2px;
    text-transform: uppercase;
  }
  .jauge span {
    display: block;
    width: 50%;
    float: left;
    text-align: center;
    color: #bbbbbb;
  }
  .high {
    background-color: #375d28;
  }
  .low {
    background-color: #672324;
  }
</style>

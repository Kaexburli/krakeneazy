<script>
  import { _ } from "svelte-i18n";
  import { WSTicker, WSSpread, WSTrade } from "store/wsstore.js";
  import { assetpair, asymbole } from "store/store.js";

  let base = $asymbole.hasOwnProperty($assetpair.base)
    ? $asymbole[$assetpair.base].name
    : $assetpair.base;
  let quote = $asymbole.hasOwnProperty($assetpair.quote)
    ? $asymbole[$assetpair.quote].name
    : $assetpair.quote;

  let tickerdata = false;
  let tradedata = false;
  let spreaddata = false;
  let bid_spread;
  let ask_spread;
  let ask_bid_diff;
  let ask_bid_spread_diff;
  let spread_calcul = "0.00";
  let decimals = $assetpair.pair_decimals;
  let lot_decimals = $assetpair.lot_decimals;

  const formatter = new Intl.DateTimeFormat(navigator.language, {
    hour12: false,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  $: if ($WSTrade) tradedata = $WSTrade;
  $: if ($WSSpread) spreaddata = $WSSpread;
  $: if ($WSTicker) tickerdata = $WSTicker;

  $: {
    if (
      typeof tickerdata !== "undefined" &&
      tickerdata.hasOwnProperty("c") &&
      spreaddata !== "undefined" &&
      spreaddata.length > 0
    ) {
      spread_calcul = (tickerdata["a"][0] - tickerdata["b"][0]).toFixed(
        decimals
      );
      bid_spread = Math.abs(tickerdata["c"][0] - spreaddata[1]);
      ask_spread = Math.abs(spreaddata[0] - tickerdata["c"][0]);
      ask_bid_diff = Math.abs(ask_spread + bid_spread);
      ask_bid_spread_diff = Math.abs(spreaddata[0] - spreaddata[1]);

      ask_spread = ((ask_spread / ask_bid_diff) * 100) / 2;
      bid_spread = ((bid_spread / ask_bid_diff) * 100) / 2;

      let spreadbid = document.querySelector(".spreadbid");
      let spreadask = document.querySelector(".spreadask");

      if (
        typeof spreadbid !== "undefined" &&
        typeof spreadask !== "undefined" &&
        spreadbid !== null &&
        spreadask !== null
      ) {
        spreadbid.style.width = bid_spread + "%";
        spreadask.style.width = ask_spread + "%";
      }
    }
  }
</script>

{#if !isNaN(ask_spread) && !isNaN(bid_spread)}
  <div class="container-box">
    <div id="jaugespread">
      <span class="spreadpercent-left"
        >({Number(ask_spread * 2).toFixed(2)}%)</span
      >
      <span class="spreadpercent-right"
        >({Number(bid_spread * 2).toFixed(2)}%)</span
      >
      <span class="spreadask" />
      <span class="spreadbid" />
      <span class="spread">{spread_calcul}</span>
    </div>
    {#if typeof spreaddata !== "undefined" && spreaddata.length > 0}
      <div class="spread-box right">
        <h5>
          <span class="left"
            >{$_("trading.spreadBox.askTitle")}
            <span class="little">({$_("trading.spreadBox.ask")})</span></span
          >
          <span class="right"
            >{$_("trading.spreadBox.bidTitle")}
            <span class="little">({$_("trading.spreadBox.bid")})</span></span
          >
          <span>{$_("trading.spreadBox.spread")}</span>
        </h5>
        <div class="left">
          <span class="ask-spread">
            {Number(spreaddata[1]).toFixed(decimals)}&nbsp;{quote}
          </span>
          <span class="ask-spread-vol">
            ({Number(spreaddata[4]).toFixed(lot_decimals)})
          </span>
        </div>
        &nbsp;{Number(ask_bid_spread_diff).toFixed(2)}&nbsp;
        <div class="right">
          <span class="bid-spread">
            {Number(spreaddata[0]).toFixed(decimals)}&nbsp;{quote}
          </span>
          <span class="bid-spread-vol">
            ({Number(spreaddata[3]).toFixed(lot_decimals)})
          </span>
        </div>
      </div>
    {/if}

    {#if typeof tickerdata !== "undefined" && tickerdata.hasOwnProperty("c")}
      <div class="ticker-box">
        <h5>
          <span class="left"
            >{$_("trading.spreadBox.askTitle")}
            <span class="little">({$_("trading.spreadBox.ask")})</span></span
          >
          <span class="right"
            >{$_("trading.spreadBox.bidTitle")}
            <span class="little">({$_("trading.spreadBox.bid")})</span></span
          >
          <span>{$_("trading.spreadBox.price")}</span>
        </h5>
        <div>
          <span class="ask-tick left">
            {Number(tickerdata["a"][0]).toFixed(decimals)}&nbsp;{quote}
          </span>
          <span class="bid-tick right">
            {Number(tickerdata["b"][0]).toFixed(decimals)}&nbsp;{quote}
          </span>
          <span class="current_price">
            {Number(tickerdata["c"][0]).toFixed(decimals)}&nbsp;{quote}
          </span>
        </div>
      </div>
    {/if}

    {#if typeof tradedata !== "undefined" && tradedata.length >= 1}
      <div class="recent-trade">
        <h5>{$_("trading.spreadBox.lastTrade")}</h5>
        {#each tradedata as td}
          <div class={td[3]}>
            <span class="date">{formatter.format(parseInt(td[2]) * 1000)}</span>
            <span class="badge">
              {#if td[4] === "l"}{$_(
                  "trading.spreadBox.limit"
                )}{:else if td[4] === "m"}{$_("trading.spreadBox.market")}{/if}
            </span>
            <span class="price">
              {$_("trading.spreadBox.price")}
              {#if td[3] === "b"}
                {$_("trading.spreadBox.priceBid")}
              {:else if td[3] === "s"}
                {$_("trading.spreadBox.priceAsk")}
              {/if}:
              {Number(td[0]).toFixed(decimals)}&nbsp;{quote}
            </span>
            <span class="volume"
              >{$_("trading.spreadBox.volume")}: ({td[1]})</span
            >
            <span class="amount">
              {$_("trading.spreadBox.totalCost")}: {Number(
                td[1] * td[0]
              ).toFixed(decimals)}&nbsp;{quote}
            </span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  #jaugespread {
    position: relative;
    width: 100%;
    height: 15px;
    background-color: #333333;
  }
  #jaugespread .spreadbid {
    position: absolute;
    top: 0;
    z-index: 1;
    left: 50%;
    display: inline-block;
    max-width: 50%;
    width: 0;
    height: 15px;
    background-color: darkgreen;
    border-right: 1px solid #000000;
    -webkit-border-top-right-radius: 5px;
    -webkit-border-bottom-right-radius: 5px;
    -moz-border-radius-topright: 5px;
    -moz-border-radius-bottomright: 5px;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }
  #jaugespread .spreadask {
    position: absolute;
    top: 0;
    z-index: 1;
    display: inline-block;
    max-width: 50%;
    width: 0;
    right: 50%;
    height: 15px;
    background-color: firebrick;
    border-left: 1px solid #000000;
    -webkit-border-top-left-radius: 5px;
    -webkit-border-bottom-left-radius: 5px;
    -moz-border-radius-topleft: 5px;
    -moz-border-radius-bottomleft: 5px;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }
  #jaugespread .spread {
    position: absolute;
    z-index: 2;
    top: -3px;
    left: 0;
    right: 0;
    margin: 0 auto;
    text-align: center;
    /* font-weight: bold; */
    color: white;
    background: none;
  }
  .spreadpercent-left {
    position: absolute;
    z-index: 2;
    top: 0;
    left: 5px;
    font-size: 0.7em;
    color: #ffaa00;
  }
  .spreadpercent-right {
    position: absolute;
    z-index: 2;
    top: 0;
    right: 5px;
    font-size: 0.7em;
    color: #ffaa00;
  }
  .little {
    font-size: 0.8em;
    margin-right: 2px;
    vertical-align: revert;
  }
  h5 {
    margin-bottom: 5px;
    padding-bottom: 4px;
    padding-top: 4px;
    padding-left: 5px;
    background-color: #1b1b1b;
    border-bottom: 1px dashed #444;
    border-top: 1px solid #000;
    font-size: 0.8em;
  }
  .container-box {
    font-size: 0.9em;
    background-color: #1b1b1b;
    border: 1px solid #000000;
  }
  .ticker-box,
  .spread-box {
    text-align: center;
    padding: 5px;
    margin-left: 5px;
    width: 49%;
    display: inline-block;
  }
  .recent-trade {
    margin: 0 5px;
    padding: 5px 0;
  }
  .recent-trade .date {
    color: #555555;
    margin-right: 20px;
    font-weight: bold;
  }
  .recent-trade .price,
  .recent-trade .volume,
  .recent-trade .amount {
    margin-right: 20px;
  }
  .recent-trade .badge {
    font-size: 0.7em;
    border: 1px solid #333333;
    background-color: #343434;
    color: #cbcbcb;
    margin-right: 20px;
    padding: 1px 5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
  }
  .ask-tick,
  .ask-spread,
  .s {
    color: firebrick;
  }
  .bid-tick,
  .bid-spread,
  .b {
    color: darkgreen;
  }
  .bid-spread-vol,
  .ask-spread-vol {
    font-size: 0.8em;
    color: #555555;
  }
  .current_price {
    margin: 0 5px;
  }
  .display-trade {
    float: right;
    margin: 3px 5px 5px 5px;
    cursor: pointer;
    color: #333333;
  }
  .display-trade:hover {
    color: #444444;
  }
</style>

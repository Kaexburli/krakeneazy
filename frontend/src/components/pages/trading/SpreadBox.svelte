<script>
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";
  import Fetch from "utils/Runfetch.js";
  import { WSTicker, WSSpread, WSTrade } from "store/wsstore.js";
  import { assetpair, asymbole } from "store/store.js";

  let base = $asymbole.hasOwnProperty($assetpair.base)
    ? $asymbole[$assetpair.base].name
    : $assetpair.wsname.split("/")[0];
  let quote = $asymbole.hasOwnProperty($assetpair.quote)
    ? $asymbole[$assetpair.quote].name
    : $assetpair.wsname.split("/")[1];

  let tickerdata = { a: [0, 0], b: [0, 0], c: [0, 0] },
    tradedata = [],
    spreaddata = Array(1).fill([0, 0, 0, 0, 0]),
    bid_spread = 0,
    ask_spread = 0,
    ask_bid_diff,
    ask_bid_spread_diff,
    spread_calcul = "0.00",
    decimals = $assetpair.pair_decimals,
    lot_decimals = $assetpair.lot_decimals,
    backUrl = __env["BACKEND_URI"],
    fetchUrl = `${backUrl}/api/trades/${$assetpair.altname}`,
    last = null;

  const formatter = new Intl.DateTimeFormat(navigator.language, {
    hour12: false,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const getAssetTrades = async () => {
    let res = await Fetch({ url: fetchUrl, endpoint: "trades" });

    if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
      console.error("[ERROR] : " + res.statusCode + " " + res.message);
      return false;
    }
    let pair = Object.keys(res)[0] || false;
    last = res.last;
    if (pair) tradedata = res[pair].reverse().slice(0, 500);
  };

  onMount(() => getAssetTrades());

  $: if ($WSTrade) tradedata = [...$WSTrade, ...tradedata];
  $: if ($WSSpread) spreaddata = $WSSpread;
  $: if ($WSTicker) tickerdata = $WSTicker;

  $: {
    if (
      tickerdata &&
      tickerdata.hasOwnProperty("c") &&
      spreaddata &&
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

      if (spreadbid && spreadask && spreadbid !== null && spreadask !== null) {
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
    {#if spreaddata && spreaddata.length > 0}
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

    {#if tickerdata && tickerdata.hasOwnProperty("c")}
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

    {#if tradedata}
      <div class="recent-trade">
        {#each tradedata as td}
          <div class="{td[3]} vol{parseInt(td[1] * td[0]).toString().length}">
            <span class="badge">
              {#if td[4] === "l"}{$_(
                  "trading.spreadBox.limit"
                )}{:else if td[4] === "m"}{$_("trading.spreadBox.market")}{/if}
            </span>
            <span class="date">{formatter.format(parseInt(td[2]) * 1000)}</span>
            <span class="price">
              {$_("trading.spreadBox.price")}
              {#if td[3] === "b"}
                {$_("trading.spreadBox.priceBid")}
              {:else if td[3] === "s"}
                {$_("trading.spreadBox.priceAsk")}
              {/if}:
              {Number(td[0]).toFixed(decimals)}&nbsp;{quote}
            </span>
            <span class="volume">
              {$_("trading.spreadBox.volume")}: ({td[1]})
            </span>
            <span class="amount">
              {$_("trading.spreadBox.totalCost")}:
              {Number(td[1] * td[0]).toFixed(decimals)}&nbsp;{quote}
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
    background-color: #292929;
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
    background-color: #29a329;
    border-right: 1px solid #000000;
    -webkit-border-top-right-radius: 3px;
    -webkit-border-bottom-right-radius: 3px;
    -moz-border-radius-topright: 3px;
    -moz-border-radius-bottomright: 3px;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
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
    background-color: #aa3333;
    border-left: 1px solid #000000;
    -webkit-border-top-left-radius: 3px;
    -webkit-border-bottom-left-radius: 3px;
    -moz-border-radius-topleft: 3px;
    -moz-border-radius-bottomleft: 3px;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
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
    font-family: "iosevka-etoile", monospace;
  }
  .spreadpercent-right {
    position: absolute;
    z-index: 2;
    top: 0;
    right: 5px;
    font-size: 0.7em;
    color: #ffaa00;
    font-family: "iosevka-etoile", monospace;
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
    font-size: 0.9em;
  }
  .container-box {
    font-size: 0.9em;
    background-color: #212121;
    border: 1px solid #181818;
    margin-top: 5px;
  }
  .ticker-box,
  .spread-box {
    text-align: center;
    width: 50%;
    padding: 3px;
    display: inline-block;
  }
  .recent-trade {
    font-size: 0.9em;
    margin: 0 5px;
    padding: 5px 0;
    max-height: 200px;
    overflow: auto;
  }
  .recent-trade .date {
    /* color: #555555;
    font-weight: bold; */
    margin-right: 10px;
    float: right;
    font-family: "iosevka-etoile", monospace;
  }
  .recent-trade .price,
  .recent-trade .volume,
  .recent-trade .amount {
    margin-right: 10px;
    font-family: "iosevka-etoile", monospace;
  }
  .recent-trade .badge {
    font-size: 0.9em;
    background-color: #6d6d6d;
    color: #000000;
    margin-right: 10px;
    padding: 2px 0 0px 1px;
    width: 65px;
    display: inline-block;
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
  }
  .ask-tick,
  .ask-spread,
  .s {
    color: #fe1014;
  }
  .bid-tick,
  .bid-spread,
  .b {
    color: #6ddc09;
  }

  .s.vol3 {
    background-color: #352424;
    color: #cccccc;
  }
  .b.vol3 {
    background-color: #2b3d2a;
    color: #cccccc;
  }
  .s.vol4 {
    background-color: #530000;
    color: #cccccc;
  }
  .b.vol4 {
    background-color: #085f00;
    color: #cccccc;
  }
  .s.vol5 {
    background-color: #860000;
    color: #cccccc;
  }
  .b.vol5 {
    background-color: #0b8800;
    color: #cccccc;
  }
  .s.vol6 {
    background-color: #af0000;
    color: #cccccc;
  }
  .b.vol6 {
    background-color: #0fb100;
    color: #cccccc;
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

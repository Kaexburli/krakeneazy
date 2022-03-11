<script>
  import { _ } from "svelte-i18n";
  import { createEventDispatcher } from "svelte";
  import { assetpair } from "store/store.js";
  import { WSBook, WSTicker, WSSpread, WSTrade } from "store/wsstore.js";

  const dispatch = createEventDispatcher();

  let spread_calcul = "0.0",
    asks = [],
    bids = [],
    ask = [],
    bid = [],
    bookdata = false,
    tickerdata = false,
    tradedata = false,
    spreaddata = false,
    totalVask = 0,
    totalVbid = 0,
    priceway = "",
    pricetmp = 0,
    base = $assetpair.wsname.split("/")[0],
    quote = $assetpair.wsname.split("/")[1],
    decimals = $assetpair.pair_decimals,
    lot_decimals = $assetpair.lot_decimals;

  const updatePriceClass = (tick) => {
    if (typeof tick !== "undefined" && tick && tick.hasOwnProperty("a")) {
      spread_calcul = (tick["a"][0] - tick["b"][0]).toFixed(decimals);

      if (tick["c"][0] > pricetmp) priceway = "price-up";
      else if (tick["c"][0] < pricetmp) priceway = "price-down";
      else if (tick["c"][0] == pricetmp) priceway = "";
      pricetmp = tick["c"][0];
    }
  };

  // Écoute l'api websocket Order Book
  const getBook = (data) => {
    if (data.hasOwnProperty("snapshot")) {
      asks = data.snapshot.as.reverse();
      bids = data.snapshot.bs;
    }
    if (data.hasOwnProperty("mirror")) {
      asks = data.mirror.as.reverse();
      bids = data.mirror.bs;
    }
    if (data.hasOwnProperty("ask")) {
      ask = data.ask.a[0].reverse();
    }
    if (data.hasOwnProperty("bid")) {
      bid = data.bid.b[0];
    }
  };

  $: if ($WSTrade) tradedata = $WSTrade;
  $: if ($WSSpread) spreaddata = $WSSpread;
  $: if ($WSTicker) {
    tickerdata = $WSTicker;
    updatePriceClass(tickerdata);
  }
  $: if ($WSBook) {
    bookdata = $WSBook;
    getBook(bookdata);
    dispatch("loading", { loading: true });
  }

  const totalVolAsk = (volume, i) => {
    if (i === 0) totalVask = 0;
    totalVask = Number(Number(volume) + Number(totalVask));
    return totalVask.toFixed(lot_decimals);
  };

  const totalVolBid = (volume, i) => {
    if (i === 0) totalVbid = 0;
    totalVbid = Number(Number(volume) + Number(totalVbid));
    return totalVbid.toFixed(lot_decimals);
  };
</script>

<div class="order-book-block">
  {#if tickerdata && tickerdata.hasOwnProperty("a")}
    <div class="tick close-tick clearfix">
      <div id="current-infos">
        <span id="current-volume">
          <span class="label">
            {$_("home.book.totalVolume")} :
          </span>{tickerdata["c"][1]}
        </span>
        <span id="current-spread">
          <span class="label">
            {$_("home.book.spread")} :
          </span>{spread_calcul}
        </span>
      </div>
    </div>
  {/if}
  <div class="order-book-section clearfix">
    <div class="order-book-vertical">
      <ul class="asks-section">
        {#each asks as a, i}
          <li class="ask" id="ask-{i}">
            <span class="ask-price">{Number(a[0]).toFixed(decimals)}</span>
            <span class="volume">{Number(a[1]).toFixed(lot_decimals)}</span>
            <span class="vol-total">{totalVolAsk(a[1], i)} </span>
          </li>
        {/each}
      </ul>
      {#if tickerdata && tickerdata.hasOwnProperty("a")}
        <div id="current-price" class={priceway}>
          {Number(tickerdata["c"][0]).toFixed(decimals)}&nbsp;{quote}
        </div>
      {/if}
      <ul class="bids-section">
        {#each bids as b, i}
          <li class="bid" id="bid-{i}">
            <span class="bid-price">{Number(b[0]).toFixed(decimals)}</span>
            <span class="volume">{Number(b[1]).toFixed(lot_decimals)}</span>
            <span class="vol-total">{totalVolBid(b[1], i)}</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>

<style>
  .clearfix:after {
    content: "";
    display: block;
    clear: both;
  }
  .order-book-block {
    background-color: #212121;
    padding: 0;
    border: 1px solid #181818;
    clear: both;
    width: 260px;
  }
  .order-book {
    background-color: #212121;
    padding: 2px;
    color: #bbbbbb;
    text-shadow: 1px 1px #212121;
    font-size: 0.7em;
    display: block;
    width: 50%;
    float: left;
  }
  .order-book-vertical {
    background-color: #212121;
    padding: 2px;
    color: #bbbbbb;
    text-shadow: 1px 1px #212121;
    font-size: 0.7em;
    display: block;
  }
  .order-book-vertical li {
    background-color: #212121;
    padding: 1px;
    margin-bottom: 1px;
    margin-left: 5px;
    margin-top: 1px;
  }
  .order-book-vertical li:hover {
    background-color: #181818;
  }
  .order-book-section {
    border: none;
    margin-left: 5px;
  }
  .order-book-section .asks-section,
  .order-book-section .asks-section {
    text-align: left;
  }
  .order-book-section .bids-section,
  .order-book-section .bids-section {
    text-align: left;
  }
  .order-book-vertical .time-label,
  .order-book-vertical .vol-total-label,
  .order-book-vertical .volume-label,
  .order-book-vertical .price-label {
    color: white;
    font-size: 1.1em;
    /* background-color: #555555; */
    padding: 2px 5px;
    text-shadow: none;
    text-transform: uppercase;
    border: none;
  }
  .order-book-vertical .ask .price-label {
    text-align: left;
  }
  .order-book-vertical .bid .price-label {
    text-align: left;
  }
  .order-book-vertical .ask span,
  .order-book-vertical .bid span,
  .order-book .ask span,
  .order-book .bid span {
    display: inline-block;
    min-width: 78px;
  }
  .order-book-vertical .ask .ask-price,
  .order-book .ask .ask-price {
    color: #ff0000;
    text-shadow: none;
    font-size: 1.1em;
  }
  .order-book-vertical .bid .bid-price,
  .order-book .bid .bid-price {
    color: greenyellow;
    text-shadow: none;
    font-size: 1.1em;
  }
  .order-book-vertical .ask .time {
    text-align: left;
    color: white;
  }
  .order-book-vertical .bid .time {
    text-align: left;
    color: white;
  }
  .order-book-vertical .ask .ask-price,
  .order-book .ask .ask-price {
    text-align: left;
  }
  .order-book-vertical .bid .bid-price,
  .order-book .bid .bid-price {
    text-align: left;
  }
  .order-book-vertical .ask .volume,
  .order-book .ask .volume {
    text-align: right;
  }
  .order-book-vertical .bid .volume,
  .order-book .bid .volume {
    text-align: right;
  }
  .order-book-vertical .ask .vol-total,
  .order-book .ask .vol-total {
    text-align: right;
  }
  .order-book-vertical .bid .vol-total,
  .order-book .bid .vol-total {
    text-align: right;
  }
  .order-book-vertical .ask-label,
  .order-book-vertical .bid-label {
    padding: 5px 0;
  }
  #ask-realtime,
  #bid-realtime {
    border-top: 1px solid #333333;
    border-bottom: 1px solid #333333;
    background-color: #181818;
  }

  .order-book-block .tick {
    background-color: #212121;
    border-bottom: 2px solid #181818;
    padding: 10px;
    height: 45px;
  }
  .order-book-block .tick #current-price {
    text-align: left;
    font-size: 2em;
    padding: 5px;
    border-radius: 10px;
    float: left;
  }
  .order-book-vertical #current-price {
    text-align: center;
    font-size: 1.8em;
    padding: 5px;
    background-color: #1b1b1b;
    border: 1px solid #141414;
  }
  .order-book-block .tick #current-infos {
    font-size: 0.8em;
    color: #747474;
  }
  .order-book-block .tick #current-volume {
    text-align: left;
    align-items: flex-end;
  }
  .order-book-block .tick #current-spread {
    float: right;
    text-align: right;
    align-items: flex-end;
  }
  .order-book-block .tick #current-volume span.label,
  .order-book-block .tick #current-spread span.label {
    color: #747474;
    font-weight: bold;
  }

  :global(.price-down) {
    color: #ff0000;
  }
  :global(.price-up) {
    color: greenyellow;
  }
</style>

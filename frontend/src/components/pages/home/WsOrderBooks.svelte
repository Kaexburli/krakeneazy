<script>
  import { _ } from "svelte-i18n";
  import { onMount, createEventDispatcher } from "svelte";
  import { assetpair } from "store/store.js";
  import { book, ticker, spread, trade } from "store/wsstore.js";

  const dispatch = createEventDispatcher();

  let spread_calcul = "0.0";
  let asks = [];
  let bids = [];
  let ask = [];
  let bid = [];
  let bookdata = false;
  let tickerdata = false;
  let tradedata = false;
  let spreaddata = false;
  let totalVask = 0;
  let totalVbid = 0;
  let priceway = "";
  let pricetmp = 0;
  let quote = $assetpair.quote;
  let decimals = $assetpair.pair_decimals;

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
      asks = data.snapshot.as;
      bids = data.snapshot.bs;
    }
    if (data.hasOwnProperty("mirror")) {
      asks = data.mirror.as;
      bids = data.mirror.bs;
    }
    if (data.hasOwnProperty("ask")) {
      ask = data.ask.a[0];
    }
    if (data.hasOwnProperty("bid")) {
      bid = data.bid.b[0];
    }
  };

  onMount(() => {
    trade.subscribe((tick) => {
      if (typeof tick !== "undefined" && tick && Object.keys(tick).length > 1)
        if (tick.service === "Trade" && tick.data) tradedata = tick.data;
    });

    spread.subscribe((tick) => {
      if (typeof tick !== "undefined" && tick && Object.keys(tick).length > 1)
        if (tick.service === "Spread" && tick.data) spreaddata = tick.data;
    });

    ticker.subscribe((tick) => {
      if (typeof tick !== "undefined" && tick && Object.keys(tick).length > 1) {
        if (tick.service === "Ticker" && tick.data) {
          tickerdata = tick.data;
          updatePriceClass(tickerdata);
        }
      }
    });

    book.subscribe((tick) => {
      if (typeof tick !== "undefined" && tick && Object.keys(tick).length) {
        if (tick.service === "OrderBook" && tick.data) {
          bookdata = tick.data;
          getBook(bookdata);
          dispatch("loading", { loading: true });
        }
      }
    });
  });

  // Convertie le timestamp en heure lisible
  const FDate = (timestamp) => {
    var date = new Date(timestamp * 1000);
    return (
      ("0" + date.getHours()).slice(-2) +
      ":" +
      ("0" + date.getMinutes()).slice(-2) +
      ":" +
      ("0" + date.getSeconds()).slice(-2)
    );
  };

  const totalVolAsk = (volume, i) => {
    if (i === 0) totalVask = 0;
    totalVask = Number(Number(volume) + Number(totalVask));
    return totalVask.toFixed(8);
  };

  const totalVolBid = (volume, i) => {
    if (i === 0) totalVbid = 0;
    totalVbid = Number(Number(volume) + Number(totalVbid));
    return totalVbid.toFixed(8);
  };
</script>

<div class="order-book-block">
  {#if typeof tickerdata !== "undefined" && tickerdata.hasOwnProperty("a")}
    <div class="tick close-tick clearfix">
      <div id="current-price" class={priceway}>
        {Number(tickerdata["c"][0]).toFixed(decimals)}&nbsp;{quote}
      </div>
      <div id="current-infos">
        <div id="current-volume">
          <span class="label">
            {$_("home.book.totalVolume")} :
          </span>{tickerdata["c"][1]}
        </div>
        <div id="current-spread">
          <span class="label">
            {$_("home.book.spread")} :
          </span>{spread_calcul}
        </div>
      </div>
    </div>
  {/if}
  <div class="order-book-section clearfix">
    <ul class="order-book asks-section">
      {#each asks as a, i}
        {#if i === 0}
          <li class="ask ask-label" id="ask-{i}">
            <span class="time-label">{$_("home.book.time")}</span>
            <span class="vol-total-label">{$_("home.book.totalVolume")}</span>
            <span class="volume-label">{$_("home.book.volume")}</span>
            <span class="price-label">{$_("home.book.price")}</span>
          </li>
        {/if}
        {#if ask && i == 0}
          <li class="ask" id="ask-realtime">
            <span class="time">{FDate(ask[2])}</span>
            <span class="vol-total">{ask[1]} </span>
            <span class="volume">{ask[1]}</span>
            <span class="ask-price">{Number(ask[0]).toFixed(decimals)}</span>
          </li>
        {/if}
        <li class="ask" id="ask-{i}">
          <span class="time">{FDate(a[2])}</span>
          <span class="vol-total">{totalVolAsk(a[1], i)} </span>
          <span class="volume">{a[1]}</span>
          <span class="ask-price">{Number(a[0]).toFixed(decimals)}</span>
        </li>
      {/each}
    </ul>
    <ul class="order-book bids-section">
      {#each bids as b, i}
        {#if i === 0}
          <li class="bid bid-label" id="bid-{i}">
            <span class="price-label">{$_("home.book.price")}</span>
            <span class="volume-label">{$_("home.book.volume")}</span>
            <span class="vol-total-label">{$_("home.book.totalVolume")}</span>
            <span class="time-label">{$_("home.book.time")}</span>
          </li>
        {/if}
        {#if bid && i == 0}
          <li class="bid" id="bid-realtime">
            <span class="bid-price">{Number(bid[0]).toFixed(decimals)}</span>
            <span class="volume">{bid[1]}</span>
            <span class="vol-total">{bid[1]}</span>
            <span class="time">{FDate(bid[2])}</span>
          </li>
        {/if}
        <li class="bid" id="bid-{i}">
          <span class="bid-price">{Number(b[0]).toFixed(decimals)}</span>
          <span class="volume">{b[1]}</span>
          <span class="vol-total">{totalVolBid(b[1], i)}</span>
          <span class="time">{FDate(b[2])}</span>
        </li>
      {/each}
    </ul>
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
  }
  .order-book {
    background-color: #212121;
    padding: 2px;
    color: white;
    text-shadow: 1px 1px #212121;
    font-size: 0.7em;
    display: block;
    width: 50%;
    float: left;
  }
  .order-book li {
    background-color: #212121;
  }
  .order-book li:hover {
    background-color: #181818;
  }
  .order-book-section {
    border: none;
  }
  .order-book-section .asks-section {
    text-align: left;
  }
  .order-book-section .bids-section {
    text-align: right;
  }
  .order-book .time-label,
  .order-book .vol-total-label,
  .order-book .volume-label,
  .order-book .price-label {
    color: white;
    font-size: 1.1em;
    /* background-color: #555555; */
    padding: 2px 5px;
    text-shadow: none;
    text-transform: uppercase;
    border: none;
  }
  .order-book .ask .price-label {
    text-align: right;
  }
  .order-book .bid .price-label {
    text-align: left;
  }
  .order-book .ask {
    padding: 2px 5px;
    color: #ff2e2e;
  }
  .order-book .bid {
    padding: 2px 5px;
    color: #b5ff83;
  }
  .order-book .ask span,
  .order-book .bid span {
    display: inline-block;
    min-width: 78px;
  }
  .order-book .ask .ask-price {
    color: #ff0000;
    text-shadow: none;
    font-size: 1.1em;
  }
  .order-book .bid .bid-price {
    color: greenyellow;
    text-shadow: none;
    font-size: 1.1em;
  }
  .order-book .ask .time {
    text-align: left;
    color: white;
  }
  .order-book .bid .time {
    text-align: right;
    color: white;
  }
  .order-book .ask .ask-price {
    text-align: right;
  }
  .order-book .bid .bid-price {
    text-align: left;
  }
  .order-book .ask .volume {
    text-align: left;
  }
  .order-book .bid .volume {
    text-align: right;
  }
  .order-book .ask .vol-total {
    text-align: left;
  }
  .order-book .bid .vol-total {
    text-align: right;
  }
  .order-book .ask-label,
  .order-book .bid-label {
    padding: 5px 0;
  }
  #ask-realtime,
  #bid-realtime {
    border-top: 1px solid #333333;
    border-bottom: 1px solid #333333;
    background-color: #181818;
  }

  .order-book-block .tick {
    padding: 2px;
    background-color: #1c1c1c;
    display: block;
  }
  .order-book-block .tick #current-price {
    text-align: left;
    font-size: 1.5em;
    padding: 5px;
    border-radius: 10px;
    float: left;
  }
  .order-book-block .tick #current-infos {
    margin-left: 20px;
    font-size: 0.9em;
    margin-top: 5px;
    float: right;
  }
  .order-book-block .tick #current-volume {
    text-align: left;
    align-items: flex-end;
  }
  .order-book-block .tick #current-spread {
    text-align: left;
    align-items: flex-end;
  }
  .order-book-block .tick #current-volume span.label,
  .order-book-block .tick #current-spread span.label {
    color: #cecece;
    font-weight: normal;
  }

  :global(.price-down) {
    color: #ff0000;
  }
  :global(.price-up) {
    color: greenyellow;
  }
</style>

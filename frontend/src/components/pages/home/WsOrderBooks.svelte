<script>
  import { _ } from "svelte-i18n";
  import { createEventDispatcher } from "svelte";
  import { assetpair, depth } from "store/store.js";
  import { WSBook, WSTicker } from "store/wsstore.js";

  const dispatch = createEventDispatcher();

  let pad,
    spread_calcul = "0.0",
    displayDepth = true,
    bookNbItem = 13,
    bookMultiplier = 1000,
    bookDiviser = 10,
    order_book = {
      as: Array(bookNbItem).fill([0, 0, 0, 0]),
      bs: Array(bookNbItem).fill([0, 0, 0, 0]),
    },
    asks = Array(bookNbItem).fill([0, 0, 0, 0]),
    bids = Array(bookNbItem).fill([0, 0, 0, 0]),
    ask = [],
    bid = [],
    bookTotal = { as: { total: 0, count: 0 }, bs: { total: 0, count: 0 } },
    bookdata = false,
    tickerdata = { c: [0, 0] },
    priceway = "",
    pricetmp = 0,
    quote = $assetpair.wsname.split("/")[1],
    decimals = $assetpair.pair_decimals,
    lot_decimals = $assetpair.lot_decimals,
    errorDisplay = "<span>---</span>";

  let groupRange = [
    0, 0.5, 1.0, 2.5, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000,
  ];
  let priceGroupingSelect = groupRange[0];
  let priceGrouping = groupRange[0];
  let diviser = "1".padEnd(decimals, "0");

  /**
   * updatePriceClass
   ************************/
  const updatePriceClass = (tick) => {
    if (tick) {
      spread_calcul = (tick["a"][0] - tick["b"][0]).toFixed(decimals);

      if (tick["c"][0] > pricetmp) priceway = "price-up";
      else if (tick["c"][0] < pricetmp) priceway = "price-down";
      else if (tick["c"][0] == pricetmp) priceway = "";
      pricetmp = tick["c"][0];
    }
  };

  /**
   * crc32Generate
   ************************/
  const crc32Generate = () => {
    let table = new Array();

    for (let i = 0; i < 256; i++) {
      let n = i;
      for (let j = 8; j > 0; j--) {
        if ((n & 1) == 1) {
          n = (n >>> 1) ^ 0xedb88320;
        } else {
          n = n >>> 1;
        }
      }
      table[i] = n;
    }

    return table;
  };

  /**
   * crc32Compute
   ************************/
  const crc32Compute = (str) => {
    let table = crc32Generate();
    let crc = 0xffffffff;

    for (let i = 0; i < str.length; i++)
      crc = (crc >>> 8) ^ table[str.charCodeAt(i) ^ (crc & 0x000000ff)];

    crc = ~crc;
    crc = crc < 0 ? 0xffffffff + crc + 1 : crc;

    return crc;
  };

  /**
   * orderbookChecksum
   ************************/
  const orderbookChecksum = (orderbook_json) => {
    let orderbook_ask = Object.keys(orderbook_json).includes("a")
      ? orderbook_json["a"]
      : Object.keys(orderbook_json).includes("as")
      ? orderbook_json["as"]
      : orderbook_json;
    let orderbook_bid = Object.keys(orderbook_json).includes("b")
      ? orderbook_json["b"]
      : Object.keys(orderbook_json).includes("bs")
      ? orderbook_json["bs"]
      : orderbook_json;

    let checksum_string = "";

    for (let count = 0; count < 5; count++) {
      checksum_string = checksum_string.concat(
        parseInt(orderbook_ask[count][0].replace(".", ""))
      );
      checksum_string = checksum_string.concat(
        parseInt(orderbook_ask[count][1].replace(".", ""))
      );
    }

    for (let count = 0; count < 5; count++) {
      checksum_string = checksum_string.concat(
        parseInt(orderbook_bid[count][0].replace(".", ""))
      );
      checksum_string = checksum_string.concat(
        parseInt(orderbook_bid[count][1].replace(".", ""))
      );
    }

    return crc32Compute(checksum_string);
  };

  /**
   * updateBook
   ************************/
  const updateBook = (side, data, checksumOrigine) => {
    data.forEach((item) => {
      let index = order_book[side].findIndex((o) => o && o[0] === item[0]);
      if (index === -1) {
        // index n'existe pas on l'ajoute
        order_book[side].push([item[0], item[1], item[2]]);
      } else {
        if (item[1] == 0) {
          // index existe mais le volume est vide on supprime
          order_book[side].splice(index, 1);
        } else {
          // index existe et le volume change on met à jour
          order_book[side][index] = [item[0], item[1], item[2]];
        }
      }
    });
    order_book = sortBook(order_book, side);

    // let checksum = orderbookChecksum(order_book);
    // console.log(checksum == checksumOrigine, checksum, checksumOrigine);
  };

  /**
   * sortBook
   ************************/
  const sortBook = (arr, side) => {
    if (side == "bs") {
      arr[side].sort((x, y) => parseFloat(y[0]) - parseFloat(x[0]));
    } else if (side == "as") {
      arr[side].sort((x, y) => parseFloat(x[0]) - parseFloat(y[0]));
    }
    return arr;
  };

  /**
   * getBook
   ************************/
  const getBook = (data) => {
    if (data.hasOwnProperty("snapshot")) {
      order_book = data.snapshot;
    } else if (data.hasOwnProperty("mirror")) {
      // let checksum = orderbookChecksum(order_book);
    } else if (data.hasOwnProperty("ask")) {
      ask = data.ask.a || false;
      if (ask) updateBook("as", ask, data.ask.c);
    } else if (data.hasOwnProperty("bid")) {
      bid = data.bid.b || false;
      if (bid) updateBook("bs", bid, data.bid.c);
    }

    // UpdateBookOrder
    updateBookOrder();
  };

  /**
   * groupBy
   ************************/
  const groupBy = (obook, val) => {
    let acc = [];

    const round = (value, step) => {
      step || (step = 1.0);
      let inv = 1.0 / step;
      return Math.round(value * inv) / inv;
    };

    for (let i = 0; i < obook.length; i++) {
      const data = obook[i];

      let indexVal = round(data[0], val);
      let indexOf = acc.findIndex((o) => o && o[0] === indexVal);

      if (indexOf !== -1) {
        acc[indexOf][0] = parseFloat(indexVal);
        acc[indexOf][1] = parseFloat(acc[indexOf][1] + data[1]).toFixed(pad);
        acc[indexOf][2] = parseFloat(acc[indexOf][2] + data[2]).toFixed(pad);
        acc[indexOf][3] = parseFloat(acc[indexOf][3] + data[3]).toFixed(pad);
      } else {
        let tmp = [indexVal, data[1], data[2], data[3]];
        acc.push(tmp);
      }
    }

    // Return acc
    return acc;
  };

  /**
   * updateBookOrder
   ************************/
  const updateBookOrder = () => {
    // Update du prix total
    asks = updateTotal(order_book.as, "as");
    bids = updateTotal(order_book.bs, "bs");

    // Groupe si valeur selectionné
    if (priceGrouping > 0) {
      asks = groupBy(asks, priceGrouping);
      bids = groupBy(bids, priceGrouping);
    }

    // Slice par bookNbItem
    asks = asks.slice(0, bookNbItem).reverse();
    bids = bids.slice(0, bookNbItem);

    // pad = 10 - String(parseInt(asks[0][1])).length;
    // pad = pad > lot_decimals + 1 ? lot_decimals : 4;
    pad = diviser >= 1000 ? 4 : lot_decimals;
  };

  /**
   * toogleTicker
   ************************/
  const updateTotal = (data, side) => {
    let total = 0;
    data.forEach((item) => {
      total = Number(Number(item[1]) + Number(total));
      item[3] = total;
    });
    bookTotal[side] = {
      total: parseFloat(total / bookDiviser).toFixed(2),
      count: data.length,
    };
    return data;
  };

  /**
   * setDepthBook
   ************************/
  // A VOIR POUR LE GROUPEMENT
  const setDepthBook = (sens) => {
    let length = groupRange.length - 1;
    if (sens === "plus") {
      priceGroupingSelect++;
      priceGroupingSelect =
        priceGroupingSelect > length ? length : priceGroupingSelect;
    } else if (sens === "minus") {
      priceGroupingSelect--;
      priceGroupingSelect = priceGroupingSelect < 0 ? 0 : priceGroupingSelect;
    }
    priceGrouping = parseFloat(
      groupRange[priceGroupingSelect] / diviser
    ).toFixed(decimals);
  };

  $: if ($WSTicker) {
    tickerdata = $WSTicker;
    updatePriceClass(tickerdata);
  }
  $: if ($WSBook) {
    bookdata = $WSBook;
    getBook(bookdata);
    dispatch("loading", { loading: true });
  }
</script>

<div class="order-book-block">
  {#if tickerdata}
    <div class="tick close-tick clearfix">
      <div id="current-infos">
        <span id="current-volume">
          <span class="label">
            {$_("home.book.totalVolume")} :
          </span>{tickerdata["c"][1]}
        </span>
        <br />
        <span id="current-spread">
          <span class="label">
            {$_("home.book.spread")} :
          </span>{spread_calcul}
        </span>
        {#if displayDepth}
          <div id="depth-select">
            {#if priceGrouping > 0}
              <span class="grouping">
                {$_("home.book.group")} :{priceGrouping}
              </span>
            {/if}
            <button
              class="minusBtn"
              on:click|preventDefault={() => setDepthBook("minus")}
            >
              <i class="fa fa-minus" />
            </button>
            <button
              class="plusBtn"
              on:click|preventDefault={() => setDepthBook("plus")}
            >
              <i class="fa fa-plus" />
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
  <div class="order-book-section clearfix">
    <div class="order-book-vertical">
      <div class="block">
        <ul class="asks-section">
          {#each asks as a, i}
            <li class="ask" id="ask-{i}">
              <div
                class="ask-line"
                style="width:{(Number(a[3]).toFixed(pad) / bookTotal.as.total) *
                  bookMultiplier}%;"
              />
              <span class="ask-price">
                {#if Number(a[0]) > 0}
                  {@html Number(a[0]).toFixed(decimals) || errorDisplay}
                {:else}
                  {@html errorDisplay}
                {/if}
              </span>
              <span class="volume">
                {#if Number(a[1]) > 0}
                  {@html `<span style="color:white;font-size:0.9em;">${
                    String(a[1]).split(".")[0]
                  }</span>.${String(Number(a[1]).toFixed(pad)).split(".")[1]}`}
                {:else}
                  {@html errorDisplay}
                {/if}
              </span>
              <span class="vol-total">
                {#if Number(a[3]) > 0}
                  {@html `${
                    String(a[3]).split(".")[0]
                  }.<span style="color:white;font-size:0.9em;">${
                    String(Number(a[3]).toFixed(pad)).split(".")[1]
                  }</span>`}
                {:else}
                  {@html errorDisplay}
                {/if}
              </span>
            </li>
          {/each}
        </ul>
      </div>
      {#if tickerdata}
        <div id="current-price" class={priceway}>
          {@html Number(tickerdata["c"][0]).toFixed(decimals) ||
            errorDisplay}&nbsp;{quote}
        </div>
      {/if}
      <div class="block">
        <ul class="bids-section">
          {#each bids as b, i}
            <li class="bid" id="bid-{i}">
              <div
                class="bid-line"
                style="width:{(Number(b[3]).toFixed(pad) / bookTotal.bs.total) *
                  bookMultiplier}%;"
              />
              <span class="bid-price">
                {#if Number(b[0]) > 0}
                  {@html Number(b[0]).toFixed(decimals) || errorDisplay}
                {:else}
                  {@html errorDisplay}
                {/if}
              </span>
              <span class="volume">
                {#if Number(b[1]) > 0}
                  {@html `<span style="color:white;font-size:0.9em;">${
                    String(b[1]).split(".")[0]
                  }</span>.${String(Number(b[1]).toFixed(pad)).split(".")[1]}`}
                {:else}
                  {@html errorDisplay}
                {/if}
              </span>
              <span class="vol-total">
                {#if Number(b[3]) > 0}
                  {@html `${
                    String(b[3]).split(".")[0]
                  }.<span style="color:white;font-size:0.9em;">${
                    String(Number(b[3]).toFixed(pad)).split(".")[1]
                  }</span>`}
                {:else}
                  {@html errorDisplay}
                {/if}
              </span>
            </li>
          {/each}
        </ul>
      </div>
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
    width: 270px;
  }
  .order-book {
    background-color: #212121;
    padding: 2px;
    color: #bbbbbb;
    font-size: 0.7em;
    display: block;
    width: 50%;
    float: left;
  }
  .order-book-vertical {
    font-size: 0.8em;
    display: block;
  }
  .order-book-vertical li {
    position: relative;
    color: #a8a8a8;
    height: 19px;
    line-height: 19px;
  }
  .order-book-vertical li:hover {
    background-color: #181818;
  }
  .order-book-section {
    border: none;
    margin-left: 5px;
    overflow: hidden;
  }
  .order-book-section .block {
    height: 246px;
    margin: 1px 0px;
    position: relative;
  }
  .order-book-section .asks-section,
  .order-book-section .asks-section {
    width: 100%;
    text-align: left;
    position: absolute;
    bottom: 0;
  }
  .order-book-section .bids-section,
  .order-book-section .bids-section {
    width: 100%;
    text-align: left;
    position: absolute;
    top: 0;
  }
  .order-book-vertical .time-label,
  .order-book-vertical .vol-total-label,
  .order-book-vertical .volume-label,
  .order-book-vertical .price-label {
    color: white;
    font-size: 1em;
    /* background-color: #555555; */
    padding: 2px 5px;
    text-transform: uppercase;
    border: none;
  }
  .order-book-vertical .ask .ask-line {
    position: absolute;
    z-index: 1;
    background-color: #672324;
    border: 1px solid #222;
    top: 0;
    bottom: 0;
    right: 0;
  }
  .order-book-vertical .bid .bid-line {
    position: absolute;
    z-index: 1;
    background-color: #375d28;
    border: 1px solid #222;
    top: 0;
    bottom: 0;
    right: 0;
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
    position: relative;
    z-index: 9;
    display: inline-block;
    min-width: 85px;
    font-size: 1em;
    font-family: "iosevka-etoile", monospace;
  }
  .order-book-vertical .ask .ask-price,
  .order-book .ask .ask-price {
    color: #fe1014;
    font-size: 1em;
  }
  .order-book-vertical .bid .bid-price,
  .order-book .bid .bid-price {
    color: #6ddc09;
    font-size: 1em;
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
  .order-book-vertical .ask .volume .intiger,
  .order-book-vertical .bid .volume .intiger {
    color: white;
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
    padding: 5px 10px;
    height: 45px;
  }
  .order-book-block .tick #current-price {
    text-align: left;
    font-size: 2em;
    padding: 2px;
    margin: 5px 0 3px 0;
    border-radius: 10px;
    float: left;
    font-family: "iosevka-etoile", monospace;
  }
  .order-book-vertical #current-price {
    height: 32px;
    line-height: 32px;
    text-align: center;
    font-size: 1.8em;
    padding: 0;
    margin: 0;
    background-color: #272727;
    border: 1px solid #131313;
    font-family: "iosevka-etoile", monospace;
  }
  .order-book-block .tick #current-infos {
    font-size: 0.7em;
    color: #747474;
  }
  .order-book-block .tick #current-volume {
    text-align: left;
    align-items: flex-end;
  }
  .order-book-block .tick #current-spread {
    text-align: right;
    align-items: flex-end;
  }
  .order-book-block .tick #depth-select {
    float: right;
    margin-top: -5px;
  }
  .order-book-block .tick #depth-select button.plusBtn,
  .order-book-block .tick #depth-select button.minusBtn {
    font-size: 0.9em;
    border: 1px solid #2b2b2b;
    padding: 0px 3px;
    background-color: #2c2c2c;
    color: #999999;
    cursor: pointer;
  }
  .order-book-block .tick #depth-select button.plusBtn:hover,
  .order-book-block .tick #depth-select button.minusBtn:hover {
    background-color: #333333;
    color: white;
  }
  .order-book-block .tick #current-volume span.label,
  .order-book-block .tick #current-spread span.label {
    color: #747474;
    font-weight: bold;
  }

  .order-book-block .tick .grouping {
    color: darkcyan;
  }

  :global(.price-down) {
    color: #ff0000;
  }
  :global(.price-up) {
    color: greenyellow;
  }
</style>

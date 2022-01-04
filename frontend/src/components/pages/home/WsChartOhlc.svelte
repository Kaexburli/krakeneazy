<script>
  import { onMount, onDestroy } from "svelte";
  import { ohlc, openorders } from "store/wsstore.js";
  import getLocaleDateString from "utils/getLocaleDateString.js";
  import { CrosshairMode } from "lightweight-charts";
  import Chart from "svelte-lightweight-charts/components/chart.svelte";
  import CandlestickSeries from "svelte-lightweight-charts/components/candlestick-series.svelte";
  import Fetch from "utils/Runfetch.js";

  import {
    online,
    interval,
    pair,
    assetpair,
    fetchurl,
    ohlcchart,
  } from "store/store.js";

  let type;
  let series;
  let chartApi;
  let activetooltip = false;
  let activePosition = false;
  let crosshairMode = false;
  let markers = [];
  let newCandel = false;
  let ohlcLastItemhistory = null;
  let lastCandelStartTime = null;
  let lastCandelEndTime = null;
  let open, high, low, close;
  let timeZoneOffset = new Date().getTimezoneOffset() / -60;
  let intval = $interval * 60;
  let isMounted = false;
  let legend = "KRAKEN " + $assetpair.wsname + " " + $interval + "M";
  let fetchUrl = $fetchurl + "/api/ohlc/" + $pair + "/" + $interval;

  const cmtt = (milliseconde) => {
    return new Date(milliseconde).toLocaleTimeString(navigator.language, {
      timeZone: "UTC",
    });
  };

  /**
   * getChartHistoryDatas
   ************************/
  const getChartHistoryDatas = async () => {
    if (!$online) return false;

    try {
      let res = await Fetch(fetchUrl, "ohlc");

      if (res.hasOwnProperty("error")) {
        console.error(`${res.message} ${res.error} (${res.statusCode})`);
      } else {
        Object.keys(res).map(
          (key) => (res[key].time = res[key].time)
          // (key) => (res[key].time = res[key].time + timeZoneOffset * 3600)
        );
        ohlcchart.set(res);
        if (
          typeof $ohlcchart !== "undefined" &&
          !isNaN($ohlcchart.length - 1)
        ) {
          ohlcLastItemhistory = $ohlcchart[$ohlcchart.length - 1];
          lastCandelStartTime = ohlcLastItemhistory.time;
          setTimerInterval();
        }
      }
    } catch (error) {
      console.error("[ERROR] getChartHistoryDatas: ", error);
    }
  };

  /**
   * setTimerInterval
   ************************/
  const setTimerInterval = () => {
    let date = new Date();
    let timeRemaining = (60 - date.getSeconds()) * 1000;

    setTimeout(() => {
      setInterval(() => {
        newCandel = true;
      }, $interval * 60 * 1000);
    }, timeRemaining);
  };

  /**
   * onMount
   ************************/
  onMount(() => {
    isMounted = true;
    getChartHistoryDatas();
  });

  /**
   * onDestroy
   ************************/
  onDestroy(() => {
    isMounted = false;
  });

  /**
   * formatCandelTick
   ************************/
  const formatCandelTick = (tick) => {
    if (
      typeof $ohlcchart !== "undefined" &&
      !isNaN($ohlcchart.length - 1) &&
      isMounted
    ) {
      let candle = ohlcFormat(tick);

      if (newCandel) {
        // console.log("nouvelle bougie !!!");
        lastCandelStartTime = candle.endtime;
        candle.time = lastCandelStartTime;
        ohlcLastItemhistory = candle;
        delete candle.endtime;
        newCandel = false;
        if (typeof series !== ("undefined" || null)) series.update(candle);
      }

      if (!newCandel) {
        // console.log("Nous avons affaire à la meme bougie !!!");
        candle.time = lastCandelStartTime;
        candle.open = ohlcLastItemhistory.open;
        if (ohlcLastItemhistory.high > candle.high)
          candle.high = ohlcLastItemhistory.high;
        if (ohlcLastItemhistory.low < candle.low)
          candle.low = ohlcLastItemhistory.low;
        delete candle.endtime;
        if (typeof series !== ("undefined" || null)) series.update(candle);
      }
    }
  };

  /**
   * ohlcFormat
   ************************/
  const ohlcFormat = (datas) => {
    const dataLength = datas.length;

    if (dataLength > 1) {
      let ohlc_tmp = JSON.parse("{}");
      let time = parseInt(datas[0]) + timeZoneOffset * 3600;
      let endtime = parseInt(datas[1]) + timeZoneOffset * 3600;
      ohlc_tmp["time"] = parseInt(datas[0]);
      ohlc_tmp["endtime"] = parseInt(datas[1]);
      ohlc_tmp["open"] = parseFloat(datas[2]).toFixed($assetpair.pair_decimals);
      ohlc_tmp["high"] = parseFloat(datas[3]).toFixed($assetpair.pair_decimals);
      ohlc_tmp["low"] = parseFloat(datas[4]).toFixed($assetpair.pair_decimals);
      ohlc_tmp["close"] = parseFloat(datas[5]).toFixed(
        $assetpair.pair_decimals
      );
      ohlc_tmp["vwap"] = parseFloat(datas[6]).toFixed($assetpair.pair_decimals);
      ohlc_tmp["volume"] = datas[7];
      ohlc_tmp["trades"] = datas[8];
      return ohlc_tmp;
    }
  };

  /**
   * displayToolTipChart
   ************************/
  const displayToolTipChart = (param) => {
    let toolTipWidth = 80;
    let toolTipHeight = 80;
    let toolTipMargin = 15;
    let opentooltip;
    let closetooltip;
    let hightooltip;
    let lowtooltip;

    for (const value of param.seriesPrices.values()) {
      opentooltip = value["open"];
      hightooltip = value["high"];
      lowtooltip = value["low"];
      closetooltip = value["close"];
    }

    let chartblock = document.querySelector(".chart-block");
    let toolTip = document.querySelector(".floating-tooltip");

    // update tooltip
    if (
      param.point === undefined ||
      !param.time ||
      param.point.x < 0 ||
      param.point.x > chartblock.clientWidth ||
      param.point.y < 0 ||
      param.point.y > chartblock.clientHeight ||
      !activetooltip
    ) {
      toolTip.style.display = "none";
    } else {
      toolTip.style.display = "block";
      let price = param.seriesPrices.get(series);
      type = price.open <= price.close ? "green" : "red";
      let timelaps =
        $interval >= 10080
          ? $interval / 60 / 24 + "J"
          : $interval >= 60
          ? $interval / 60 + "H"
          : $interval + "M";
      toolTip.innerHTML =
        "<div class=" +
        type +
        '><div class="title"><strong>' +
        $assetpair.wsname +
        " " +
        timelaps +
        '</strong></div><div style="padding:3px;"> <strong>Open:</strong> ' +
        opentooltip +
        "<br /><strong>High:</strong> " +
        hightooltip +
        "<br /><strong>Low:</strong> " +
        lowtooltip +
        "<br /><strong>Close:</strong> " +
        closetooltip +
        "";
      ("</div></div>");

      let priceCoordinate = type === "green" ? price.open : price.close;
      let coordinate = series.priceToCoordinate(priceCoordinate);
      let shiftedCoordinate = param.point.x - 30;

      if (coordinate === null) return;

      shiftedCoordinate = Math.max(
        0,
        Math.min(chartblock.clientWidth - toolTipWidth, shiftedCoordinate)
      );

      let coordinateY =
        coordinate - toolTipHeight - toolTipMargin > 0
          ? coordinate - toolTipHeight - toolTipMargin
          : Math.max(
              0,
              Math.min(
                chartblock.clientHeight - toolTipHeight - toolTipMargin,
                coordinate + toolTipMargin
              )
            );

      toolTip.style.left = shiftedCoordinate + "px";
      toolTip.style.top = coordinateY + "px";
    }
  };

  /**
   * displayOhlcBande
   ************************/
  const displayOhlcBande = (param) => {
    if (param.time) {
      let type;
      for (const value of param.seriesPrices.values()) {
        open = value["open"];
        high = value["high"];
        low = value["low"];
        close = value["close"];
        type = open <= close ? "green" : "red";
      }
      legend = "KRAKEN " + $assetpair.wsname + " " + $interval + "M  ";
      legend +=
        ' <span class="ohlc">' +
        '<span class="' +
        type +
        '">OPEN</span>: ' +
        open +
        ' <span class="' +
        type +
        '">HIGH</span>: ' +
        high +
        ' <span class="' +
        type +
        '">LOW</span>: ' +
        low +
        ' <span class="' +
        type +
        '">CLOSE</span>: ' +
        close +
        "</span>";
    } else {
      legend = "KRAKEN " + $assetpair.wsname + " " + $interval + "M  ";
    }
  };

  const rigthClickMenu = (param) => {
    let chartblock = document.querySelector(".chart-block");
    let rightclickmenu = document.getElementById("rightclickmenu").style;
    let pricealert = document.getElementById("pricealert");

    if (typeof param.point !== "undefined") {
      let price = series.coordinateToPrice(param.point.y);
      pricealert.innerHTML = "@" + price.toFixed($assetpair.pair_decimals);
    }

    if (chartblock.addEventListener) {
      chartblock.addEventListener(
        "contextmenu",
        (e) => {
          e.preventDefault();
          var posX = e.clientX;
          var posY = e.clientY;
          setMenu(rightclickmenu, posX, posY);
        },
        false
      );
      chartblock.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          rightclickmenu.opacity = "0";
          setTimeout(() => {
            rightclickmenu.visibility = "hidden";
          }, 501);
        },
        false
      );
    } else {
      chartblock.attachEvent("oncontextmenu", (e) => {
        e.preventDefault();
        var posX = e.clientX;
        var posY = e.clientY;
        setMenu(rightclickmenu, posX, posY);
      });
      chartblock.attachEvent("onclick", (e) => {
        e.preventDefault();
        rightclickmenu.opacity = "0";
        setTimeout(() => {
          rightclickmenu.visibility = "hidden";
        }, 501);
      });
    }
  };

  const setMenu = (el, x, y) => {
    el.top = y + "px";
    el.left = x + "px";
    el.visibility = "visible";
    el.opacity = "1";
  };

  /**
   * handleCrosshairMove
   ************************/
  const handleCrosshairMove = ({ detail: param }) => {
    displayToolTipChart(param);
    displayOhlcBande(param);
    rigthClickMenu(param);
  };

  /**
   * getPositionMarker
   ************************/
  const getPositionMarker = (datas) => {
    datas.forEach((element, index) => {
      // récupère les clés du tableau (ID order)
      let order_id = Object.keys(element);

      if (typeof datas[index][order_id] !== "undefined") {
        if ($assetpair.wsname === datas[index][order_id].descr.pair) {
          let color =
            datas[index][order_id].descr.type === "sell"
              ? "#ff9d9d"
              : "#aeff9d";
          let shape =
            datas[index][order_id].descr.type === "sell"
              ? "arrowDown"
              : "arrowUp";
          let position =
            datas[index][order_id].descr.type === "sell"
              ? "aboveBar"
              : "belowBar";
          markers = [];
          markers.push({
            time: parseInt(datas[index][order_id].opentm),
            position: position,
            color: color,
            shape: "circle",
            text:
              datas[index][order_id].descr.type +
              " " +
              datas[index][order_id].descr.pair +
              "\n" +
              datas[index][order_id].descr.ordertype +
              "@" +
              datas[index][order_id].descr.price,
            size: 1,
          });
        }
      }
    });
  };

  /**
   * handleCrosshairMode
   ************************/
  const handleCrosshairMode = (event) => {
    if (typeof chartApi !== "undefined") {
      chartApi.applyOptions({
        crosshair: {
          mode: crosshairMode ? CrosshairMode.Magnet : CrosshairMode.Normal,
        },
      });
    }
  };

  const optionsChart = {
    // width: document.body.offsetWidth - 220,
    height: 300,
    layout: {
      backgroundColor: "#212121",
      textColor: "#fcfcfc",
    },
    grid: {
      vertLines: {
        color: "rgba(19, 203, 206, 0.3)",
      },
      horzLines: {
        color: "rgba(19, 203, 206, 0.3)",
      },
    },
    crosshair: {
      mode: crosshairMode ? CrosshairMode.Magnet : CrosshairMode.Normal,
      vertLine: {
        labelVisible: true,
        labelBackgroundColor: "rgba(51, 51, 51, 0.2)",
      },
    },
    rightPriceScale: {
      borderColor: "rgba(197, 203, 206, 0.8)",
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: true,
      borderColor: "rgba(197, 203, 206, 0.8)",
    },
    watermark: {
      color: "rgba(100, 100, 100, 0.1)",
      visible: true,
      fontSize: 150,
      text: $assetpair.wsname,
    },
    localization: {
      locale: navigator.language,
      dateFormat: getLocaleDateString(),
    },
  };

  let CandlestickSeriesOpts = {
    upColor: "#6ddc09",
    downColor: "#fe1014",
    borderDownColor: "#fe1014",
    borderUpColor: "#6ddc09",
    wickDownColor: "#fe1014",
    wickUpColor: "#6ddc09",
    priceFormat: {
      precision: $assetpair.pair_decimals,
      minMove: 0.00000001,
    },
  };

  $: {
    if (
      typeof $openorders !== "undefined" &&
      Object.keys($openorders).length > 1
    ) {
      if ($openorders.service === "OpenOrders" && $openorders.data) {
        getPositionMarker($openorders.data);

        if (typeof series !== "undefined") {
          if (activePosition) series.setMarkers(markers);
          else series.setMarkers([]);
        }
      }
    }

    if (typeof $ohlc !== "undefined" && Object.keys($ohlc).length > 1) {
      if ($ohlc.service === "Ohlc" && $ohlc.data) {
        if (ohlcLastItemhistory !== null) {
          formatCandelTick($ohlc.data);
        }
      }
    }

    // Auto resizing chart
    window.addEventListener("resize", () => {
      if (!isMounted) return false;
      let chartblock = document.querySelector(".chart-block");
      let chartHeight = 300; // chartblock.clientHeight
      let chartWidth = chartblock.clientWidth;
      chartApi.resize(chartWidth, chartHeight);
    });

    // if (typeof chartApi !== "undefined") {
    //   console.log(chartApi)
    // }
  }
</script>

{#if typeof $ohlcchart !== "undefined" && $ohlcchart.length > 0 && $ohlcchart}
  <div class="chartctrl-block">
    <input
      type="checkbox"
      name="active-tooltip"
      id="active-tooltip"
      bind:checked={activetooltip}
    />
    <label class="label-checkbox" for="active-tooltip">Tooltip</label>
    <input
      type="checkbox"
      name="active-position"
      id="active-position"
      bind:checked={activePosition}
    />
    <label class="label-checkbox" for="active-position">Positions</label>
    <input
      type="checkbox"
      name="crosshair-mode"
      id="crosshair-mode"
      bind:checked={crosshairMode}
      on:change={handleCrosshairMode}
    />
    <label class="label-checkbox" for="crosshair-mode">Magnet</label>
  </div>
  <div class="chart-block">
    <select
      name="interval"
      id="interval"
      class="interval"
      bind:value={$interval}
      on:change={() => location.reload()}
    >
      <option value="1">1M</option>
      <option value="5">5M</option>
      <option value="15">15M</option>
      <option value="30">30M</option>
      <option value="60">1H</option>
      <option value="240">4H</option>
      <option value="1440">1D</option>
      <option value="10080">1W</option>
      <option value="21600">2W</option>
    </select>
    <Chart
      {...optionsChart}
      on:crosshairMove={handleCrosshairMove}
      ref={(ref) => (chartApi = ref)}
    >
      <CandlestickSeries
        data={$ohlcchart}
        ref={(ref) => (series = ref)}
        {...CandlestickSeriesOpts}
      />
    </Chart>
    <div class="legend">{@html legend}</div>
    <div class="floating-tooltip {type}" />
    <div id="rightclickmenu">
      <a href="/">
        <i class="fa fa-bell">&nbsp;</i> Create alert
        <span id="pricealert">&nbsp;</span>
      </a>
      <a href="/">
        <i class="fa fa-trash">&nbsp;</i> Remove all
      </a>
      <hr />
      <a href="/">
        <i class="fa fa-undo">&nbsp;</i> Undo
        <span>Ctrl + Z</span>
      </a>
      <a href="/">
        <i class="fa fa-redo">&nbsp;</i> Redo
        <span>Ctrl + Y</span>
      </a>
    </div>
  </div>
{/if}

<style>
  #rightclickmenu {
    visibility: hidden;
    z-index: 999;
    opacity: 0;
    position: fixed;
    background: #222222;
    color: #ffffff;
    font-family: sans-serif;
    font-size: 0.7em;
    -webkit-transition: opacity 0.5s ease-in-out;
    -moz-transition: opacity 0.5s ease-in-out;
    -ms-transition: opacity 0.5s ease-in-out;
    -o-transition: opacity 0.5s ease-in-out;
    transition: opacity 0.5s ease-in-out;
    padding: 0px;
    border: 2px solid #383838;
  }

  #rightclickmenu a {
    display: block;
    color: #ffffff;
    text-decoration: none;
    padding: 6px 8px 6px 30px;
    width: 200px;
    position: relative;
  }

  #rightclickmenu a i.fa {
    font-size: 12px;
    position: absolute;
    left: 9px;
    top: 7px;
  }

  #rightclickmenu a span {
    color: #bcb1b3;
    float: right;
  }

  #rightclickmenu a:hover {
    color: #fff;
    background: #3879d9;
  }

  #rightclickmenu hr {
    border: 1px solid #2a2a2a;
    border-bottom: 0;
  }
  .chartctrl-block {
    position: relative;
    background-color: #212121;
    border: 1px solid #181818;
    padding: 10px;
  }
  input[type="checkbox"] {
    width: 12px;
    height: 12px;
    top: -5px;
    left: -3px;
    outline: none;
    cursor: pointer;
    margin-right: 5px;
  }
  input[type="checkbox"]:after {
    width: 12px;
    height: 12px;
    top: -1px;
    left: -1px;
    background-color: #343434;
    content: "";
    display: inline-block;
    visibility: visible;
    border: 1px solid #333;
  }
  input[type="checkbox"]:checked:after {
    width: 12px;
    height: 12px;
    top: -1px;
    left: -1px;
    background-color: #1c1c1c;
    content: "";
    display: inline-block;
    visibility: visible;
    border: 1px solid #333;
  }
  label.label-checkbox {
    font-size: 0.9em;
    color: #747474;
    margin-right: 10px;
    text-align: center;
    vertical-align: middle;
    cursor: pointer;
  }
  .floating-tooltip {
    position: absolute;
    display: none;
    box-sizing: border-box;
    font-size: 0.7em;
    text-align: left;
    z-index: 2;
    top: 0px;
    left: 0;
    pointer-events: none;
  }
  .floating-tooltip:before {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 37px;
    z-index: 1;
    border: solid 5px transparent;
    border-top-color: #6c6c6c;
  }
  .floating-tooltip.red:before {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 37px;
    z-index: 1;
    border: solid 5px transparent;
    border-top-color: #aa0000;
  }
  .floating-tooltip.green:before {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 37px;
    z-index: 1;
    border: solid 5px transparent;
    border-top-color: rgb(67, 150, 0);
  }
  .floating-tooltip :global(div.green .title) {
    color: #333333;
    background-color: rgb(67, 150, 0);
    padding: 3px;
  }
  .floating-tooltip :global(div.red .title) {
    color: #eeeeee;
    background-color: #aa0000;
    padding: 3px;
  }

  .floating-tooltip :global(div.green) {
    color: #333333;
    background-color: #50b300;
    border: 1px solid #50b300;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
  }
  .floating-tooltip :global(div.red) {
    color: #eeeeee;
    background-color: #b30000;
    border: 1px solid #b30000;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
  }
  .chart-block {
    /* display: flex;
    flex-wrap: wrap; */
    position: relative;
    background-color: #212121;
    border: 1px solid #181818;
    padding: 10px;
  }
  .chart-block .interval {
    outline: none;
    border: 1px solid #323232;
    background-color: #1c1c1c;
    color: #cdcdcd;
  }
  .chart-block .legend {
    position: absolute;
    color: #e5e5e5;
    left: 75px;
    top: 13px;
    z-index: 1;
    font-size: 12px;
    font-weight: bold;
    line-height: 18px;
    font-weight: 300;
  }
  :global(.ohlc) {
    margin-left: 10px;
    color: #8f8f8f;
  }
  :global(.open) {
    color: cyan;
  }
  :global(.high) {
    color: seagreen;
  }
  :global(.low) {
    color: #f77979;
  }
  :global(.close) {
    color: peru;
  }
  :global(.red) {
    color: #b30000;
  }
  :global(.green) {
    color: #50b300;
  }
  :global(.tv-lightweight-charts) {
    border: 1px dotted #222222;
    width: auto !important;
  }
  :global(.tv-lightweight-charts table) {
    width: auto !important;
  }
</style>

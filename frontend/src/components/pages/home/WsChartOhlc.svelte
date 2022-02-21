<script>
  import { _ } from "svelte-i18n";
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { ohlc, ticker, openorders } from "store/wsstore.js";
  import getLocaleDateString from "utils/getLocaleDateString.js";
  import { toast } from "@zerodevx/svelte-toast";
  import { openModal, closeModal } from "svelte-modals";
  import ConfirmModal from "components/modal/ConfirmModal.svelte";

  import { CrosshairMode, PriceScaleMode } from "lightweight-charts";
  import Chart from "svelte-lightweight-charts/components/chart.svelte";
  import CandlestickSeries from "svelte-lightweight-charts/components/candlestick-series.svelte";
  import HistogramSeries from "svelte-lightweight-charts/components/histogram-series.svelte";
  import Fetch from "utils/Runfetch.js";
  import UserData from "classes/UserData.js";

  const dispatch = createEventDispatcher();

  import {
    online,
    interval,
    pair,
    assetpair,
    ohlcchart,
    volumechart,
    pricealertlist,
  } from "store/store.js";

  let type,
    series,
    volSeries,
    chartApi,
    activetooltip = false,
    activeOrders = false,
    activePositions = false,
    crosshairMode = false,
    rightPriceScaleMode = false,
    volumeDisplaying = false,
    markers_orders = [],
    markers_positions = [],
    newCandel = false,
    ohlcLastItemhistory = null,
    lastCandelStartTime = null,
    lastCandelEndTime = null,
    timeZoneOffset = new Date().getTimezoneOffset() / -60,
    intval = $interval * 60,
    isMounted = false,
    pricealert = "0.00",
    hasAlertForPair,
    open,
    high,
    low,
    close,
    volume,
    legend = "KRAKEN " + $assetpair.wsname + " " + $interval + "M",
    backUrl = __env["BACKEND_URI"],
    fetchUrl = backUrl + "/api/ohlc/" + $pair + "/" + $interval,
    error = false,
    openpositions = false;

  const ud = new UserData();

  const GetOpenPositions = async () => {
    try {
      if (!$online) {
        error = true;
        return false;
      }

      const res = await ud.getOpenPositions();
      if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
        error = res.error;
      } else {
        openpositions = res;
        error = false;
      }
    } catch (error) {
      console.error("[ERROR]:", error);
    }
  };

  /**
   * formatVolumeSeries
   ************************/
  const formatVolumeSeries = () => {
    // volumechart
    if ($ohlcchart) {
      let volume_tmp = [];
      Object.values($ohlcchart).map((item) => {
        let color =
          item.close <= item.open
            ? "rgba(223, 0, 18, 0.8)"
            : "rgba(91, 146, 8, 0.8)";
        // Création d'un objet temporaire
        let v = new Object();
        v = { time: item.time, value: item.volume, color };
        volume_tmp.push(v);
      });

      if (volume_tmp.length > 1) volumechart.set(volume_tmp);
    }
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
        formatVolumeSeries();
        dispatch("loading", { loading: true });
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
      console.error("[ERROR]:", error);
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
    setTimeout(() => {
      GetOpenPositions();
    }, 502);
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
    let opentooltip, closetooltip, hightooltip, lowtooltip, volumetooltip;

    const seriesPriceValues = param.seriesPrices.values();

    for (const value of seriesPriceValues) {
      if (typeof value === "object") {
        opentooltip = value["open"];
        hightooltip = value["high"];
        lowtooltip = value["low"];
        closetooltip = value["close"];
      }

      if (typeof value === "string") {
        volumetooltip = value;
      }
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
        "<br /><strong>Volume:</strong> " +
        volumetooltip +
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

      const seriesPriceValues = param.seriesPrices.values();

      for (const value of seriesPriceValues) {
        if (typeof value === "object") {
          open = value["open"];
          high = value["high"];
          low = value["low"];
          close = value["close"];
          type = open <= close ? "green" : "red";
        }

        if (typeof value === "string") {
          volume = value;
        }
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
        ' <span class="' +
        type +
        '">VOL</span>: ' +
        volume +
        "</span>";
    } else {
      legend = "KRAKEN " + $assetpair.wsname + " " + $interval + "M  ";
    }
  };

  /**
   * rigthClickMenu
   ************************/
  const rigthClickMenu = (param) => {
    let chartblock = document.querySelector(".chart-block");
    let rightclickmenu = document.getElementById("rightclickmenu").style;

    if (typeof param.point !== "undefined") {
      let price = series.coordinateToPrice(param.point.y);
      pricealert = price.toFixed($assetpair.pair_decimals);
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

  /**
   * setMenu
   ************************/
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
   * getOrderMarker
   ************************/
  const getOrderMarker = (datas) => {
    datas.forEach((element, index) => {
      // récupère les clés du tableau (ID order)
      let order_id = Object.keys(element);

      if (
        typeof datas[index][order_id] !== "undefined" &&
        datas[index][order_id].hasOwnProperty("descr")
      ) {
        if ($assetpair.wsname === datas[index][order_id].descr.pair) {
          let color =
            datas[index][order_id].descr.type === "sell"
              ? "#ff9d9d"
              : "#aeff9d";
          let position =
            datas[index][order_id].descr.type === "sell"
              ? "aboveBar"
              : "belowBar";
          markers_orders = [];
          markers_orders.push({
            time: parseInt(datas[index][order_id].opentm),
            position: position,
            color: color,
            shape: "square",
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

    // Définit la couleur du label en rouge si aucune positions pour cette pair
    let label = document.getElementById("label-active-orders");
    if (markers_orders.length === 0) {
      label.style.color = "#cd0000";
      label.style["text-decoration"] = "line-through";
    } else label.style.color = "#747474";
  };

  /**
   * getPositionsMarker
   ************************/
  const getPositionsMarker = (datas) => {
    markers_positions = [];
    Object.values(datas).map((val) => {
      if ($assetpair.altname === val.pair) {
        if (markers_positions.hasOwnProperty(val.ordertxid)) {
          let val_exist = markers_positions[val.ordertxid];
          val_exist.time = val.time;
          val_exist.rollovertm = val.rollovertm;
          val_exist.cost = parseFloat(val_exist.cost) + parseFloat(val.cost);
          val_exist.fee = parseFloat(val_exist.fee) + parseFloat(val.fee);
          val_exist.vol = parseFloat(val_exist.vol) + parseFloat(val.vol);
          val_exist.vol_closed =
            parseFloat(val_exist.vol_closed) + parseFloat(val.vol_closed);
          val_exist.margin =
            parseFloat(val_exist.margin) + parseFloat(val.margin);
          val_exist.value = parseFloat(val_exist.value) + parseFloat(val.value);
          val_exist.net = parseFloat(val_exist.net) + parseFloat(val.net);
          val_exist.net = parseFloat(val_exist.net) + parseFloat(val.net);
        } else {
          markers_positions[val.ordertxid] = val;
        }
      }
    });

    const marker_pos_values = Object.values(markers_positions);
    marker_pos_values.forEach((pos) => {
      if ($assetpair.altname === pos.pair) {
        let color = pos.type === "sell" ? "#ff9d9d" : "#aeff9d";
        let shape = pos.type === "sell" ? "arrowDown" : "arrowUp";
        let position = pos.type === "sell" ? "aboveBar" : "belowBar";
        markers_positions = [];
        markers_positions.push({
          time: parseInt(pos.time),
          position: position,
          color: color,
          shape: shape,
          text:
            pos.type +
            " " +
            pos.pair +
            "\n" +
            pos.ordertype +
            "@" +
            parseFloat(pos.net).toFixed($assetpair.lot_decimals),
          size: 1,
        });
      }
    });

    // Définit la couleur du label en rouge si aucune positions pour cette pair
    let label = document.getElementById("label-active-positions");
    if (markers_positions.length === 0) {
      label.style.color = "#cd0000";
      label.style["text-decoration"] = "line-through";
    } else label.style.color = "#747474";
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

  /**
   * handleRightPriceScaleMode
   ************************/
  const handleRightPriceScaleMode = (event) => {
    if (typeof chartApi !== "undefined") {
      chartApi.applyOptions({
        rightPriceScale: {
          mode: rightPriceScaleMode
            ? PriceScaleMode.Logarithmic
            : PriceScaleMode.Normal,
        },
      });
    }
  };

  /**
   * createAlertPrice
   ************************/
  const createAlertPrice = (price, pair) => {
    let currentPrice = false;
    ticker.subscribe((tick) => {
      if (typeof tick !== "undefined" && Object.keys(tick).length > 1) {
        if (tick.service === "Ticker" && tick.data) {
          currentPrice = tick.data["a"][0];
        }
      }
    });

    let pushway = parseFloat(currentPrice) > parseFloat(price) ? "down" : "up";
    if (price >= 0) {
      if (!$pricealertlist.hasOwnProperty(pair)) {
        $pricealertlist[pair] = { up: [], down: [] };
        $pricealertlist[pair][pushway] = [price];
      } else {
        $pricealertlist[pair][pushway] = [
          ...$pricealertlist[pair][pushway],
          price,
        ];
      }
      toast.push(
        `${$_("home.chart.alert.succcess")} <strong>${pair}@${price}</strong>`,
        {
          target: "new",
          theme: {
            "--toastBackground": "#48BB78",
            "--toastBarBackground": "#2F855A",
          },
        }
      );
    } else {
      toast.push($_("home.chart.alert.error"), {
        target: "new",
        theme: {
          "--toastBackground": "#F56565",
          "--toastBarBackground": "#C53030",
        },
      });
    }
  };

  /**
   * removeAllAlertPrice
   ************************/
  const removeAllAlertPrice = (pair) => {
    openModal(ConfirmModal, {
      title: `[${pair}] ${$_("home.chart.alert.menuDel")}`,
      message: `${$_("home.chart.alert.menuConfirmDel")} : ${pair}`,
      confirm: () => {
        $pricealertlist[pair] = { up: [], down: [] };
        closeModal();
      },
      cancel: () => {
        closeModal();
      },
    });
  };

  const optionsChart = {
    height: 350,
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
      mode: rightPriceScaleMode
        ? PriceScaleMode.Logarithmic
        : PriceScaleMode.Normal,
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

  let HistogramSeriesOpts = {
    priceFormat: {
      type: "volume",
    },
    color: "#26a69a",
    priceScaleId: "",
    scaleMargins: {
      top: 0.9,
      bottom: 0,
    },
  };

  $: {
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
      if (typeof chartblock !== ("undefined" || null)) {
        let chartHeight = 300; // chartblock.clientHeight
        let chartWidth = chartblock.clientWidth;
        chartApi.resize(chartWidth, chartHeight);
      }
    });

    if ($pricealertlist.hasOwnProperty($assetpair.wsname)) {
      hasAlertForPair =
        $pricealertlist[$assetpair.wsname]["up"].length >= 1
          ? true
          : $pricealertlist[$assetpair.wsname]["down"].length
          ? true
          : false;
    }
  }

  $: {
    if (
      activePositions ||
      (activeOrders &&
        $openorders &&
        typeof $openorders !== "undefined" &&
        Object.keys($openorders).length >= 1)
    ) {
      if (
        $openorders &&
        $openorders.hasOwnProperty("service") &&
        $openorders.service === "OpenOrders" &&
        $openorders.data
      ) {
        if (activeOrders) getOrderMarker($openorders.data);
        else markers_orders = [];
      }

      if (activePositions) getPositionsMarker(openpositions);
      else markers_positions = [];

      let markers = [...markers_orders, ...markers_positions];
      if (typeof series !== "undefined" && isMounted)
        series.setMarkers(markers);
    } else {
      if (typeof series !== "undefined" && isMounted) series.setMarkers([]);
    }
  }
</script>

{#if $ohlcchart}
  <div class="chartctrl-block">
    <input
      type="checkbox"
      name="active-tooltip"
      id="active-tooltip"
      bind:checked={activetooltip}
    />
    <label class="label-checkbox" for="active-tooltip"
      >{$_("home.chart.checkbox.tooltip")}</label
    >
    <input
      type="checkbox"
      name="active-positions"
      id="active-positions"
      bind:checked={activePositions}
    />
    <label
      class="label-checkbox"
      for="active-positions"
      id="label-active-positions">{$_("home.chart.checkbox.position")}</label
    >
    <input
      type="checkbox"
      name="active-orders"
      id="active-orders"
      bind:checked={activeOrders}
    />
    <label class="label-checkbox" for="active-orders" id="label-active-orders"
      >{$_("home.chart.checkbox.orders")}</label
    >
    <input
      type="checkbox"
      name="crosshair-mode"
      id="crosshair-mode"
      bind:checked={crosshairMode}
      on:change={handleCrosshairMode}
    />
    <label class="label-checkbox" for="crosshair-mode"
      >{$_("home.chart.checkbox.magnet")}</label
    >
    <input
      type="checkbox"
      name="pricescale-mode"
      id="pricescale-mode"
      bind:checked={rightPriceScaleMode}
      on:change={handleRightPriceScaleMode}
    />
    <label class="label-checkbox" for="pricescale-mode"
      >{$_("home.chart.checkbox.loga")}</label
    >
    <input
      type="checkbox"
      name="volume-chart"
      id="volume-chart"
      bind:checked={volumeDisplaying}
      on:change={(n) => !volumeDisplaying}
    />
    <label class="label-checkbox" for="volume-chart"
      >{$_("home.chart.checkbox.volume")}</label
    >
  </div>
  <div class="chart-block">
    <select
      name="interval"
      id="interval"
      class="interval"
      bind:value={$interval}
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
      {#if volumeDisplaying}
        <HistogramSeries data={$volumechart} {...HistogramSeriesOpts} />
      {/if}
    </Chart>
    <div class="legend">{@html legend}</div>
    <div class="floating-tooltip {type}" />
    <div id="rightclickmenu">
      <a href="/" on:click={createAlertPrice(pricealert, $assetpair.wsname)}>
        <i class="fa fa-bell">&nbsp;</i>
        {$_("home.chart.alert.createAlert")}
        <span id="pricealert">@{pricealert}</span>
      </a>
      {#if hasAlertForPair}
        <a href="/" on:click={removeAllAlertPrice($assetpair.wsname)}>
          <i class="fa fa-trash">&nbsp;</i>
          {$_("home.chart.alert.delAlerts")}
        </a>
      {/if}
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

  #rightclickmenu :global(hr) {
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

<script>
  // ---------------------------------------------------------
  //  Imports
  // ---------------------------------------------------------
  import { _ } from "svelte-i18n";
  import { fade } from "svelte/transition";
  import { mounted } from "store/mounted.js";
  import { onMount, onDestroy, createEventDispatcher, tick } from "svelte";
  import { WSOhlc, WSTicker, WSOpenOrders } from "store/wsStore.js";
  import getLocaleDateString from "utils/getLocaleDateString.js";
  import RightClickMenu from "components/pages/home/RightClickMenu.svelte";
  import TradingOrderChart from "components/pages/trading/TradingOrderChart.svelte";
  import PriceAlerts from "components/api/PriceAlerts.svelte";
  import { Jumper } from "svelte-loading-spinners";
  import { CrosshairMode, PriceScaleMode } from "lightweight-charts";
  import Chart from "svelte-lightweight-charts/components/chart.svelte";
  import CandlestickSeries from "svelte-lightweight-charts/components/candlestick-series.svelte";
  import HistogramSeries from "svelte-lightweight-charts/components/histogram-series.svelte";
  import Tooltip, { Wrapper as WrapperTooltip } from "@smui/tooltip";
  import Wrapper from "@smui/touch-target";
  import IconButton from "@smui/icon-button";
  import FormField from "@smui/form-field";
  import Switch from "@smui/switch";
  import {
    mdiPlusCircle,
    mdiCog,
    mdiBell,
    mdiChartTimelineVariant,
  } from "@mdi/js";
  import { Svg } from "@smui/common/elements";
  import { Icon } from "@smui/common";
  import MenuSurface from "@smui/menu-surface";
  import List, { Group, Subheader, Item, Separator, Text } from "@smui/list";
  import Fetch from "utils/Runfetch.js";
  import UserData from "classes/UserData.js";
  import SnackBar from "components/SnackBar.svelte";

  import {
    online,
    interval,
    pair,
    assetpair,
    ohlcchart,
    volumechart,
    candleTimeout,
    setResizeChart,
  } from "store/store.js";

  // ---------------------------------------------------------
  //  Props
  // ---------------------------------------------------------
  const dispatch = createEventDispatcher();

  export let User;
  let callRCM, callTOC;

  let snackBarText = "",
    snackBarShow = false;

  let type,
    candleSeries,
    volumeSeries,
    chartApi,
    activetooltip = false,
    activeOrders = false,
    activePositions = false,
    disbledPositions = false,
    disbledOrders = false,
    displayChartSettingMenu = false,
    displayAlertMenu = false,
    crosshairMode = false,
    rightPriceScaleMode = false,
    volumeDisplaying = true,
    markers_orders = [],
    markers_positions = [],
    price_line_positions = [],
    price_line_positions_display = [],
    ohlcLastItemhistory = null,
    lastCandle = null,
    timeZoneOffset = new Date().getTimezoneOffset() / -60,
    base = $assetpair.wsname.split("/")[0],
    quote = $assetpair.wsname.split("/")[1],
    intvalSeconde = $interval * 60,
    isMounted = false,
    open,
    high,
    low,
    close,
    volume,
    legend = `KRAKEN ${$assetpair.wsname} ${$interval}M`,
    fetchUrl = "/api/ohlc",
    chartHeight = 488,
    chartWidth = 600,
    error = false,
    openpositions = false,
    currentPriceWay,
    currentPriceOld = 0,
    currentPrice = Number(0.0).toFixed($assetpair.pair_decimals),
    timeRemaining,
    current_second,
    current_minute,
    current_hour,
    current_day,
    modulo,
    day,
    nbTrades = 0,
    nbTradesToday = 0,
    candleCount = -1,
    clearTimer = null,
    candleFirst = true,
    markers = [],
    highLowMarkers = [],
    changeInterval = false,
    chartConfigInterval = {
      "1": { offset: 10, spacing: 5 },
      "5": { offset: 10, spacing: 9 },
      "15": { offset: 10, spacing: 12 },
      "30": { offset: 8, spacing: 14 },
      "60": { offset: 5, spacing: 16 },
      "240": { offset: 6, spacing: 16 },
      "1440": { offset: 4, spacing: 16 },
      "10080": { offset: 4, spacing: 16 },
    },
    chartblock = null,
    toolTip = null,
    domLoaded = false;

  const ud = new UserData();

  const optionsChart = {
    height: chartHeight,
    layout: {
      backgroundColor: "#212121",
      textColor: "#fcfcfc",
      fontFamily: "'iosevka-etoile', monospace",
    },
    grid: {
      vertLines: {
        color: "rgba(19, 203, 206, 0.3)", // #5b5b5b
        style: 4,
      },
      horzLines: {
        color: "rgba(19, 203, 206, 0.3)", // #5b5b5b
        style: 4,
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
      color: "#00ff00",
      borderColor: "rgba(197, 203, 206, 0.8)",
      mode: rightPriceScaleMode
        ? PriceScaleMode.Logarithmic
        : PriceScaleMode.Normal,
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: true,
      borderColor: "rgba(197, 203, 206, 0.8)",
      rightOffset: chartConfigInterval[$interval].offset,
      barSpacing: chartConfigInterval[$interval].spacing,
      fixLeftEdge: true,
      lockVisibleTimeRangeOnResize: true,
      rightBarStaysOnScroll: true,
      // tickMarkFormatter: function (timePoint, tickMarkType, locale) {
      //   console.log(timePoint, tickMarkType, locale);
      // },
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

  const CandlestickSeriesOpts = {
    upColor: "#6ddc09",
    downColor: "#fe1014",
    borderDownColor: "#fe1014",
    borderUpColor: "#6ddc09",
    wickDownColor: "#fe1014",
    wickUpColor: "#6ddc09",
    priceFormat: {
      type: "price",
      precision: $assetpair.pair_decimals,
      minMove: Number("0." + String(1).padStart($assetpair.pair_decimals, "0")),
    },
  };

  const HistogramSeriesOpts = {
    color: "#26a69a",
    priceFormat: {
      type: "volume",
    },
    priceLineVisible: true,
    priceScaleId: "",
    scaleMargins: {
      top: 0.95,
      bottom: 0,
    },
  };

  // ---------------------------------------------------------
  //  Methods Declarations
  // ---------------------------------------------------------
  const bootstrap = async (readyState) => {
    if (["interactive", "complete"].includes(readyState)) {
      await tick();
      chartblock = document.querySelector(".chart-block");
      toolTip = document.querySelector(".floating-tooltip");
      domLoaded = true;
    }
  };

  const cmtt = (milliseconde) => {
    return new Date(milliseconde).toLocaleTimeString(navigator.language, {
      timeZone: "UTC",
    });
  };

  /**
   * GetOpenPositions
   ************************/
  const GetOpenPositions = async () => {
    try {
      if (!$online) {
        error = true;
        return false;
      }

      const res = await ud.getOpenPositions();

      if (
        typeof res !== "undefined" &&
        Object.prototype.hasOwnProperty.call(res, "error")
      ) {
        snackBarShow = true;
        snackBarText = `<strong>[KRAKEN API]</strong> ${res.endpoint}: ${res.message}`;

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
   * formatVolumeSeriesUpdate
   ************************/
  const formatVolumeSeriesUpdate = (candle) => {
    let color =
      candle.close <= candle.open
        ? "rgba(223, 0, 18, 0.8)"
        : "rgba(91, 146, 8, 0.8)";
    let v = new Object();
    v = { time: candle.time, value: candle.volume, color };
    $volumechart = [...$volumechart, v];
    if (volumeSeries) volumeSeries.update(v);
  };

  /**
   * formatVolumeSeries
   ************************/
  const formatVolumeSeries = () => {
    // volumechart
    if ($ohlcchart) {
      // Création d'un objet temporaire
      let v = new Object();
      let volume_tmp = [];
      Object.values($ohlcchart).map((item) => {
        let color =
          item.close <= item.open
            ? "rgba(223, 0, 18, 0.8)"
            : "rgba(91, 146, 8, 0.8)";
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
      let url = [fetchUrl, $pair, $interval].join("/");
      let res = await Fetch({ url, endpoint: "ohlc" });

      if (Object.prototype.hasOwnProperty.call(res, "error")) {
        console.error(`${res.message} ${res.error} (${res.statusCode})`);
      } else {
        Object.keys(res).map(
          (key) => (res[key].time = res[key].time)
          // A VOIR heure local au lieu d'heure utc
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
          nbTrades = ohlcLastItemhistory.trades;
          setTimerInterval();
        }
        return res;
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

    // Calculer remaining time pour chaque intervals
    switch ($interval) {
      case "1": // 1M
        current_second = date.getUTCSeconds();
        timeRemaining = (intvalSeconde - current_second) * 1000;
        break;

      case "5": // 5M
      case "15": // 15M
      case "30": // 30M
      case "60": // 60M
        modulo = date.getUTCMinutes() % $interval;
        current_second = 60 - date.getUTCSeconds();
        current_minute = ($interval - modulo) * 60 - 60;
        timeRemaining = (current_minute + current_second) * 1000;
        break;

      case "240": // 4H
        let int4h = [0, 4, 8, 12, 16, 20];
        let hours = date.getUTCHours();
        const t = int4h.filter((v) => v <= hours);
        modulo = t.pop() + 4 - 1 - (hours % $interval);
        current_second = 60 - date.getUTCSeconds();
        current_minute = (60 - (date.getUTCMinutes() % 60)) * 60 - 60;
        current_hour = modulo * 60 * 60;
        timeRemaining = (current_hour + current_minute + current_second) * 1000;
        break;

      case "1440": // 1D
        modulo = date.getUTCHours() % $interval;
        current_second = date.getUTCSeconds();
        current_minute = (date.getUTCMinutes() % $interval) * 60;
        current_hour = modulo * 60 * 60;
        timeRemaining = current_hour + current_minute + current_second;
        timeRemaining = (intvalSeconde - timeRemaining) * 1000;
        break;

      case "10080": // 1W
        day = date.getDay() === 0 ? 7 : date.getDay() - 1;
        modulo = day * 1440;
        current_second = date.getUTCSeconds();
        current_minute = (date.getUTCMinutes() % 1440) * 60;
        current_hour = date.getUTCHours() * 60 * 60;
        current_day = day * (1440 * 60);
        timeRemaining =
          current_day + current_hour + current_minute + current_second;
        timeRemaining = (intvalSeconde - timeRemaining) * 1000;
        break;
    }

    clearTimer = setTimeout(() => {
      if (!candleCount) updateNoActivity();
      $candleTimeout = true;
      candleCount = 0;
    }, timeRemaining);
  };

  /**
   * updateNoActivity
   ************************/
  const updateNoActivity = () => {
    if (!lastCandle.endtime) return false;
    let candle = {
      time: lastCandle.endtime,
      endtime: lastCandle.endtime + intvalSeconde,
      open: lastCandle.close,
      close: lastCandle.close,
      high: lastCandle.close,
      low: lastCandle.close,
      vwap: 0,
      volume: 0,
      trades: 0,
    };

    try {
      if (candle && candleSeries) {
        if (candle.time >= lastCandle.time) {
          candleSeries.update(candle);
          formatVolumeSeriesUpdate(candle);
          lastCandle = candle;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * formatCandleTick
   ************************/
  const formatCandleTick = (tick) => {
    try {
      let candle = ohlcFormat(tick);
      nbTrades = candle.trades;

      if (chartApi && !candleFirst && candleCount != -1) {
        candleCount++;
        if (candle.time >= lastCandle.time) {
          $ohlcchart = [...$ohlcchart, candle];
          chartApi.timeScale().scrollToRealTime();
          candleSeries.update(candle);
          formatVolumeSeriesUpdate(candle);
          calculateHighLowPrice();
        }
      } else {
        candleFirst = false;
        candleCount = 0;
      }

      lastCandle = $ohlcchart[$ohlcchart.length - 1];
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * ohlcFormat
   ************************/
  const ohlcFormat = (datas) => {
    const dataLength = datas.length;

    if (dataLength > 1) {
      let ohlc_tmp = JSON.parse("{}");
      ohlc_tmp["time"] = parseInt(parseFloat(datas[1])) - intvalSeconde;
      ohlc_tmp["endtime"] = parseInt(parseFloat(datas[1]));
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
    if (!chartblock || !toolTip) console.error("ERROR: chartblock || toolTip");
    else {
      let toolTipWidth = 80,
        toolTipHeight = 80,
        toolTipMargin = 15,
        opentooltip,
        closetooltip,
        hightooltip,
        lowtooltip,
        volumetooltip;

      const seriesPriceValues = param.seriesPrices.values();

      for (const value of seriesPriceValues) {
        if (typeof value === "object") {
          opentooltip = value["open"];
          hightooltip = value["high"];
          lowtooltip = value["low"];
          closetooltip = value["close"];
        }

        if (typeof value === "string") {
          volumetooltip = parseFloat(value).toFixed(2);
        }
      }

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
        let price = param.seriesPrices.get(candleSeries);
        type = price.open <= price.close ? "green" : "red";
        let timelaps =
          $interval >= 10080
            ? $interval / 60 / 24 + "J"
            : $interval >= 60
            ? $interval / 60 + "H"
            : $interval + "M";

        let vol = "";
        if (volumetooltip)
          vol = `<br /><strong>Volume:</strong> ${volumetooltip}`;

        toolTip.innerHTML = `<div class="${type}">
        <div class="title">
          <strong>${$assetpair.wsname} ${timelaps}</strong>
        </div>
        <div style="padding:3px;">
          <strong>Open:</strong> ${opentooltip} <br />
          <strong>High:</strong> ${hightooltip}<br />
          <strong>Low:</strong> ${lowtooltip}<br />
          <strong>Close:</strong> ${closetooltip}
          ${vol}
        </div>
      </div>`;

        let priceCoordinate = type === "green" ? price.open : price.close;
        let coordinate = candleSeries.priceToCoordinate(priceCoordinate);
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
          volume = parseFloat(value).toFixed(2);
        }
      }

      let vol = "";
      if (typeof volume !== "undefined")
        vol = `<span class="${type}">VOL</span>: ${volume}`;

      legend = `KRAKEN ${$assetpair.wsname} ${$interval}M
      <span class="ohlc">
        <span class="${type}">OPEN</span>: ${open}
        <span class="${type}">HIGH</span>: ${high}
        <span class="${type}">LOW</span>: ${low}
        <span class="${type}">CLOSE</span>: ${close}
        ${vol}
      </span>`;
    } else {
      legend = `KRAKEN ${$assetpair.wsname} ${$interval}M`;
    }
  };

  /**
   * handleCrosshairMove
   ************************/
  const handleCrosshairMove = ({ detail: param }) => {
    displayToolTipChart(param);
    displayOhlcBande(param);
    callRCM.rigthClickMenu(param, candleSeries);
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
        Object.prototype.hasOwnProperty.call(datas[index][order_id], "descr")
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
            price: datas[index][order_id].descr.price,
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
    if (markers_orders.length === 0) disbledOrders = true;
  };

  /**
   * getPositionsMarker
   ************************/
  const getPositionsMarker = (datas) => {
    markers_positions = [];
    Object.values(datas).map((val) => {
      if ($assetpair.altname === val.pair) {
        if (
          Object.prototype.hasOwnProperty.call(markers_positions, val.ordertxid)
        ) {
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
        // Ajout des marqueurs positions
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
            parseFloat(pos.net).toFixed(2),
          size: 1,
        });

        // Ajout des PriceLine positions
        if (
          !Object.prototype.hasOwnProperty.call(
            price_line_positions_display,
            pos.postxid
          )
        ) {
          price_line_positions[pos.postxid] = {
            postxid: pos.postxid,
            price: pos.price,
            type: pos.type,
            ordertype: pos.ordertype,
            vol: pos.vol,
            net: pos.net,
          };
        }
      }
    });

    // Définit la couleur du label en rouge si aucune positions pour cette pair
    if (markers_positions.length === 0) disbledPositions = true;
  };

  /**
   * handleCrosshairMode
   ************************/
  const handleCrosshairMode = (event) => {
    if (typeof event === "boolean") crosshairMode = !crosshairMode;
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
    if (typeof event === "boolean") rightPriceScaleMode = !rightPriceScaleMode;
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
   * calculateHighLowPrice
   ************************/
  const calculateHighLowPrice = (newVisibleLogicalRange) => {
    if (newVisibleLogicalRange === null || !$ohlcchart) return false;

    // handle new logical range

    if (candleSeries && chartApi) {
      const barsInfo = candleSeries.barsInLogicalRange(
        chartApi.timeScale().getVisibleLogicalRange()
      );

      // Calculate high / low value
      let high = Math.max.apply(
        Math,
        $ohlcchart.map(function (o) {
          if (o.time >= barsInfo.from && o.time <= barsInfo.to) return o.high;
          else return 0;
        })
      );

      let low = Math.min.apply(
        Math,
        $ohlcchart.map(function (o) {
          if (o.time >= barsInfo.from && o.time <= barsInfo.to) return o.low;
          else return Infinity;
        })
      );

      // Filter in datas
      let highPoint = $ohlcchart.filter(
        (data) =>
          data.high == high &&
          data.time >= barsInfo.from &&
          data.time <= barsInfo.to
      );
      let lowPoint = $ohlcchart.filter(
        (data) =>
          data.low == low &&
          data.time >= barsInfo.from &&
          data.time <= barsInfo.to
      );

      // Set in array
      highLowMarkers = [];
      highLowMarkers.push({
        time: highPoint[0].time,
        position: "aboveBar",
        color: "#FFFFFF",
        text: highPoint[0].high,
        size: 1,
      });

      highLowMarkers.push({
        time: lowPoint[0].time,
        position: "belowBar",
        color: "#FFFFFF",
        text: lowPoint[0].low,
        size: 1,
      });

      // Set markers
      candleSeries.setMarkers([...markers, ...highLowMarkers]);
    }
  };

  /**
   * resizeChart
   ************************/
  const resizeChart = () => {
    if (!isMounted && !domLoaded) return false;
    if (!chartblock) console.error("ERROR: chartblock");
    else {
      chartWidth = chartblock.clientWidth || chartWidth;
      if (chartApi) {
        chartApi.resize(chartWidth, chartHeight);
        $setResizeChart = false;
      }
    }
  };

  /**
   * changeChartInterval
   ************************/
  const changeChartInterval = async () => {
    $ohlcchart = false;
    clearTimeout(clearTimer);
    clearTimer = null;
    await getChartHistoryDatas();
    changeInterval = true;
  };

  /**
   * onMount
   ************************/
  onMount(() => {
    isMounted = true;
    getChartHistoryDatas();
    GetOpenPositions();
    bootstrap(document.readyState);
  });

  /**
   * onDestroy
   ************************/
  onDestroy(() => {
    isMounted = false;
    $ohlcchart = false;
  });

  $: if ($setResizeChart) resizeChart();
  $: if ($interval) intvalSeconde = $interval * 60;

  window.addEventListener("resize", () => {
    resizeChart();
  });

  // Set Marker Orders, Position
  $: {
    if (activePositions || (activeOrders && $WSOpenOrders)) {
      if ($WSOpenOrders) {
        if (activeOrders) {
          getOrderMarker($WSOpenOrders);
          if (markers_orders.length) {
            Object.values(markers_orders).map((pos) => {
              candleSeries.createPriceLine({
                price: pos.price,
                color: pos.color,
                lineWidth: 1,
                axisLabelVisible: true,
                title: pos.text,
              });
            });
          }
        } else markers_orders = [];
      }

      if (activePositions) getPositionsMarker(openpositions);
      else markers_positions = [];

      markers = [...markers_positions, ...highLowMarkers];
      if (candleSeries && isMounted) {
        if (markers) candleSeries.setMarkers(markers);

        if (price_line_positions) {
          Object.values(price_line_positions).map((pos) => {
            if (
              !Object.prototype.hasOwnProperty.call(
                price_line_positions_display,
                pos.postxid
              ) ||
              changeInterval
            ) {
              let priceLine = candleSeries.createPriceLine({
                price: pos.price,
                color: pos.type === "buy" ? "green" : "red",
                lineWidth: 1,
                axisLabelVisible: true,
                title: `[${pos.type.toUpperCase()}|${pos.ordertype.toUpperCase()}] ${parseFloat(
                  pos.vol
                ).toFixed($assetpair.lot_decimals)}${base} P/L:${parseFloat(
                  pos.net
                ).toFixed(2)}${quote} `,
              });
              price_line_positions_display[pos.postxid] = priceLine;
              changeInterval = false;
            }
          });
        }
      }
    } else {
      if (typeof candleSeries !== "undefined" && isMounted)
        calculateHighLowPrice();
    }
  }

  // Mise a jour du prix haut et bas
  $: {
    if (chartApi) {
      chartApi
        .timeScale()
        .subscribeVisibleLogicalRangeChange(calculateHighLowPrice);
    }
  }

  // Mise a jour de l'affichage du prix
  $: if ($WSTicker) {
    currentPrice = $WSTicker["c"][0] || currentPrice;
    nbTradesToday = $WSTicker["t"][0] || 0;
    if (currentPriceOld === 0) currentPriceWay = false;
    else if (parseFloat(currentPrice) > parseFloat(currentPriceOld))
      currentPriceWay = "up";
    else if (parseFloat(currentPrice) < parseFloat(currentPriceOld))
      currentPriceWay = "down";
    else currentPriceWay = false;

    currentPriceOld = currentPrice;
  }

  // Mise à jour des bougie en temps réel
  $: if ($WSOhlc) {
    if (ohlcLastItemhistory !== null) formatCandleTick($WSOhlc);
  }

  $: if ($candleTimeout) {
    $candleTimeout = false;
    clearTimeout(clearTimer);
    clearTimer = setInterval(() => {
      if (!candleCount) updateNoActivity();
      candleCount = 0;
    }, $interval * 60 * 1000);
  }

  // SetInterval pour l'affichage du temps restant
  setInterval(() => {
    timeRemaining =
      timeRemaining === 0 ? $interval * 60 * 1000 - 1000 : timeRemaining - 1000;
  }, 1000);
</script>

<SnackBar showSnackbar={snackBarShow} text={snackBarText} />
{#if $mounted}
  <div class="chartctrl-block clearfix">
    <!-- Chart Settings -->
    <Wrapper>
      <div class="settings-chart-btn">
        <WrapperTooltip>
          <IconButton
            class="material-icons"
            on:click={() =>
              (displayChartSettingMenu = !displayChartSettingMenu)}
            size="button"
          >
            <Icon component={Svg} viewBox="0 0 24 24">
              <path fill="currentColor" d={mdiCog} />
            </Icon>
          </IconButton>
          <Tooltip xPos="start" yPos="below">
            {$_("home.chart.tooltip.settings")}
          </Tooltip>
        </WrapperTooltip>
      </div>
    </Wrapper>

    <!-- Title -->
    <div class="chart-title">
      <span class="chart-exchange">KRAKEN</span>
      <span class="chart-asset">{$assetpair.wsname}</span>
    </div>

    <!-- Add Alert -->
    <Wrapper>
      <div class="addorder-chart-btn">
        <WrapperTooltip>
          <IconButton
            class="material-icons"
            on:click={() => (displayAlertMenu = !displayAlertMenu)}
            size="button"
          >
            <Icon component={Svg} viewBox="0 0 24 24">
              <path fill="currentColor" d={mdiBell} />
            </Icon>
          </IconButton>
          <Tooltip xPos="end">
            {$_("home.chart.tooltip.addalert")}
          </Tooltip>
        </WrapperTooltip>
      </div>
    </Wrapper>

    <!-- Add Order -->
    <Wrapper>
      <div class="addorder-chart-btn">
        <WrapperTooltip>
          <IconButton
            class="material-icons"
            on:click={() => callTOC.openOrderDialogParent()}
            size="button"
          >
            <Icon component={Svg} viewBox="0 0 24 24">
              <path fill="currentColor" d={mdiPlusCircle} />
            </Icon>
          </IconButton>
          <Tooltip xPos="end">
            {$_("home.chart.tooltip.addorder")}
          </Tooltip>
        </WrapperTooltip>
      </div>
    </Wrapper>
    <!-- Display Settings Chart Menu -->
    {#if displayChartSettingMenu}
      <div id="displayChartSettingMenu">
        <MenuSurface static>
          <Group>
            <Subheader
              >{$_("home.chart.tooltip.settings").toUpperCase()}</Subheader
            >
            <Separator />
            <List class="settings-list">
              <Item on:SMUI:action={() => (activetooltip = !activetooltip)}>
                <!-- Tooltip -->
                <Wrapper>
                  <FormField>
                    <Switch bind:checked={activetooltip} />
                    <span slot="label">{$_("home.chart.checkbox.tooltip")}</span
                    >
                  </FormField>
                </Wrapper>
              </Item>
              <Item on:SMUI:action={() => (activePositions = !activePositions)}>
                <!-- Positions -->
                <Wrapper>
                  <FormField>
                    <Switch
                      bind:checked={activePositions}
                      disabled={disbledPositions}
                    />
                    <span slot="label"
                      >{$_("home.chart.checkbox.position")}</span
                    >
                  </FormField>
                </Wrapper>
              </Item>
              <Item on:SMUI:action={() => (activeOrders = !activeOrders)}>
                <!-- Orders -->
                <Wrapper>
                  <FormField>
                    <Switch
                      bind:checked={activeOrders}
                      disabled={disbledOrders}
                    />
                    <span slot="label">{$_("home.chart.checkbox.orders")}</span>
                  </FormField>
                </Wrapper>
              </Item>
              <Item on:SMUI:action={() => handleCrosshairMode(true)}>
                <!-- Magnet -->
                <Wrapper>
                  <FormField>
                    <Switch
                      bind:checked={crosshairMode}
                      on:SMUISwitch:change={handleCrosshairMode}
                    />
                    <span slot="label">{$_("home.chart.checkbox.magnet")}</span>
                  </FormField>
                </Wrapper>
              </Item>
              <Item on:SMUI:action={() => handleRightPriceScaleMode(true)}>
                <!-- Logarythmique -->
                <Wrapper>
                  <FormField>
                    <Switch
                      bind:checked={rightPriceScaleMode}
                      on:SMUISwitch:change={handleRightPriceScaleMode}
                    />
                    <span slot="label">{$_("home.chart.checkbox.loga")}</span>
                  </FormField>
                </Wrapper>
              </Item>
              <Item
                on:SMUI:action={() => (volumeDisplaying = !volumeDisplaying)}
              >
                <!-- Volume -->
                <Wrapper>
                  <FormField>
                    <Switch bind:checked={volumeDisplaying} />
                    <span slot="label">{$_("home.chart.checkbox.volume")}</span>
                  </FormField>
                </Wrapper>
              </Item>
            </List>
          </Group>
        </MenuSurface>
      </div>
    {/if}

    <!-- Display ALert Menu -->
    {#if displayAlertMenu}
      <div id="displayAlertMenu">
        <PriceAlerts />
      </div>
    {/if}

    {#if currentPrice}
      <div class="current-price {currentPriceWay}">
        <span class="icon">
          {#if currentPriceWay}
            <i class="fa-solid fa-arrow-trend-{currentPriceWay}" />
          {:else}
            <i class="fa-solid fa-circle-arrow-right" />
          {/if}
        </span>
        {parseFloat(currentPrice).toFixed($assetpair.pair_decimals)}
        {quote}
      </div>
    {/if}
  </div>
  <div class="chart-block" in:fade>
    <select
      name="interval"
      id="interval"
      class="interval"
      bind:value={$interval}
      on:change={changeChartInterval}
    >
      <option value="1">1M</option>
      <option value="5">5M</option>
      <option value="15">15M</option>
      <option value="30">30M</option>
      <option value="60">1H</option>
      <option value="240">4H</option>
      <option value="1440">1D</option>
      <option value="10080">1W</option>
    </select>
    {#if $ohlcchart}
      <Chart
        {...optionsChart}
        on:crosshairMove={handleCrosshairMove}
        ref={(ref) => (chartApi = ref)}
      >
        <CandlestickSeries
          data={$ohlcchart}
          ref={(ref) => (candleSeries = ref)}
          {...CandlestickSeriesOpts}
        />
        {#if volumeDisplaying}
          <HistogramSeries
            data={$volumechart}
            ref={(ref) => (volumeSeries = ref)}
            {...HistogramSeriesOpts}
          />
        {/if}
      </Chart>
      <span class="time">
        {$_("home.chart.nextCandle")} :
        {#if timeRemaining}
          {cmtt(timeRemaining)}
        {:else}
          {cmtt($interval * 60 * 1000)}
        {/if}
      </span>
    {:else}
      <div
        style="width:{chartWidth}px;height:{chartHeight}px;position: relative;"
      >
        <div
          style="width:200px;height:300px;margin:auto;left:0;right:0;top:0;bottom:0;position:absolute;"
        >
          <Jumper size="300" color="#444444" unit="px" duration="0.5s" />
        </div>
      </div>
    {/if}
    <div class="legend">
      {@html legend}
      <span class="realtrade">
        <strong> TRADES: </strong>
        {nbTrades}{#if $interval <= 1440}/{nbTradesToday}{/if}
      </span>
    </div>
    <div id="panel">
      <IconButton
        class="material-icons"
        on:click={() => console.log("click")}
        size="button"
      >
        <Icon component={Svg} viewBox="0 0 24 24">
          <path fill="currentColor" d={mdiChartTimelineVariant} />
        </Icon>
      </IconButton>
    </div>
    <div class="floating-tooltip {type || ''}" />
    <RightClickMenu {User} {currentPrice} bind:this={callRCM} />
  </div>
{/if}
<TradingOrderChart {candleSeries} bind:this={callTOC} />

<style>
  #panel {
    position: absolute;
    top: 60px;
    left: 10px;
    width: auto;
    height: auto;
    background: rgb(0, 0, 0, 0.2);
    border: 1px solid #404040;
    z-index: 6;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    padding: 5px;
  }
  :global(#panel button) {
    margin-top: 0 !important;
  }
  .chartctrl-block {
    position: relative;
    background-color: #212121;
    border: 1px solid #181818;
    padding: 10px;
    height: 45px;
  }
  .chartctrl-block .current-price {
    float: right;
    background-color: #1e1e1e;
    border: 1px solid #232323;
    padding: 5px 10px 5px 5px;
    margin-top: -5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    font-size: 0.8em;
  }
  .chartctrl-block .current-price.up {
    color: greenyellow;
  }
  .chartctrl-block .current-price.down {
    color: #ff0000;
  }
  .chartctrl-block .current-price span.icon {
    background-color: #181818;
    margin: 0 5px 0 -5px;
    padding: 4px;
    -webkit-border-top-left-radius: 5px;
    -webkit-border-bottom-left-radius: 5px;
    -moz-border-radius-topleft: 5px;
    -moz-border-radius-bottomleft: 5px;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }
  /* input[type="checkbox"] {
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
  } */
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
    cursor: crosshair;
    position: relative;
    background-color: #212121;
    border: 1px solid #181818;
    padding: 10px 10px 8px 10px;
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
    top: 10px;
    z-index: 1;
    font-size: 12px;
    font-weight: bold;
    line-height: 18px;
    font-weight: 300;
    width: 98%;
  }
  .chart-block .time {
    position: absolute;
    color: #ffffff;
    right: 15px;
    bottom: 5px;
    z-index: 1;
    font-size: 0.7em;
    line-height: 18px;
  }
  .chart-block .legend .realtrade {
    position: absolute;
    color: #969696;
    right: 70px;
    top: 0px;
    z-index: 1;
    font-size: 12px;
    font-weight: bold;
    line-height: 18px;
    font-weight: 300;
  }
  .addorder-chart-btn {
    float: right;
    margin-left: 10px;
    border-left: 1px solid #000000;
    padding-left: 10px;
  }
  .settings-chart-btn {
    float: left;
    margin-right: 10px;
    border-right: 1px solid #000000;
    padding-right: 10px;
  }
  .chart-title {
    float: left;
    margin-right: 10px;
    margin-top: -2px;
    padding-right: 10px;
  }
  .chart-asset {
    display: block;
    font-size: 0.8em;
  }
  .chart-exchange {
    font-size: 0.5em;
    color: #787878;
    display: block;
  }
  #displayChartSettingMenu {
    position: absolute !important;
    z-index: 9 !important;
    left: 0px !important;
    top: 45px !important;
  }
  #displayAlertMenu {
    position: absolute !important;
    z-index: 9 !important;
    right: 0px !important;
    top: 45px !important;
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

  :global(.mdc-switch) {
    margin: 5px !important;
  }
  :global(.mdc-icon-button.smui-icon-button--size-button) {
    margin-top: -5px !important;
    padding: 2px !important;
  }
  :global(.settings-list) {
    max-width: 300px;
    border-left: 3px solid #6b3b00;
  }
</style>

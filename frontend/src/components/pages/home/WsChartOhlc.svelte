<script>
  import { onMount } from "svelte";
  import { online, interval, pair, assetpair, fetchurl } from "store/store.js";
  import { wsohlc, wsohlcdata } from "store/wsohlc.js";

  import { CrosshairMode } from "lightweight-charts";
  import Chart from "svelte-lightweight-charts/components/chart.svelte";
  import CandlestickSeries from "svelte-lightweight-charts/components/candlestick-series.svelte";

  let series;
  let chartApi;
  let legend = "KRAKEN " + $assetpair.wsname + " " + $interval + "M";
  let serverApiUrl = $fetchurl + "/api/ohlc/" + $pair + "/" + $interval;

  onMount(() => {
    getChartHistoryDatas();

    wsohlc.subscribe((tick) => {
      if (
        typeof tick !== "undefined" &&
        Object.keys(tick).length > 1 &&
        $wsohlcdata
      ) {
        let lastItem = $wsohlcdata[$wsohlcdata.length - 1];
        let newcandle = ohlcFormat(tick, true);

        if (lastItem.time > newcandle.endtime) {
          // console.log("Historique plus a jour que tick pas de mise a jour !!!");
        } else if (lastItem.time === newcandle.endtime) {
          // console.log("Nous avons affaire a la meme bougie !!!");
          if (typeof series !== "undefined" && tick)
            series.update(ohlcFormat(tick, false));
        } else {
          // console.log("nouvelle bougie !!!");
          if (typeof series !== "undefined" && tick)
            series.update(ohlcFormat(tick, false));
        }
      }
    });
  });

  const ohlcFormat = (datas, endtime) => {
    const dataLength = datas.length;
    if (dataLength > 1) {
      let ohlc_tmp = JSON.parse("{}");
      if (endtime) {
        ohlc_tmp["time"] = parseInt(datas[0]);
        ohlc_tmp["endtime"] = parseInt(datas[1]);
      } else {
        // on passe endtime
        ohlc_tmp["time"] = parseInt(datas[1]);
      }
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

  const getChartHistoryDatas = async () => {
    if (!$online) return false;

    try {
      let res = await fetch(serverApiUrl).then((r) => r.json());

      if (res.hasOwnProperty("error")) {
        console.error(`${res.message} ${res.error} (${res.statusCode})`);
      } else {
        wsohlcdata.set(res);
      }
    } catch (error) {
      console.error("[ERROR] ################## getChartHistoryDatas", error);
    }
  };

  let open, high, low, close;
  const handleCrosshairMove = ({ detail: param }) => {
    if (param.time) {
      for (const value of param.seriesPrices.values()) {
        open = value["open"];
        high = value["high"];
        low = value["low"];
        close = value["close"];
      }
      legend = "KRAKEN " + $assetpair.wsname + " " + $interval + "M  ";
      legend +=
        ' <span class="ohlc">' +
        '<span class="open">OPEN</span>: ' +
        open +
        ' <span class="high">HIGH</span>: ' +
        high +
        ' <span class="low">LOW</span>: ' +
        low +
        ' <span class="close">CLOSE</span>: ' +
        close +
        "</span>";
    } else {
      legend = "KRAKEN " + $assetpair.wsname + " " + $interval + "M  ";
    }
  };

  const optionsChart = {
    // width: document.body.offsetWidth - 220,
    height: 250,
    layout: {
      backgroundColor: "#212121",
      textColor: "#fcfcfc",
    },
    grid: {
      vertLines: {
        color: "rgba(197, 203, 206, 0.5)",
      },
      horzLines: {
        color: "rgba(197, 203, 206, 0.5)",
      },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
    },
    rightPriceScale: {
      borderColor: "rgba(197, 203, 206, 0.8)",
    },
    timeScale: {
      borderColor: "rgba(197, 203, 206, 0.8)",
    },
    watermark: {
      color: "rgba(100, 100, 100, 0.1)",
      visible: true,
      fontSize: 150,
      text: $assetpair.wsname,
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
    if (typeof chartApi !== "undefined") {
      // console.log(chartApi);
    }
    if (typeof series !== "undefined") {
      series.setMarkers([
        {
          time: "2021-12-25",
          position: "aboveBar",
          color: "black",
          shape: "arrowDown",
        },
        {
          time: "2021-12-25",
          position: "belowBar",
          color: "red",
          shape: "arrowUp",
          id: "id3",
        },
        {
          time: "2021-12-25",
          position: "belowBar",
          color: "orange",
          shape: "arrowUp",
          id: "id4",
          text: "example",
          size: 2,
        },
      ]);
    }
  }
</script>

{#if $wsohlcdata}
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
        data={$wsohlcdata}
        ref={(ref) => (series = ref)}
        {...CandlestickSeriesOpts}
      />
    </Chart>
    <div class="legend">{@html legend}</div>
  </div>
{/if}

<style>
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
    font-style: italic;
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
  :global(.tv-lightweight-charts) {
    border: 1px dotted #222222;
    width: auto !important;
  }
  :global(.tv-lightweight-charts table) {
    width: auto !important;
  }
</style>

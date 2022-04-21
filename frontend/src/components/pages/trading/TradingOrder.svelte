<script>
  // ---------------------------------------------------------
  //  Imports
  // ---------------------------------------------------------
  import { _ } from "svelte-i18n";
  import { onMount, createEventDispatcher } from "svelte";
  import { online, assetpair, asymbole } from "store/store.js";
  import { WSTicker, WSSpread, WSBook } from "store/wsStore.js";
  import UserData from "classes/UserData.js";
  import { getSummuryInfos } from "components/pages/trading/trade.js";
  import { hasApikeysStore } from "store/userStore.js";
  import SegmentedButton, { Segment } from "@smui/segmented-button";
  import Textfield from "@smui/textfield";
  import Button from "@smui/button";
  import { Label } from "@smui/common";
  import FormField from "@smui/form-field";
  import Tooltip, { Wrapper } from "@smui/tooltip";
  import Select, { Option } from "@smui/select";
  import Checkbox from "@smui/checkbox";
  import Radio from "@smui/radio";
  import Slider from "@smui/slider";
  import { toast } from "@zerodevx/svelte-toast";
  import SnackBar from "components/SnackBar.svelte";

  // ---------------------------------------------------------
  //  Props
  // ---------------------------------------------------------
  export let candleSeries;
  const dispatch = createEventDispatcher();
  const ud = new UserData();

  let dry = true;
  let error = false;
  let balance = false;
  let order = false;
  let type = "buy";
  let ordertype = "market";
  let leverage = 0;
  let buyorsell;
  let amount = null;
  let volume = null;
  let price = null;
  let total = null;
  let postonly = false;
  let condclose = false;
  let condtype = "limit";
  let condprice = null;
  let condtotal = null;
  let base = Object.prototype.hasOwnProperty.call($asymbole, $assetpair.base)
    ? $asymbole[$assetpair.base].name
    : $assetpair.base;
  let quote = Object.prototype.hasOwnProperty.call($asymbole, $assetpair.quote)
    ? $asymbole[$assetpair.quote].name
    : $assetpair.quote;
  let devise = "quote";
  let quote_balance = 0;
  let nbTradesToday;
  let tickerPrice;
  let currentPriceOld = 0;
  let currentPriceWay;
  let currentPrice;
  let fundDevise;
  let slippagePercent = 0;
  let disabledBtnOrder = false;
  let actionPercentChoices = ["25%", "50%", "75%", "100%"];
  let actionPercentSelected = false;
  let summuryInfos = null;
  let summuryInfosOpen = false;
  let summuryInfosAskSend = false;
  let stoploss_percent_price = 0.003;
  let profit_percent_price = 1;
  let lastVolume = null;
  let lastTotal = null;
  let btnBuy = null,
    btnSell = null,
    domLoaded = false;

  let snackBarText = "",
    snackBarShow = false;

  // ---------------------------------------------------------
  //  Methods Declarations
  // ---------------------------------------------------------
  const bootstrap = (readyState) => {
    if (["interactive", "complete"].includes(readyState)) {
      btnBuy = document.querySelector(".btnBuy");
      btnSell = document.querySelector(".btnBuy");
      domLoaded = true;
    }
  };

  /**
   * Notification
   * @description Envoi une alert message
   * @param { String } message Message a afficher
   * @param { String } theme Thème (default, success, error)
   */
  const Notification = (message, theme = "default", reload = false) => {
    if (!message) return;

    const themes = {
      default: {},
      success: {
        "--toastBackground": "darkgreen",
        "--toastBarBackground": "#1f4a22",
      },
      error: {
        "--toastBackground": "brown",
        "--toastBarBackground": "#4a1f1f",
      },
    };
    theme = themes[theme];

    toast.push(message, {
      initial: 0,
      next: 1,
      pausable: true,
      dismissable: true,
      target: "new",
      theme,
      duration: reload ? 500 : 5000,
      onpop: () => {
        reload ? location.reload() : false;
      },
    });
  };

  const GetBalance = async () => {
    try {
      if (!$online) {
        error = true;
        return false;
      }

      const res = await ud.getBalance();
      if (
        typeof res !== "undefined" &&
        Object.prototype.hasOwnProperty.call(res, "error")
      ) {
        snackBarShow = true;
        snackBarText = `<strong>[KRAKEN API]</strong> ${res.endpoint}: ${res.message}`;

        error = res.error;
      } else {
        balance = res;
        error = false;
      }
    } catch (error) {
      console.error("GetBalance", error);
    }
  };

  const setActionWay = (event, way) => {
    if (event) event.preventDefault();
    type = way;

    if (!btnBuy || !btnSell)
      console.debug("[ERROR] setActionWay btnBuy || btnSell");
    else {
      if (way === "buy") {
        btnBuy.classList.add("active");
        btnSell.classList.remove("active");
      }

      if (way === "sell") {
        btnSell.classList.add("active");
        btnBuy.classList.remove("active");
      }
    }

    if (way === "buy") buyorsell = "quote";
    if (way === "sell") buyorsell = "base";
  };

  const setPercentAmount = (event) => {
    event.preventDefault();
    let percent = parseFloat(actionPercentSelected.slice(0, -1)) / 100;
    let funds = parseFloat(quote_balance);
    price = ordertype === "market" ? currentPrice : price;
    percent = leverage > 0 ? funds * leverage * percent : funds * percent;
    volume = Number(parseFloat(percent).toFixed($assetpair.lot_decimals));
    total = parseFloat(volume * price).toFixed($assetpair.pair_decimals);
  };

  const resetForm = () => {
    type;
    ordertype = "market";
    leverage = 0;
    amount = "";
    volume = "";
    price = "";
    total = "";
    condclose = false;
    postonly = false;
    devise = "quote";
    condtype = "limit";
    condprice = "";
    condtotal = "";
    slippagePercent = 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    // AddOrder
    try {
      if (!$online) {
        error = true;
        return false;
      }

      let params = {
        pair: $assetpair.altname,
        type,
        ordertype,
        leverage,
        amount,
        volume,
        price,
        total,
        postonly,
        devise,
        condclose,
        condtype,
        condprice,
        condtotal,
        dry,
      };

      const res = await ud.addOrder(params);

      if (
        typeof res !== "undefined" &&
        Object.prototype.hasOwnProperty.call(res, "error")
      ) {
        error = res.error;
      } else {
        order = res;
        error = false;
        dispatch("closedialogorder", { closeDialogOrder: true });
        resetForm();

        if (Object.prototype.hasOwnProperty.call(order, "descr")) {
          for (const descr of Object.entries(order.descr)) {
            // // Add chart Line price
            if (candleSeries) {
              candleSeries.createPriceLine({
                price: descr[0] === "close" ? params.condprice : params.price,
                color: params.type === "buy" ? "green" : "red",
                lineWidth: 1,
                axisLabelVisible: true,
                title: descr[1],
              });
            }
            // // Notification
            Notification(descr[1], params.type === "buy" ? "success" : "error");
          }
        }

        if (error) Notification(error, "error");
      }
    } catch (error) {
      console.error("handleSubmitOrder", error);
      Notification(error, "error");
    }
  };

  const calculAverageFilledForMarketOrder = (book, vol) => {
    let tmp = 0;
    let v = vol;
    let stop = false;
    book.map((d) => {
      v -= Number(d[1]);
      if (v >= -1 && !stop) {
        if (v <= 0) {
          stop = true;
          v = parseFloat(d[1]) - Math.abs(v);
          tmp += parseFloat(v * d[0]);
        } else tmp += parseFloat(d[1] * d[0]);
      }
    });

    return tmp / vol;
  };

  const calculSlippageForMarkerOrder = (arr, volume, current, type) => {
    let price = 0;
    let averageFill = false;
    let slippage = false;
    let percent = false;

    averageFill = calculAverageFilledForMarketOrder(arr, volume);

    if (type === "buy") {
      slippage = Number(averageFill - parseFloat(current) * volume).toFixed(2);
    } else if (type === "sell") {
      slippage = Number(parseFloat(current) - averageFill * volume).toFixed(2);
    }
    percent = parseFloat(
      (averageFill / parseFloat(current)) * 100 - 100
    ).toFixed(2);

    if (averageFill) price = parseFloat(averageFill).toFixed(2);

    return { price, percent };
  };

  const calculateTradeFeeAndPnL = async () => {
    try {
      let calculator = {
        assetPair: $assetpair,
        pair: $assetpair.altname,
        volume,
        price,
        type,
        ordertype,
        leverage,
        profit_percent_price,
        stoploss_percent_price,
      };

      summuryInfos = await getSummuryInfos(calculator, ud);

      if (summuryInfos) {
        summuryInfosAskSend = false;
        condclose = true;
        condtype = "stop-loss-limit";
        condprice = summuryInfos.trade.stoploss.price;
        condtotal = summuryInfos.trade.stoploss.price_total;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangeVolumePriceTotal = (input) => {
    switch (ordertype) {
      case "limit":
        if (volume && price)
          total = parseFloat(volume * price).toFixed($assetpair.pair_decimals);
        break;

      case "stop-loss":
      case "take-profit":
      case "stop-loss-limit":
      case "take-profit-limit":
        if (["volume", "price"].includes(input) && volume && price)
          total = parseFloat(volume * price).toFixed($assetpair.pair_decimals);
        if (["total", "price"].includes(input) && total && price)
          volume = parseFloat(total / price).toFixed($assetpair.pair_decimals);
        break;

      default:
        break;
    }
  };

  onMount(() => {
    bootstrap(document.readyState);
    if ($hasApikeysStore) GetBalance();
    if (domLoaded) setActionWay(false, "buy");
  });

  // Prix actuel
  $: if ($WSTicker) {
    tickerPrice = parseFloat($WSTicker["c"][0] || 0).toFixed(
      $assetpair.pair_decimals
    );
    nbTradesToday = $WSTicker["t"][0] || 0;
    if (currentPriceOld === 0) currentPriceWay = false;
    else if (parseFloat(tickerPrice) > parseFloat(currentPriceOld))
      currentPriceWay = "up";
    else if (parseFloat(tickerPrice) < parseFloat(currentPriceOld))
      currentPriceWay = "down";
    else currentPriceWay = false;

    currentPriceOld = tickerPrice;
  }

  $: {
    // Order Type = Market
    if (volume && $WSTicker && $WSBook) {
      // Modifie le prix en fonction du volume / slippage en type MARKET
      if (ordertype === "market") {
        // Calcul le prix moyen d'achat et le slippage en pourcentage
        if (type === "buy") {
          if (volume <= $WSTicker.a[2]) {
            currentPrice = parseFloat($WSTicker.a[0]).toFixed(
              $assetpair.pair_decimals
            );
          } else {
            if (Object.prototype.hasOwnProperty.call($WSBook, "mirror")) {
              let asks = $WSBook.mirror.as;
              let s = calculSlippageForMarkerOrder(
                asks,
                volume,
                $WSTicker.a[0],
                type
              );
              currentPrice = s.price;
              slippagePercent = s.percent;
            }
          }
        } else if (type === "sell") {
          if (volume <= $WSTicker.b[2]) {
            currentPrice = parseFloat($WSTicker.b[0]).toFixed(
              $assetpair.pair_decimals
            );
          } else {
            if (Object.prototype.hasOwnProperty.call($WSBook, "mirror")) {
              let bids = $WSBook.mirror.bs;
              let s = calculSlippageForMarkerOrder(
                bids,
                volume,
                $WSTicker.a[0],
                type
              );
              currentPrice = s.price;
              slippagePercent = s.percent;
            }
          }
        }

        // Vérifie le pourcentage de slippage et désactive le boutton
        if (
          (type === "buy" && slippagePercent >= 3) ||
          (type === "sell" && slippagePercent <= -3)
        )
          disabledBtnOrder = true;
        else disabledBtnOrder = false;

        // Calcul du total
        total = parseFloat(volume * currentPrice).toFixed(
          $assetpair.pair_decimals
        );
        price = ordertype === "market" ? currentPrice : "";
      }
    }

    // Order Type = limit
    if (volume && leverage && price && ordertype === "limit") {
      if (!summuryInfos && !summuryInfosAskSend) {
        summuryInfosAskSend = true;
        calculateTradeFeeAndPnL();
      } else if (
        !summuryInfosAskSend &&
        (volume !== summuryInfos.volume ||
          leverage !== summuryInfos.leverage ||
          price !== summuryInfos.price)
      ) {
        summuryInfosAskSend = true;
        calculateTradeFeeAndPnL();
      }
    } else {
      summuryInfos = null;
      condtype = null;
      condprice = null;
      condtotal = null;
    }

    quote_balance =
      buyorsell === "quote" &&
      Object.prototype.hasOwnProperty.call(balance, $assetpair.quote)
        ? balance[$assetpair.quote]
        : buyorsell === "base" &&
          Object.prototype.hasOwnProperty.call(balance, $assetpair.base)
        ? balance[$assetpair.base]
        : "";
    fundDevise = buyorsell === "base" ? $assetpair.base : $assetpair.quote;
  }
</script>

<SnackBar showSnackbar={snackBarShow} text={snackBarText} />
<h2 class="placeOrderH2">
  {$_("trading.subtitle")} ({nbTradesToday})
  {#if tickerPrice}
    <div class="current-price {currentPriceWay}">
      <span class="icon">
        {#if currentPriceWay}
          <i class="fa-solid fa-arrow-trend-{currentPriceWay}" />
        {:else}
          <i class="fa-solid fa-circle-arrow-right" />
        {/if}
      </span>
      {tickerPrice}
      {quote}
    </div>
    <br class="clearfix" />
  {/if}
</h2>
{#if summuryInfos}
  <div id="summuryInfos">
    {#if type === "buy"}
      <h3 class="green" on:click={() => (summuryInfosOpen = !summuryInfosOpen)}>
        <strong>[LONG]</strong>
        Récapitulatif du trade
      </h3>
    {:else if type === "sell"}
      <h3 class="red" on:click={() => (summuryInfosOpen = !summuryInfosOpen)}>
        <strong>[SHORT]</strong>
        Récapitulatif du trade
      </h3>
    {/if}
    {#if summuryInfosOpen}
      <div style="float:left;display:inline-block;width:74.9%;">
        - {#if type === "buy"}Acheter{:else if type === "sell"}Vendre{/if}
        <strong>{volume} {$assetpair.base}</strong>@Limite
        <strong
          >{parseFloat(summuryInfos.price).toFixed($assetpair.pair_decimals)}
          {$assetpair.quote}</strong
        >
        effet de levier <strong>{summuryInfos.leverage}:1</strong> pour un total
        de: {@html parseFloat(summuryInfos.total).toFixed(
          $assetpair.pair_decimals
        ) +
          $assetpair.quote +
          (summuryInfos.leverage > 0
            ? " <strong>(" +
              parseFloat(summuryInfos.total / summuryInfos.leverage).toFixed(
                $assetpair.pair_decimals
              ) +
              " " +
              $assetpair.quote +
              ")</strong>"
            : "")}
        <br />
        - Frais d'entrées de :
        <strong>{summuryInfos.trade.fees.first} {$assetpair.quote}</strong> / -
        Frais de sortie en take profit de :
        <strong>{summuryInfos.trade.fees.tp.two} {$assetpair.quote}</strong>
        <br />
        - Profit souhaité de <strong>{profit_percent_price}%</strong>, prix de
        {#if type === "buy"}revente{:else if type === "sell"}rachat{/if} estimé à
        <strong>
          {summuryInfos.trade.take_profit.price}
          {$assetpair.quote}
        </strong>
        pour un total de:
        <strong
          >{summuryInfos.trade.take_profit.price_total}
          {$assetpair.quote}</strong
        > <br />
        - Gain estimé de
        <strong
          >{summuryInfos.trade.gain.tp.fees_total} {$assetpair.quote}</strong
        >
        (Gain:
        <strong>{summuryInfos.trade.gain.tp.total} {$assetpair.quote}</strong>
        - Frais entré/sortie:
        <strong>{summuryInfos.trade.fees.tp.total} {$assetpair.quote}</strong
        >)<br />
        - Seuil de rentabilité à
        <strong>{summuryInfos.trade.breakeven.price} {$assetpair.quote}</strong>
        pour un total de:
        <strong
          >{summuryInfos.trade.breakeven.price_total} {$assetpair.quote}</strong
        ><br />
        - Ordre de Stop Loss à placer à
        <strong>{summuryInfos.trade.stoploss.price} {$assetpair.quote}</strong>
        pour un total de:
        <strong
          >{summuryInfos.trade.stoploss.price_total} {$assetpair.quote}</strong
        ><br />
        - Perte total estimé de
        <strong
          >{summuryInfos.trade.gain.sl.fees_total} {$assetpair.quote}</strong
        >
        (Perte:
        <strong>{summuryInfos.trade.gain.sl.total} {$assetpair.quote}</strong>
        / Frais:
        <strong>{summuryInfos.trade.fees.sl.total} {$assetpair.quote}</strong
        >)<br />
      </div>
      <div style="float:right;display:inline-block;width:24.9%;">
        <table class="rolloverTable">
          <thead>
            <tr>
              <td><strong>Rollover</strong></td>
              <td><strong>Frais</strong></td>
              <td><strong>P/L:</strong></td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>4h</td>
              <td>{summuryInfos.trade.rollover.h4.cost} {$assetpair.quote}</td>
              <td>{summuryInfos.trade.rollover.h4.gain} {$assetpair.quote}</td>
            </tr>
            <tr>
              <td>1 jour</td>
              <td>{summuryInfos.trade.rollover.day.cost} {$assetpair.quote}</td>
              <td>{summuryInfos.trade.rollover.day.gain} {$assetpair.quote}</td>
            </tr>
            <tr>
              <td>1 semaine</td>
              <td>{summuryInfos.trade.rollover.week.cost} {$assetpair.quote}</td
              >
              <td>{summuryInfos.trade.rollover.week.gain} {$assetpair.quote}</td
              >
            </tr>
            <tr>
              <td>1 mois</td>
              <td
                >{summuryInfos.trade.rollover.month.cost} {$assetpair.quote}</td
              >
              <td
                >{summuryInfos.trade.rollover.month.gain} {$assetpair.quote}</td
              >
            </tr>
          </tbody>
        </table>
      </div>
      <div class="clearfix">&nbsp;</div>
    {/if}
  </div>
{/if}
<form id="placeorder">
  <div id="trading-order">
    <div>
      <fieldset>
        <div class="item">
          <Button
            class="btnBuy"
            on:click={(e) => setActionWay(e, "buy")}
            variant="outlined"
          >
            <Label>{$_("trading.order.buy")}</Label>
          </Button>
          <Button
            class="btnSell"
            on:click={(e) => setActionWay(e, "sell")}
            variant="outlined"
          >
            <Label>{$_("trading.order.sell")}</Label>
          </Button>
        </div>
        <hr />
        <div class="item">
          <Select
            bind:value={ordertype}
            name="ordertype"
            label={$_("trading.order.type")}
            required
            style="width:100%;height:30%;"
          >
            <Option value="market">{$_("trading.order.market")}</Option>
            <Option value="limit">{$_("trading.order.limit")}</Option>
            <Option value="settle-position"
              >{$_("trading.order.setPosition")}</Option
            >
            <Option value="stop-loss">{$_("trading.order.stopLoss")}</Option>
            <Option value="take-profit">{$_("trading.order.takeProfit")}</Option
            >
            <Option value="stop-loss-limit"
              >{$_("trading.order.stopLossLmt")}</Option
            >
            <Option value="take-profit-limit"
              >{$_("trading.order.takeProfitLmt")}</Option
            >
          </Select>
        </div>
        <hr />
        <div class="item">
          <label for="leverage">
            {$_("trading.order.margin")}:
          </label>
          <div>
            <Slider
              bind:value={leverage}
              min={0}
              max={$assetpair.leverage_buy.length + 1}
              step={1}
              discrete
              tickMarks
              input$aria-label={$_("trading.order.margin")}
              name="leverage"
            />
          </div>
        </div>
        <hr />
        <div class="item">
          <div class="separator">
            <Textfield
              bind:value={quote_balance}
              label={$_("trading.order.funds")}
              suffix={fundDevise}
              input$pattern="\d+"
              type="number"
              name="trading-o-total"
              disabled
              style="width:100%;"
            />
          </div>
          <div class="action-percent-wrapper">
            <SegmentedButton
              name="trading-o-total-percent"
              segments={actionPercentChoices}
              let:segment
              singleSelect
              bind:selected={actionPercentSelected}
              on:click={(event) => setPercentAmount(event)}
              style="width:100%;"
            >
              <Segment
                {segment}
                style="width:24.9%;text-align:center;display: inline-block;"
              >
                <Label>{segment}</Label>
              </Segment>
            </SegmentedButton>
          </div>
        </div>
      </fieldset>
    </div>
    <div>
      <fieldset>
        <div class="separator">
          {#if ordertype === "market"}
            <span class="slippag-info">
              {#if slippagePercent}
                {#if type === "buy"}
                  {#if slippagePercent >= 1}
                    <span class="extremBad">
                      {$_("trading.order.unfavorableSlippage")} : {slippagePercent}%
                    </span>
                  {:else if slippagePercent >= 3}
                    <span class="extremVeryBad">
                      {$_("trading.order.unfavorableSlippage")} : {slippagePercent}%
                    </span>
                  {:else if slippagePercent <= -1}
                    <span class="extremGood">
                      {$_("trading.order.favorableSlippage")} : {slippagePercent}%
                    </span>
                  {:else if slippagePercent <= -3}
                    <span class="extremVeryGood">
                      {$_("trading.order.favorableSlippage")} : {slippagePercent}%
                    </span>
                  {:else}
                    <span class="neutral">
                      {$_("trading.order.slippage")} : {slippagePercent}%
                    </span>
                  {/if}
                {:else if type === "sell"}
                  {#if slippagePercent <= -1}
                    <span class="extremBad">
                      {$_("trading.order.unfavorableSlippage")} : {slippagePercent}%
                    </span>
                  {:else if slippagePercent <= -3}
                    <span class="extremVeryBad">
                      {$_("trading.order.unfavorableSlippage")} : {slippagePercent}%
                    </span>
                  {:else if slippagePercent >= 1}
                    <span class="extremGood">
                      {$_("trading.order.favorableSlippage")} : {slippagePercent}%
                    </span>
                  {:else if slippagePercent >= 3}
                    <span class="extremVeryGood">
                      {$_("trading.order.favorableSlippage")} : {slippagePercent}%
                    </span>
                  {:else}
                    <span class="neutral">
                      {$_("trading.order.slippage")} : {slippagePercent}%
                    </span>
                  {/if}
                {/if}
              {/if}
            </span>
          {/if}
          <Textfield
            bind:value={volume}
            label={$_("trading.order.quantity")}
            suffix={base}
            input$pattern="\d+"
            type="number"
            name="volume"
            autocomplete="off"
            style="width:100%;"
            on:keyup={() => handleChangeVolumePriceTotal("volume")}
          />
        </div>
        <div class="separator">
          <Textfield
            bind:value={price}
            label={$_("trading.order.price")}
            suffix={quote}
            input$pattern="\d+"
            type="number"
            name="price"
            autocomplete="off"
            style="width:100%;"
            on:keyup={() => handleChangeVolumePriceTotal("price")}
          />
        </div>
        <div class="separator">
          <Textfield
            bind:value={total}
            label={$_("trading.order.total")}
            suffix={quote}
            input$pattern="\d+"
            type="number"
            name="total"
            autocomplete="off"
            style="width:100%;"
            on:keyup={() => handleChangeVolumePriceTotal("total")}
          />
        </div>
        <div class="separator top">
          {#if ordertype === "limit"}
            <FormField>
              <Checkbox name="postonly" bind:postonly />
              <span slot="label">
                {$_("trading.order.postOnly")}
              </span>
            </FormField>
          {/if}
          <FormField>
            <Checkbox name="condclose" bind:checked={condclose} />
            <span slot="label">
              {$_("trading.order.closeCond")}
            </span>
          </FormField>
          <div class="right" style="margin-top: -0.2em;">
            <FormField>
              <Wrapper>
                <Radio name="devise" bind:group={devise} value="base" touch />
                <Tooltip>{$_("trading.order.fees")} {base}</Tooltip>
              </Wrapper>
              <span slot="label">{base}</span>
            </FormField>
            <FormField>
              <Wrapper>
                <Radio name="devise" bind:group={devise} value="quote" touch />
                <Tooltip>{$_("trading.order.fees")} {quote}</Tooltip>
              </Wrapper>
              <span slot="label">{quote}</span>
            </FormField>
          </div>
        </div>
        {#if ordertype === "limit"}
          <hr />
          <div class="separator">
            <Textfield
              bind:value={profit_percent_price}
              label={$_("trading.order.percentProfit")}
              suffix="%"
              input$pattern="\d+"
              type="number"
              name="percentProfit"
              autocomplete="off"
              style="width:45%;float: left;"
            />
            <Textfield
              bind:value={stoploss_percent_price}
              label={$_("trading.order.percentStoploss")}
              suffix="%"
              input$pattern="\d+"
              type="number"
              name="percentStoploss"
              autocomplete="off"
              style="width:45%;float:right;"
            />
          </div>
          <div class="clearfix">&nbsp;</div>
        {:else}
          <hr />
        {/if}
        <div class="confirmation">
          <Button
            class="reset"
            on:click={resetForm}
            color="secondary"
            variant="outlined"
          >
            <Label>{$_("trading.order.reset")}</Label>
          </Button>
          <Button
            type="submit"
            class={type}
            disabled={disabledBtnOrder}
            variant="outlined"
            on:click={(e) => handleSubmitOrder(e)}
          >
            <Label>
              {$_("trading.order.confirm")}
              {$_("trading.order.and")}
              {$_(`trading.order.${type}`)}
            </Label>
          </Button>
        </div>
      </fieldset>
    </div>
  </div>

  {#if condclose}
    <div id="closed-conditionnaly">
      <h2>{$_("trading.order.closeConditionnal")}</h2>
      <fieldset>
        <div class="item">
          <Select
            bind:value={condtype}
            name="condtype"
            label={$_("trading.order.type")}
            required
            style="width:100%;height:30%;"
          >
            <Option value="limit">{$_("trading.order.limit")}</Option>
            <Option value="stop-loss">{$_("trading.order.stopLoss")}</Option>
            <Option value="take-profit">{$_("trading.order.takeProfit")}</Option
            >
            <Option value="stop-loss-limit"
              >{$_("trading.order.stopLossLmt")}</Option
            >
            <Option value="take-profit-limit"
              >{$_("trading.order.takeProfitLmt")}</Option
            >
          </Select>
        </div>
        <div class="separator">
          <Textfield
            bind:value={condprice}
            label={$_("trading.order.price")}
            suffix={quote}
            input$pattern="\d+"
            type="number"
            name="condprice"
            autocomplete="off"
            style="width:100%;"
          />
        </div>
        <div class="separator">
          <Textfield
            bind:value={condtotal}
            label={$_("trading.order.total")}
            suffix={quote}
            input$pattern="\d+"
            type="number"
            name="condtotal"
            autocomplete="off"
            style="width:100%;"
          />
        </div>
      </fieldset>
    </div>
  {/if}
</form>

<style>
  #summuryInfos {
    font-size: 0.8em;
    padding: 10px;
    border: 1px dashed #555555;
    background-color: #232323;
  }
  #summuryInfos h3 {
    cursor: pointer;
  }
  #summuryInfos .rolloverTable {
    background-color: #1b1b1b;
    border: 1px solid #333333;
  }
  #summuryInfos .rolloverTable td {
    border: 1px solid #333333;
    padding: 3px;
    border: 1px solid #333333;
    white-space: nowrap;
    font-size: 0.9em;
  }

  #closed-conditionnaly {
    display: grid;
    grid-template-columns: repeat(auto-fit, 100%);
  }
  #trading-order {
    display: grid;
    grid-template-columns: repeat(auto-fit, 50%);
    width: 100%;
    font-size: 0.9rem;
  }
  fieldset {
    border: 1px solid #1c1c1c;
    padding: 10px;
  }
  label {
    color: #8b8b8b;
    font-weight: 500;
    width: 20%;
    display: inline-block;
    padding: 5px;
    border: none;
    margin-right: 35px;
  }
  hr {
    margin: 10px 0;
    background-color: #262626;
    border: none;
    height: 2px;
  }
  :global(.item button) {
    border: 1px solid #323232;
    /* padding: 5px; */
    width: 35%;
    background: #1c1c1c;
    color: #747474;
    cursor: pointer;
    font-weight: bold;
  }
  :global(.item button.action-buy, .item button.action-sell) {
    border: 1px solid #323232;
    padding: 5px;
    width: 35%;
    background: #1c1c1c;
    color: #747474;
    cursor: pointer;
    font-weight: bold;
  }
  :global(.item button.active).action-buy {
    color: darkgreen;
    border: 1px solid #5f5f5f;
    background: #2b2b2b;
  }
  :global(.item button.active).action-sell {
    color: firebrick;
    border: 1px solid #5f5f5f;
    background: #2b2b2b;
  }
  :global(.item button.buy) {
    background: darkgreen !important;
    border: 1px solid #2aff00 !important;
    color: #cccccc !important;
  }
  :global(.item button.sell) {
    background: darkred !important;
    border: 1px solid #ff0000 !important;
    color: #cccccc !important;
  }
  :global(.item button.action-percent) {
    border: 1px solid #323232;
    padding: 5px;
    width: 24%;
    background: #1c1c1c;
    color: #747474;
    cursor: pointer;
    font-weight: bold;
  }
  /* :global(.item button:hover) {
    border: 1px solid #000000;
  } */
  :global(.item button.btnBuy) {
    color: #6ddc09 !important;
    background: rgb(30 30 30) !important;
    width: 49.5%;
  }
  :global(.item button.btnSell) {
    color: #fe1014 !important;
    background: rgb(30 30 30) !important;
    width: 49.5%;
  }
  :global(.item button.btnBuy:hover, button.btnBuy:active) {
    background: green !important;
  }
  :global(.item button.btnSell:hover, button.btnSell:active) {
    background: red !important;
    color: white !important;
  }
  /* select {
    border: 1px solid #5f5f5f;
    background: #2b2b2b;
    color: #747474;
    outline: none;
    padding: 5px;
    width: 71%;
  }
  option {
    background-color: #252525;
    color: #747474;
  }
  input[type="text"],
  input[type="number"] {
    background-color: #252525;
    outline: none;
    border: 1px solid #323232;
    padding: 5px;
    width: 62%;
    color: #747474;
    padding: 7px;
  }
  input[type="text"]:hover,
  input[type="text"]:focus,
  input[type="number"]:hover,
  input[type="number"]:focus {
    border: 1px solid #5f5f5f;
    background: #2b2b2b;
  } */
  .action-percent-wrapper {
    padding: 10px 0 0 0;
  }
  div.separator {
    position: relative;
  }
  div.top {
    margin-top: 10px;
  }
  span.slippag-info {
    position: absolute;
    top: 0;
    right: -5px;
  }
  :global(span.input-label) {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 10%;
    padding: 5px;
    color: #838383;
    font-weight: bold;
    font-size: 0.7em;
    background-color: #202020;
    display: inline-block;
    text-align: center;
    vertical-align: middle;
    border: 1px solid #323232;
  }
  div.confirmation {
    padding-top: 14px;
  }
  :global(div.confirmation button) {
    width: 49%;
  }
  :global(div.confirmation button:disabled) {
    background-color: #1b1b1b;
    color: #333;
  }
  :global(button.reset) {
    background-color: #1b1b1b;
  }
  /*
  .stepper {
    display: inline-block;
    width: 71%;
    position: relative;
  }
  .stepper ul {
    display: table;
    width: 100%;
    position: absolute;
    top: 0;
    white-space: pre-line;
    margin: 0;
  }
  .stepper li {
    display: table-cell;
    background-color: #343434;
    height: 2px;
    margin-top: 0px;
    position: relative;
    list-style: none;
  }
  .stepper li:first-child label {
    left: 0;
    width: 54px;
    text-align: left;
  }
  .stepper li:last-child label {
    left: -46px;
    width: 54px;
    text-align: right;
  }
  .stepper li:last-child {
    width: 10px;
    background: none;
  }
  .stepper li label {
    position: absolute;
    top: -25px;
    left: -33px;
    font-weight: bold;
    border: none;
    font-size: 0.7em;
    cursor: pointer;
    width: 70px;
    height: 40px;
    margin: 0;
    text-align: center;
    padding: 0;
    vertical-align: middle;
  }
  .stepper li input[type="radio"] {
    position: absolute;
    width: 12px;
    height: 12px;
    top: -5px;
    left: -3px;
    outline: none;
    cursor: pointer;
  }
  .stepper li input[type="radio"]:after {
    width: 12px;
    height: 12px;
    border-radius: 12px;
    top: -1px;
    left: -1px;
    position: relative;
    background-color: #343434;
    content: "";
    display: inline-block;
    visibility: visible;
    border: 1px solid #333;
  }
  .stepper li input[type="radio"]:checked:after {
    width: 12px;
    height: 12px;
    border-radius: 12px;
    top: -1px;
    left: -1px;
    position: relative;
    background-color: #1c1c1c;
    content: "";
    display: inline-block;
    visibility: visible;
    border: 1px solid #333;
  }
  input[type="radio"] {
    width: 12px;
    height: 12px;
    outline: none;
    cursor: pointer;
    outline: none;
  }
  input[type="radio"]:after {
    position: relative;
    width: 12px;
    height: 12px;
    border-radius: 12px;
    top: -1px;
    left: -1px;
    background-color: #343434;
    content: "";
    display: inline-block;
    visibility: visible;
    border: 1px solid #333;
  }
  input[type="radio"]:checked:after {
    position: relative;
    width: 12px;
    height: 12px;
    border-radius: 12px;
    top: -1px;
    left: -1px;
    background-color: #1c1c1c;
    content: "";
    display: inline-block;
    visibility: visible;
    border: 1px solid #333;
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
  span.label-checkbox {
    font-size: 0.9em;
    color: #747474;
    margin-right: 10px;
    text-align: center;
    vertical-align: top;
  } */

  .current-price {
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
  .current-price.up {
    color: greenyellow;
  }
  .current-price.down {
    color: #ff0000;
  }
  .current-price span.icon {
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
  .placeOrderH2 {
    padding: 7px 0 9px 10px;
  }

  :global(.item .smui-select--standard .mdc-select__anchor) {
    height: 46px;
  }

  :global(.item .mdc-menu .mdc-deprecated-list-item) {
    height: 30px;
  }
  :global(.smui-select--standard:not(.mdc-select--disabled)
      .mdc-line-ripple::before) {
    border: none;
  }
  :global(.smui-select--standard:not(.mdc-select--disabled)
      .mdc-line-ripple::after) {
    border: none;
  }

  :global(.smui-text-field--standard:not(.mdc-text-field--disabled)
      .mdc-line-ripple::before) {
    border-bottom-color: rgb(62 62 62 / 42%) !important;
  }

  :global(.smui-text-field--standard:not(.mdc-text-field--disabled)
      .mdc-line-ripple::after) {
    border-bottom-color: rgb(62 62 62 / 42%) !important;
  }

  .extremGood {
    color: green;
    font-size: 0.7em;
    display: block;
    padding: 5px;
  }
  .extremVeryGood {
    color: chartreuse;
    font-size: 0.7em;
    display: block;
    padding: 5px;
  }
  .extremBad {
    color: orange;
    font-size: 0.7em;
    display: block;
    padding: 5px;
  }
  .extremVeryBad {
    color: red;
    font-size: 0.7em;
    display: block;
    padding: 5px;
  }
  .neutral {
    color: darkgray;
    font-size: 0.7em;
    display: block;
    padding: 5px;
  }

  .clearfix:after {
    content: "";
    display: block;
    clear: both;
  }
</style>

<script>
  import { _ } from "svelte-i18n";
  import { draggable } from "@neodrag/svelte";
  import { assetpair, online } from "store/store.js";
  import { WSTicker, WSSpread } from "store/wsstore.js";
  import { toast } from "@zerodevx/svelte-toast";
  import UserData from "classes/UserData.js";

  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import TradingOrder from "components/pages/trading/TradingOrder.svelte";

  export let candleSeries;

  const ud = new UserData();
  let order = false;
  let error = false,
    displayMore = false,
    oType,
    volume = 0,
    ordertype = "market",
    pair = $assetpair.altname,
    openOrderDialog = false,
    openOrderConfirm = false,
    params = null,
    marketPrice = { ask: false, bid: false },
    base = $assetpair.wsname.split("/")[0],
    quote = $assetpair.wsname.split("/")[1];

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

  const volumeChange = (event) => {
    // Verifie le volume entrée et limite la décimal
    let val = event.target.value,
      t = String(volume).split(".");
    if (t.length >= 2) {
      if (t[1].length >= $assetpair.lot_decimals)
        volume = Number(val).toFixed($assetpair.lot_decimals);
    }
  };

  const addOrderByModal = async (type) => {
    if (volume) {
      oType = type;
      let way = type === "sell" ? "bid" : "ask";
      params = { volume, ordertype, pair, type, price: marketPrice[way] };
      if (params) openOrderConfirm = true;
    }
  };

  const addOrder = async (params) => {
    if (volume) {
      // AddOrder
      try {
        if (!$online) {
          error = true;
          return false;
        }
        const res = await ud.addOrder(params);
        if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
          error = res.error;
        } else {
          order = res;
          error = false;
        }
      } catch (error) {
        console.log(error);
      }

      if (order) Notification(order.descr.order, "success");
      else Notification(error, "error");

      if (candleSeries) {
        const priceLine = candleSeries.createPriceLine({
          price: params.price,
          color: params.type === "buy" ? "green" : "red",
          lineWidth: 1,
          axisLabelVisible: true,
          title: `${params.type} ${params.ordertype} ${params.volume}`,
        });
      }
    }

    // Remise à zero du volume
    volume = 0;
  };

  const closeOrderDialogHandler = () => {
    openOrderDialog = false;
  };

  export const openOrderDialogParent = () => {
    openOrderDialog = true;
  };

  const closeOrderDialogParent = (e) => {
    if (e.detail.closeDialogOrder) openOrderDialog = false;
  };

  const closeOrderConfirmHandler = (e) => {
    let action = e.detail.action;
    if (action === "confirm") addOrder(params);
    openOrderConfirm = false;
  };

  const handleMouseenter = () => (displayMore = true);
  const handleMouseleave = () => (displayMore = false);

  $: if ($WSSpread) {
    marketPrice.bid = $WSSpread[0];
    marketPrice.ask = $WSSpread[1];
  }

  // window.addEventListener("load", () => {
  //   let chartblock = document.querySelector(".chart-block");
  //   let modal = document.getElementById("trading-order-modal");
  //   let modalWidth = modal.clientWidth || 232;
  //   let chartWidth = chartblock.clientWidth || chartWidth;
  //   let leftModal = chartWidth / 2 - modalWidth / 2;
  //   modal.style.left = `${leftModal}px`;
  // });
</script>

<div
  id="trading-order-modal"
  use:draggable
  on:mouseenter={handleMouseenter}
  on:mouseleave={handleMouseleave}
>
  <div
    class="more-params"
    class:displayMore
    on:click={() => (openOrderDialog = true)}
  >
    <i class="fa fa-plus" />
    {$_("trading.chartOrder.more")}
  </div>
  <button class="add-order-buy" on:click={() => addOrderByModal("buy")}>
    {$_("trading.chartOrder.buy")}
  </button>
  <input
    type="number"
    name="volume"
    class="add-order-volume"
    bind:value={volume}
    on:keyup={volumeChange}
    on:focus={() => (volume = "")}
    on:blur={() => (volume = volume = "" ? 0 : volume)}
  />
  <button class="add-order-sell" on:click={() => addOrderByModal("sell")}>
    {$_("trading.chartOrder.sell")}
  </button>
  <div class="clearfix" />
  <div class="moove" />
</div>

<Dialog
  open={openOrderDialog}
  aria-labelledby="large-scroll-title"
  aria-describedby="large-scroll-content"
  surface$style="width: 1000px; max-width: calc(100vw - 32px);"
  on:SMUIDialog:closed={closeOrderDialogHandler}
>
  <Content id="mandatory-content" style="padding : 10px;">
    <TradingOrder on:closedialogorder={closeOrderDialogParent} {candleSeries} />
  </Content>
</Dialog>

<Dialog
  open={openOrderConfirm}
  aria-labelledby="mandatory-title"
  aria-describedby="mandatory-content"
  on:SMUIDialog:closed={closeOrderConfirmHandler}
>
  <Title id="event-title" class={oType}
    >[{String(oType).toUpperCase()}] {$_(
      "trading.chartOrder.dialog.confirmOrderTitle"
    )}
  </Title>
  <Content id="mandatory-content">
    <strong class="white"
      >{$_("trading.chartOrder.dialog.confirmOrder")}:</strong
    >
    {#if oType}{$_(`trading.chartOrder.dialog.${oType}`)}{/if}
    {parseFloat(volume).toFixed($assetpair.lot_decimals)}{base}
    {ordertype}?
  </Content>
  <Actions>
    <Button action="cancel">
      <Label>{$_("trading.chartOrder.dialog.canceled")}</Label>
    </Button>
    <Button action="confirm">
      <Label>{$_("trading.chartOrder.dialog.confirmed")}</Label>
    </Button>
  </Actions>
</Dialog>

<style>
  #trading-order-modal {
    position: absolute;
    width: 25%;
    bottom: 550px;
    left: 150px;
    z-index: 4;
  }
  #trading-order-modal .add-order-buy {
    font-weight: bold;
    float: left;
    outline: none;
    cursor: pointer;
    padding: 10px;
    margin: 0;
    background-color: #3d8300;
    border: 1px solid #4d4d4d;
    -webkit-border-top-left-radius: 5px;
    -webkit-border-bottom-left-radius: 5px;
    -moz-border-radius-topleft: 5px;
    -moz-border-radius-bottomleft: 5px;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    color: #cacaca;
  }
  #trading-order-modal .add-order-sell {
    font-weight: bold;
    float: left;
    outline: none;
    cursor: pointer;
    padding: 10px;
    margin: 0;
    background-color: #640000;
    border: 1px solid #4d4d4d;
    -webkit-border-top-right-radius: 5px;
    -webkit-border-bottom-right-radius: 5px;
    -moz-border-radius-topright: 5px;
    -moz-border-radius-bottomright: 5px;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    color: #cacaca;
  }
  #trading-order-modal .add-order-sell:hover {
    background-color: #642e2e;
  }
  #trading-order-modal .add-order-buy:hover {
    background-color: #5a8237;
  }
  #trading-order-modal input.add-order-volume {
    float: left;
    width: 80px;
    padding: 10px;
    border: 1px solid #4d4d4d;
    margin: 0;
    outline: none;
    background-color: #303030;
    color: #dedede;
    font-weight: bold;
    text-align: center;
  }
  #trading-order-modal input.add-order-volume:hover,
  #trading-order-modal input.add-order-volume:focus {
    background-color: #373737;
  }
  #trading-order-modal .more-params {
    display: none;
    text-align: center;
    font-size: 0.6em;
    cursor: pointer;
  }
  #trading-order-modal .more-params.displayMore {
    display: block;
  }
  #trading-order-modal .moove {
    display: block;
    height: 10px;
    width: 100%;
    cursor: move;
    background-color: transparent;
  }

  /* Modification boite de dialog */
  :global(.mdc-dialog__title.sell) {
    color: #fe1014 !important;
  }
  :global(.mdc-dialog__title.buy) {
    color: #6ddc09 !important;
  }
  :global(.mdc-dialog__title::before) {
    display: inline !important;
  }
  :global(.mdc-dialog .mdc-dialog__content) {
    padding-top: 10px !important;
  }
  .white {
    color: #dcdcdc;
  }

  .clearfix:after {
    content: "";
    display: block;
    clear: both;
  }
</style>

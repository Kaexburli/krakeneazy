<script>
  // ---------------------------------------------------------
  //  Imports
  // ---------------------------------------------------------
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";
  import { setPriceAlert } from "utils/userApi.js";
  import { assetpair, pricealertlist } from "store/store.js";
  import { toast } from "@zerodevx/svelte-toast";
  import { openModal, closeModal } from "svelte-modals";
  import ConfirmModal from "components/modal/ConfirmModal.svelte";

  // ---------------------------------------------------------
  //  Props
  // ---------------------------------------------------------
  export let User;
  export let currentPrice;

  let pricealert = "0.00",
    hasAlertForPair,
    chartblock = null,
    rightclickmenu = null,
    domLoaded = false;

  // ---------------------------------------------------------
  //  Methods Declarations
  // ---------------------------------------------------------
  const bootstrap = (readyState) => {
    if (["interactive", "complete"].includes(readyState)) {
      chartblock = document.querySelector(".chart-block");
      rightclickmenu = document.getElementById("rightclickmenu").style;
      domLoaded = true;
    }
  };

  /**
   * createAlertPrice
   ************************/
  const createAlertPrice = async (price, pair, currentPrice) => {
    let pushway = parseFloat(currentPrice) > parseFloat(price) ? "down" : "up";
    if (price >= 0) {
      if (!Object.prototype.hasOwnProperty.call($pricealertlist, pair)) {
        $pricealertlist[pair] = { up: [], down: [] };
        $pricealertlist[pair][pushway] = [price];
      } else {
        $pricealertlist[pair][pushway] = [
          ...$pricealertlist[pair][pushway],
          price,
        ];
      }

      await setPriceAlert($User.token, $pricealertlist);

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
      confirm: async () => {
        delete $pricealertlist[pair];
        await setPriceAlert($User.token, $pricealertlist);
        closeModal();
      },
      cancel: () => {
        closeModal();
      },
    });
  };

  /**
   * rigthClickMenu
   ************************/
  export const rigthClickMenu = (param, candleSeries) => {
    if (!chartblock || !rightclickmenu)
      console.debug("[ERROR] chartblock || rigthClickMenu");
    else {
      if (typeof param.point !== "undefined") {
        let price = candleSeries.coordinateToPrice(param.point.y);
        if (price) pricealert = price.toFixed($assetpair.pair_decimals);
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
   * Method onMount
   */
  onMount(async () => {
    bootstrap(document.readyState);
  });

  $: {
    if (
      Object.prototype.hasOwnProperty.call($pricealertlist, $assetpair.wsname)
    ) {
      hasAlertForPair =
        $pricealertlist[$assetpair.wsname]["up"].length >= 1
          ? true
          : $pricealertlist[$assetpair.wsname]["down"].length
          ? true
          : false;
    }
  }
</script>

<div id="rightclickmenu">
  <a
    href={"#"}
    on:click={createAlertPrice(pricealert, $assetpair.wsname, currentPrice)}
  >
    <i class="fa fa-bell">&nbsp;</i>
    {$_("home.chart.alert.createAlert")}
    <span id="pricealert">@{pricealert}</span>
  </a>
  {#if hasAlertForPair}
    <a href={"#"} on:click={removeAllAlertPrice($assetpair.wsname)}>
      <i class="fa fa-trash">&nbsp;</i>
      {$_("home.chart.alert.delAlerts")}
    </a>
  {/if}
</div>

<style>
  #rightclickmenu {
    visibility: hidden;
    z-index: 2;
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
</style>

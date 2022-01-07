<script>
  import { pricealertlist } from "store/store.js";
  import { tickeralert } from "store/wsstore.js";
  import { SvelteToast, toast } from "@zerodevx/svelte-toast";

  export let display = false;
  let isActive = false;
  let icon = isActive ? "fa-angle-double-right" : "fa-bell";
  let hasPriceAlert = Object.keys($pricealertlist).length > 1 ? true : false;

  const sendAlertPrice = (pair, price, way) => {
    let phraseAlert = `<h3 style="font-size:1.2em;color:#dedede;">Alerte de prix ! ${pair}</h3> Prix ${
      way === "up"
        ? '<strong style="color:#5b9208;"> au dessus de :</strong>'
        : '<strong style="color:#b90715;"> en dessous de :</strong>'
    } ${price}`;
    toast.push(phraseAlert, {
      initial: 0,
      next: 0,
      dismissable: true,
      // target: "new",
    });
  };

  $: if (
    typeof $tickeralert !== "undefined" &&
    typeof $pricealertlist !== "undefined" &&
    display
  ) {
    let pairs = Object.keys($pricealertlist);
    pairs.forEach((pair) => {
      if (
        typeof $tickeralert[pair] !== "undefined" &&
        $tickeralert[pair].hasOwnProperty("data")
      ) {
        if ($tickeralert[pair].data.hasOwnProperty("a")) {
          let tickerPrice = $tickeralert[pair].data["a"][0];
          let upList = $pricealertlist[pair]["up"];
          let downList = $pricealertlist[pair]["down"];

          upList.filter((upPrice) => {
            if (tickerPrice >= upPrice) {
              let index = upList.indexOf(upPrice);
              if (index > -1) {
                upList.splice(index, 1);
                $pricealertlist[pair]["up"] = [...upList];
              }
              sendAlertPrice(pair, upPrice, "up");
            }
          });

          downList.filter((downPrice) => {
            if (tickerPrice <= downPrice) {
              let index = downList.indexOf(downPrice);
              if (index > -1) {
                downList.splice(index, 1);
                $pricealertlist[pair]["down"] = [...downList];
              }
              sendAlertPrice(pair, downPrice, "down");
            }
          });
        }
      }
    });
  }

  const toogleBoxPriceAlert = () => {
    let paWrapper = document.querySelector(".pricealert-wrapper").style;
    isActive = !isActive;
    if (isActive) paWrapper.right = "0px";
    else if (!isActive) paWrapper.right = "-275px";
  };

  const handleRemoveClick = (way, index, pair) => {
    console.log("handleRemoveClick", way, index, pair);
    let list = $pricealertlist[pair][way];
    list.splice(index, 1);
    $pricealertlist[pair][way] = [...list];
  };

  $: if ($pricealertlist) {
    console.log($pricealertlist);
  }
</script>

{#if display && hasPriceAlert}
  <div class="pricealert-wrapper">
    <div class="pricealert-button" on:click={toogleBoxPriceAlert}>
      <span><i class="fa {icon}" /></span>
    </div>
    <div class="overflow">
      <h3>Alerts</h3>
      <div class="pricealert-container">
        {#each Object.entries($pricealertlist) as list}
          <div id="alert-{list[0]}">
            {#if Object.values(list[1]["up"]).length >= 1 || Object.values(list[1]["down"]).length >= 1}
              <span class="listpair">{list[0]}</span>
              {#if Object.values(list[1]["up"]).length >= 1}
                <ul class="alert-up">
                  {#each list[1]["up"] as up}
                    <li data-index={list[1]["up"].indexOf(up)}>
                      <i class="fa fa-level-up-alt" />
                      Alert prix au dessus de: {up}
                      <span
                        class="remove right"
                        on:click={handleRemoveClick(
                          "up",
                          list[1]["up"].indexOf(up),
                          list[0]
                        )}><i class="fa fa-trash" /></span
                      >
                    </li>
                  {/each}
                </ul>
              {/if}
              {#if Object.values(list[1]["down"]).length >= 1}
                <ul class="alert-down">
                  {#each list[1]["down"] as down}
                    <li data-index={list[1]["down"].indexOf(down)}>
                      <i class="fa fa-level-down-alt" />
                      Alert prix en dessous de: {down}
                      <span
                        class="remove right"
                        on:click={handleRemoveClick(
                          "down",
                          list[1]["down"].indexOf(down),
                          list[0]
                        )}><i class="fa fa-trash" /></span
                      >
                    </li>
                  {/each}
                </ul>
              {/if}
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else}
  <SvelteToast />
  <div class="wrap">
    <SvelteToast target="new" />
  </div>
{/if}

<style>
  .pricealert-wrapper {
    position: fixed;
    z-index: 9;
    top: 50px;
    right: -275px;
    width: 275px;
    background-color: #242424;
    border: 1px solid #2c2c2c;
    transition: 1s;
  }
  .pricealert-wrapper h3 {
    background-color: #1e1e1e;
    margin: 0;
    padding: 10px;
    border-bottom: 1px solid #282828;
    color: brown;
    font-size: 1em;
  }
  .pricealert-wrapper .overflow {
    height: 600px;
    overflow: hidden;
  }
  .pricealert-button {
    height: 44px;
    text-align: center;
    vertical-align: middle;

    transition: 1s;
    cursor: pointer;
    color: brown;
    position: absolute;
    top: -1px;
    left: -25px;
    background: rgb(28, 28, 28);
    background: linear-gradient(
      90deg,
      rgba(28, 28, 28, 1) 0%,
      rgba(25, 25, 25, 1) 35%,
      rgba(30, 30, 30, 1) 100%
    );
    padding: 5px;
    border-left: 1px solid #282828;
    border-bottom: 1px solid #2c2c2c;
    border-top: 1px solid #2c2c2c;
    -webkit-border-top-left-radius: 5px;
    -webkit-border-bottom-left-radius: 5px;
    -moz-border-radius-topleft: 5px;
    -moz-border-radius-bottomleft: 5px;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }
  .pricealert-button i {
    margin-top: 7px;
  }
  .pricealert-container {
    padding: 10px;
    color: white;
    font-size: 0.8em;
    overflow-y: auto;
    height: 100%;
  }
  .pricealert-container .listpair {
    font-weight: bold;
  }
  .pricealert-container .alert-up,
  .pricealert-container .alert-down {
    color: #919191;
  }
  .pricealert-container .alert-up i {
    color: #50b300;
  }
  .pricealert-container .alert-down i {
    color: #b30000;
  }
  .pricealert-container .alert-up .remove i,
  .pricealert-container .alert-down .remove i {
    color: #505050;
    cursor: pointer;
  }
  .pricealert-container .alert-up .remove i:hover,
  .pricealert-container .alert-down .remove i:hover {
    color: #888888;
  }
  .wrap {
    --toastContainerTop: 0.2rem;
    --toastContainerRight: 0.5rem;
    --toastContainerBottom: auto;
    --toastContainerLeft: 0.5rem;
    --toastWidth: 50%;
    --toastMinHeight: 2rem;
    --toastPadding: 0 0.5rem;
    font-size: 0.875rem;
  }
  @media (min-width: 40rem) {
    .wrap {
      --toastContainerRight: auto;
      --toastContainerLeft: calc(50vw - 20rem);
      --toastWidth: 40rem;
    }
  }
</style>

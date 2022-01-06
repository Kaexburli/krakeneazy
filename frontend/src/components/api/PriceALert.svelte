<script>
  import { pricealertlist } from "store/store.js";
  import { tickeralert } from "store/wsstore.js";
  import { SvelteToast, toast } from "@zerodevx/svelte-toast";

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
    typeof $pricealertlist !== "undefined"
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
</script>

<SvelteToast />
<div class="wrap">
  <SvelteToast target="new" />
</div>

<style>
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

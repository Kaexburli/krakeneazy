<script>
  import { onMount } from "svelte";
  import { online, assetpair } from "store/store.js";
  import { wsticker } from "store/wsticker.js";
  import { BarLoader } from "svelte-loading-spinners";

  let ticker;

  onMount(() => {
    wsticker.subscribe((tick) => {
      if (typeof tick !== "undefined" && Object.keys(tick).length > 1)
        ticker = tick;
    });
  });

  let spread;
  let quote = $assetpair.quote;
  let decimals = $assetpair.pair_decimals;

  $: {
    if (typeof ticker !== "undefined") {
      spread = (ticker["a"][0] - ticker["b"][0]).toFixed(decimals);
    }
  }
</script>

<div class="tick-block">
  {#if typeof ticker !== "undefined"}
    <div class="tick ask-tick">
      <h3>Vente</h3>
      <span class="label">Offre de vente : </span>{Number(
        ticker["a"][0]
      ).toFixed(decimals)}&nbsp;{quote}
      <br />
      <span class="label">Volume total : </span>{ticker["a"][1]} <br />
      <span class="label">Volume du lot : </span>{ticker["a"][2]}
    </div>
    <div class="tick close-tick">
      <h3>Prix actuel</h3>
      <span class="label">Prix : </span>{Number(ticker["c"][0]).toFixed(
        decimals
      )}&nbsp;{quote}
      <br />
      <span class="label">Volume total : </span>{ticker["c"][1]} <br />
      <span class="label">Spread : </span>{spread}
    </div>
    <div class="tick bid-tick">
      <h3>Achat</h3>
      <span class="label">Offre d'achat : </span>{Number(
        ticker["b"][0]
      ).toFixed(decimals)}&nbsp;{quote} <br />
      <span class="label">Volume total : </span>{ticker["b"][1]} <br />
      <span class="label">Volume du lot : </span>{ticker["b"][2]}
    </div>
    <div class="tick volume-tick">
      <h3>Volume</h3>
      <span class="label">Aujourd'hui : </span>{ticker["v"][0]} <br />
      <span class="label">Dernière 24H : </span>{ticker["v"][1]}
    </div>
    <div class="tick vwap-tick">
      <h3>VWAP</h3>
      <span class="label">Aujourd'hui : </span>{Number(ticker["p"][0]).toFixed(
        decimals
      )}&nbsp;{quote} <br />
      <span class="label">Dernière 24H : </span>{Number(ticker["p"][1]).toFixed(
        decimals
      )}&nbsp;{quote}
    </div>
    <div class="tick trade-tick">
      <h3>Nombre de trades</h3>
      <span class="label">Aujourd'hui : </span>{ticker["t"][0]} <br />
      <span class="label">Dernière 24H : </span>{ticker["t"][1]}
    </div>
    <div class="tick low-tick">
      <h3>Plus bas prix</h3>
      <span class="label">Aujourd'hui : </span>{Number(ticker["l"][0]).toFixed(
        decimals
      )}&nbsp;{quote} <br />
      <span class="label">Dernière 24H : </span>{Number(ticker["l"][1]).toFixed(
        decimals
      )}&nbsp;{quote}
    </div>
    <div class="tick hight-tick">
      <h3>Plus haut prix</h3>
      <span class="label">Aujourd'hui : </span>{Number(ticker["h"][0]).toFixed(
        decimals
      )}&nbsp;{quote} <br />
      <span class="label">Dernière 24H : </span>{Number(ticker["h"][1]).toFixed(
        decimals
      )}&nbsp;{quote}
    </div>
    <div class="tick open-tick">
      <h3>Prix d'ouverture</h3>
      <span class="label">Aujourd'hui : </span>{Number(ticker["o"][0]).toFixed(
        decimals
      )}&nbsp;{quote} <br />
      <span class="label">Dernière 24H : </span>{Number(ticker["h"][1]).toFixed(
        decimals
      )}&nbsp;{quote}
    </div>
  {:else if $online}
    <BarLoader size="400" color="#e8e8e8" unit="px" duration="1s" />
  {/if}
</div>

<style>
  .tick-block {
    background-color: #212121;
    padding: 5px 10px;
    border: 1px solid #181818;

    display: flex;
    flex-wrap: wrap;
  }
  .tick-block h3 {
    background-color: darkgrey;
    color: #222222;
    padding: 5px;
    margin: -10px -10px 5px -10px;
    font-size: 1.1em;
  }
  .tick {
    margin: 5px;
    padding: 10px;
    width: 158px;
    background-color: #282828;
    font-size: 0.8em;
  }
  .tick .label {
    color: brown;
  }
  .ask-tick h3 {
    background-color: firebrick;
  }
  .bid-tick h3 {
    background-color: darkgreen;
  }
  .close-tick h3 {
    background-color: darkslategrey;
  }
</style>

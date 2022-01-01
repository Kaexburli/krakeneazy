<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  import { wssurl, online } from "store/store.js";
  import websocketStore from "svelte-websocket-store";
  import { owntrades } from "store/wsstore.js";
  import formatDate from "utils/formatDate.js";
  import { SyncLoader } from "svelte-loading-spinners";

  let error = false;

  // Appel Websocket
  let wss_owntrades;
  wssurl.subscribe((server) => (wss_owntrades = server + "/owntrades"));
  const wsOwnTrades = websocketStore(wss_owntrades);
  // Appel Websocket

  onMount(() => {
    wsOwnTrades.subscribe((tick) => {
      if (!$online) {
        error = true;
        return false;
      } else if (
        typeof tick !== "undefined" &&
        tick.hasOwnProperty("errorMessage")
      ) {
        error = "[" + tick.subscription.name + "] " + tick.errorMessage;
      } else if (typeof tick !== "undefined" && Object.keys(tick).length >= 1) {
        owntrades.set(tick.data);
      }
    });
  });
</script>

<div class="block owntrades">
  <h4>Transactions</h4>
  <table class="flex-table flex-fixhead-table">
    <thead>
      <tr>
        <!-- <th>TXID</th> -->
        <th>Type</th>
        <th>Date</th>
        <th>Paire</th>
        <th>Coût</th>
        <!-- <th>Order ID</th> -->
        <!-- <th>Status</th> -->
        <!-- <th>Pos ID</th> -->
        <th>Prix</th>
        <th>Volume</th>
        <th>Frais</th>
      </tr>
    </thead>
    <tbody>
      {#if error && typeof error !== "boolean"}
        <span class="error">{error}</span>
      {/if}
      {#if typeof $owntrades !== "undefined" && $owntrades.length === 0 && !error}
        <SyncLoader size="30" color="#e8e8e8" unit="px" duration="1s" />
      {:else if typeof $owntrades !== "undefined" && $owntrades.length > 0 && $owntrades}
        {#each $owntrades as el, i}
          <tr id={Object.keys(el)} transition:fade>
            <td data-label="Type" class={el[Object.keys(el)]["type"]}>
              <div classe="type">
                {#if el[Object.keys(el)]["type"] === "buy"}
                  <span class="buy">Acheter</span>
                  <span class="ordertype">
                    {el[Object.keys(el)]["ordertype"]}
                  </span>
                {:else}
                  <span class="sell">Vendre</span>
                  <span class="ordertype">
                    {el[Object.keys(el)]["ordertype"]}
                  </span>
                {/if}
              </div>
            </td>
            <td data-label="Date/Heure d'ouverture">
              <div class="Date">
                <span class="block">
                  {formatDate(el[Object.keys(el)]["time"], "D")}
                </span>
                <span class="hour">
                  ({formatDate(el[Object.keys(el)]["time"], "H")})
                </span>
              </div>
            </td>
            <td data-label="Paire">
              <span class="currency">{el[Object.keys(el)]["pair"]}</span>
            </td>
            <td data-label="Coût">
              <div class="cost">
                <span class="block">{el[Object.keys(el)]["cost"]}</span>
                <span class="currency"
                  >{el[Object.keys(el)]["pair"].split("/")[1]}</span
                >
              </div>
            </td>
            <!-- <td data-label="Order ID"
              >{String(
                el[Object.keys(el)]["ordertxid"]
              ).substr(0, 6)}</td
            > -->
            <!-- <td data-label="Poss Status"
              >{el[Object.keys(el)]["posstatus"]}</td
            > -->
            <!-- <td data-label="Pos TXID"
              >{String(
                el[Object.keys(el)]["postxid"]
              ).substr(0, 6)}</td
            > -->
            <td data-label="Prix">
              <div class="price">
                <span class="block">{el[Object.keys(el)]["price"]}</span>
                <span class="currency"
                  >{el[Object.keys(el)]["pair"].split("/")[1]}</span
                >
              </div>
            </td>
            <td data-label="Volume">
              <div class="volume">
                <span class="block">{el[Object.keys(el)]["vol"]}</span>
                <span class="currency"
                  >{el[Object.keys(el)]["pair"].split("/")[0]}</span
                >
              </div>
            </td>
            <td data-label="Frais">
              <div class="total-fee">
                <span class="fee">
                  <span class="label">Fee:</span>{el[Object.keys(el)][
                    "fee"
                  ]}</span
                >
                <span class="margin_fee">
                  <span class="label">Margin:</span>{el[Object.keys(el)][
                    "margin"
                  ]}</span
                >
              </div>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
  {#if typeof $owntrades !== "undefined" && $owntrades.length > 0 && $owntrades}
    <div class="pagination">
      <span class="prev">
        <i class="fa fa-caret-square-left" />
      </span>
      <span class="total">compteur</span>
      <span class="next">
        <i class="fa fa-caret-square-right" />
      </span>
    </div>
  {/if}
</div>

<style>
  .owntrades h4 {
    background-color: #3a3a3a;
    padding: 5px;
    border: 1px solid #222222;
    color: #c7c7c7;
    font-size: 0.9em;
    font-weight: inherit;
  }
  .owntrades .total-fee {
    font-size: 1em;
  }
  .owntrades .fee {
    display: inline-block;
  }
  .owntrades .margin_fee {
    display: inline-block;
  }
  .owntrades .hour {
    font-size: 0.8em;
    color: #858585;
  }
  .owntrades td.buy {
    border-left: 3px solid rgb(83 104 50);
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid rgb(37 46 24);
    background: #242424;
    padding: 15px 0 15px 10px;
  }
  .owntrades td.sell {
    border-left: 3px solid #8d2525;
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid #3e2626;
    background: #242424;
    padding: 15px 0 15px 10px;
  }
  .owntrades .buy {
    color: rgb(83 104 50);
    display: inline-block;
    text-transform: uppercase;
  }
  .owntrades .sell {
    color: #8d2525;
    display: inline-block;
    text-transform: uppercase;
  }
  .owntrades .ordertype {
    color: #5c5c5c;
    display: inline-block;
    border: 1px solid #242424;
    background-color: #222222;
    text-align: center;
    font-weight: bold;
    font-size: 0.8em;
    margin-left: 3px;
    padding: 0 3px;
    text-transform: none;
  }
  .owntrades .label {
    text-transform: capitalize;
    font-style: italic;
    margin-right: 5px;
    cursor: unset;
    font-weight: 400;
  }
  .owntrades .currency {
    color: #555555;
  }
  .owntrades .block {
    display: block;
  }
  /* .owntrades .badge-closed {
    .owntrades .badge-canceled {
      padding: 5px;
      color: #ffa2a2;
      background-color: #442929;
      border: 1px dotted #1e1e1e;
      text-transform: capitalize;
    }
    color: #a3a3a3;
    background-color: #222222;
    border: 1px dotted #1e1e1e;
    text-transform: capitalize;
    padding: 7px 12px;
  }
  .owntrades .hidden {
    display: none;
    visibility: hidden;
  } */

  .pagination {
    background-color: #141414;
    padding: 10px;
    text-align: right;
  }
  .pagination .prev {
    margin: 0 5px;
    cursor: pointer;
  }
  .pagination .next {
    margin: 0 5px;
    cursor: pointer;
  }

  .pagination .prev:hover {
    color: #3a3a3a;
  }
  .pagination .next:hover {
    color: #3a3a3a;
  }
</style>

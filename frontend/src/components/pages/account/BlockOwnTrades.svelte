<script>
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  import { online } from "store/store.js";
  import { owntrades } from "store/wsstore.js";
  import formatDate from "utils/formatDate.js";
  import { SyncLoader } from "svelte-loading-spinners";

  let error = false,
    count = 0,
    owntradesdata = false;

  onMount(() => {
    owntrades.subscribe((tick) => {
      if (!$online) {
        error = true;
        return false;
      } else if (
        typeof tick !== "undefined" &&
        tick.hasOwnProperty("errorMessage")
      ) {
        error = "[" + tick.subscription.name + "] " + tick.errorMessage;
      } else if (typeof tick !== "undefined" && Object.keys(tick).length >= 1) {
        if (tick.service === "OwnTrades" && tick.data)
          owntradesdata = tick.data;
      }
    });
  });
</script>

<div class="block owntrades">
  <h4>{$_("account.ownTrades.title")}</h4>
  <table class="flex-table flex-fixhead-table">
    <thead>
      <tr>
        <th>{$_("account.ownTrades.type")}</th>
        <th>{$_("account.ownTrades.date")}</th>
        <th>{$_("account.ownTrades.pair")}</th>
        <th>{$_("account.ownTrades.cost")}</th>
        <th>{$_("account.ownTrades.price")}</th>
        <th>{$_("account.ownTrades.volume")}</th>
        <th>{$_("account.ownTrades.fees")}</th>
      </tr>
    </thead>
    <tbody>
      {#if error && typeof error !== "boolean"}
        <span class="error">{error}</span>
      {/if}
      {#if typeof owntradesdata !== "undefined" && owntradesdata.length === 0 && !error}
        <SyncLoader size="30" color="#e8e8e8" unit="px" duration="1s" />
      {:else if typeof owntradesdata !== "undefined" && owntradesdata.length > 0 && owntradesdata}
        {#each owntradesdata as el, i}
          <tr id={Object.keys(el)} transition:fade>
            <td
              data-label={$_("account.ownTrades.type")}
              class={el[Object.keys(el)]["type"]}
            >
              <div classe="type">
                {#if el[Object.keys(el)]["type"] === "buy"}
                  <span class="buy">{$_("account.ownTrades.buy")}</span>
                  <span class="ordertype">
                    {el[Object.keys(el)]["ordertype"]}
                  </span>
                {:else}
                  <span class="sell">{$_("account.ownTrades.sell")}</span>
                  <span class="ordertype">
                    {el[Object.keys(el)]["ordertype"]}
                  </span>
                {/if}
              </div>
            </td>
            <td data-label={$_("account.ownTrades.date")}>
              <div class="Date">
                <span class="block">
                  {formatDate(el[Object.keys(el)]["time"], "D")}
                </span>
                <span class="hour">
                  ({formatDate(el[Object.keys(el)]["time"], "H")})
                </span>
              </div>
            </td>
            <td data-label={$_("account.ownTrades.pair")}>
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
            <td data-label={$_("account.ownTrades.price")}>
              <div class="price">
                <span class="block">{el[Object.keys(el)]["price"]}</span>
                <span class="currency"
                  >{el[Object.keys(el)]["pair"].split("/")[1]}</span
                >
              </div>
            </td>
            <td data-label={$_("account.ownTrades.volume")}>
              <div class="volume">
                <span class="block">{el[Object.keys(el)]["vol"]}</span>
                <span class="currency"
                  >{el[Object.keys(el)]["pair"].split("/")[0]}</span
                >
              </div>
            </td>
            <td data-label={$_("account.ownTrades.fees")}>
              <div class="total-fee">
                <span class="fee">
                  <span class="label"
                    >{$_("account.ownTrades.fees")} :
                  </span>{el[Object.keys(el)]["fee"]}</span
                >
                <span class={$_("account.ownTrades.fees")}>
                  <span class="label"
                    >{$_("account.ownTrades.marginFee")} :
                  </span>{el[Object.keys(el)]["margin"]}</span
                >
              </div>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
  {#if typeof owntradesdata !== "undefined" && owntradesdata.length > 0 && owntradesdata}
    <div class="pagination">
      <span class="prev">
        <i class="fa fa-caret-square-left" />
      </span>
      <span class="total">1 - 50 sur {count}</span>
      {count / 50}
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

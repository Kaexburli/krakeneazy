<script>
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  import UserData from "classes/UserData.js";
  import formatDate from "utils/formatDate.js";
  import { online, tradeshistorydata } from "store/store.js";
  import { SyncLoader } from "svelte-loading-spinners";

  const ud = new UserData();

  let error = false,
    tradeshistory = false,
    tradeshistory_store = false,
    count = false,
    life = 300; // Secondes

  const get__store = (store) => {
    let $val;
    store.subscribe(($) => ($val = $))();
    return $val;
  };

  const GetTradesHistory = async () => {
    try {
      if (!$online) {
        error = true;
        return false;
      }

      tradeshistory_store = get__store(tradeshistorydata);

      if (tradeshistory_store) {
        let expired =
          parseInt(Date.now() / 1000) - tradeshistory_store.time > life;
        if (!expired) return (tradeshistory = tradeshistory_store.data);
      }

      //  FINIR LA PAGINATION ET VOIR LES PARAMS
      const res = await ud.getTradesHistory({
        start: 1,
        end: 10,
        ofs: 0,
      });

      if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
        error = res.error;
      } else {
        let json = {
          data: Object.entries(res.trades),
          time: parseInt(Date.now() / 1000),
        };

        tradeshistory = Object.entries(res.trades);
        tradeshistorydata.set(json);
        count = res.count;
        error = false;
      }
    } catch (error) {
      console.error("[ERROR]:", error);
    }
  };

  onMount(async () => {
    try {
      await GetTradesHistory();
    } catch (error) {
      console.error("[ERROR]:", error);
    }
  });
</script>

<div class="block tradeshistory">
  <h4>{$_("account.tradesHistory.title")}</h4>
  <table class="flex-table flex-fixhead-table">
    <thead>
      <tr>
        <th>{$_("account.tradesHistory.type")}</th>
        <th>{$_("account.tradesHistory.date")}</th>
        <th>{$_("account.tradesHistory.pair")}</th>
        <th>{$_("account.tradesHistory.cost")}</th>
        <th>{$_("account.tradesHistory.price")}</th>
        <th>{$_("account.tradesHistory.volume")}</th>
        <th>{$_("account.tradesHistory.fees")}</th>
      </tr>
    </thead>
    <tbody>
      {#if error && typeof error !== "boolean"}
        <span class="error">{error}</span>
      {/if}
      {#if !tradeshistory && !error}
        <SyncLoader size="30" color="#e8e8e8" unit="px" duration="1s" />
      {:else if tradeshistory}
        {#each tradeshistory as trade, i}
          <tr id={trade[0]} transition:fade>
            <td
              data-label={$_("account.tradesHistory.type")}
              class={trade[1]["type"]}
            >
              <div classe="type">
                {#if trade[1]["type"] === "buy"}
                  <span class="buy">{$_("account.tradesHistory.buy")}</span>
                  <span class="ordertype">
                    {trade[1]["ordertype"]}
                  </span>
                {:else}
                  <span class="sell">{$_("account.tradesHistory.sell")}</span>
                  <span class="ordertype">
                    {trade[1]["ordertype"]}
                  </span>
                {/if}
              </div>
            </td>
            <td data-label={$_("account.tradesHistory.date")}>
              <div class="Date">
                <span class="block">
                  {formatDate(trade[1]["time"], "D")}
                </span>
                <span class="hour">
                  ({formatDate(trade[1]["time"], "H")})
                </span>
              </div>
            </td>
            <td data-label={$_("account.tradesHistory.pair")}>
              <span class="currency">{trade[1]["pair"]}</span>
            </td>
            <td data-label={$_("account.tradesHistory.cost")}>
              <div class="cost">
                <span class="block">{trade[1]["cost"]}</span>
              </div>
            </td>
            <td data-label={$_("account.tradesHistory.price")}>
              <div class="price">
                <span class="block">{trade[1]["price"]}</span>
              </div>
            </td>
            <td data-label={$_("account.tradesHistory.volume")}>
              <div class="volume">
                <span class="block">{trade[1]["vol"]}</span>
              </div>
            </td>
            <td data-label={$_("account.tradesHistory.fees")}>
              <div class="total-fee">
                <span class="fee">
                  <span class="label">{$_("account.tradesHistory.fees")}:</span
                  >{trade[1]["fee"]}</span
                >
                <span class="margin_fee">
                  <span class="label"
                    >{$_("account.tradesHistory.marginFee")}:</span
                  >{trade[1]["margin"]}</span
                >
              </div>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
  {#if tradeshistory}
    <div class="pagination">
      <span class="total">1 - 50 sur {count}</span>
      {count / 50}
      <span class="prev">
        <i class="fa fa-caret-square-left" />
      </span>
      <span class="next">
        <i class="fa fa-caret-square-right" />
      </span>
    </div>
  {/if}
</div>

<style>
  .tradeshistory h4 {
    background-color: #3a3a3a;
    padding: 5px;
    border: 1px solid #222222;
    color: #c7c7c7;
    font-size: 0.9em;
    font-weight: inherit;
  }
  .tradeshistory td.first {
    border-left: 5px solid #181818;
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid #2c2c2c;
    background: #242424;
    padding: 15px 0 15px 10px;
  }
  .tradeshistory td.buy {
    border-left: 3px solid rgb(83 104 50);
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid rgb(37 46 24);
    background: #242424;
    padding: 15px 0 15px 10px;
  }
  .tradeshistory td.sell {
    border-left: 3px solid #8d2525;
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid #3e2626;
    background: #242424;
    padding: 15px 0 15px 10px;
  }
  .tradeshistory .buy {
    color: rgb(83 104 50);
    text-transform: uppercase;
  }
  .tradeshistory .sell {
    color: #8d2525;
    text-transform: uppercase;
  }
  .tradeshistory .ordertype {
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
  .tradeshistory .total-fee {
    font-size: 1em;
  }
  .tradeshistory .fee {
    display: inline-block;
  }
  .tradeshistory .margin_fee {
    display: inline-block;
  }
  .tradeshistory .hour {
    font-size: 0.8em;
    color: #858585;
  }
  .tradeshistory .label {
    text-transform: capitalize;
    font-style: italic;
    margin-right: 5px;
    cursor: unset;
    font-weight: 400;
  }
  .tradeshistory .currency {
    color: #555555;
  }
  .tradeshistory .block {
    display: block;
  }
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

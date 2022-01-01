<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  import UserData from "classes/UserData.js";
  import formatDate from "utils/formatDate.js";
  import { online, closedordersdata } from "store/store.js";
  import { SyncLoader } from "svelte-loading-spinners";
  import TooltipIcon from "components/TooltipIcon.svelte";

  let error = false;
  let closedorders = false;
  let closedorders_store = false;
  let limit = 0;
  let count = false;
  let life = 300; // Secondes

  const get__store = (store) => {
    let $val;
    store.subscribe(($) => ($val = $))();
    return $val;
  };

  const GetClosedOrders = async () => {
    try {
      if (!$online) {
        error = true;
        return false;
      }

      closedorders_store = get__store(closedordersdata);

      if (closedorders_store) {
        let expired =
          parseInt(Date.now() / 1000) - closedorders_store.time > life;
        if (!expired) return (closedorders = closedorders_store.data);
      }
      const ud = new UserData();
      const res = await ud.getClosedOrders({
        trades: true,
        start: 1,
        end: 10,
        ofs: 0,
      });

      if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
        error = res.error;
        if (limit < 5) {
          GetClosedOrders();
          limit++;
        }
      } else {
        let json = {
          data: Object.entries(res.closed),
          time: parseInt(Date.now() / 1000),
        };

        closedorders = Object.entries(res.closed);
        closedordersdata.set(json);
        count = res.count;
        error = false;
      }
    } catch (error) {
      console.log(error);
    }
  };

  let canceled_hidden = false;
  const handleClickCanceled = (event) => {
    event.target.parentNode.style.color = canceled_hidden
      ? "#c7c7c7"
      : "#222222";

    var canceled_elements = document.querySelectorAll(".tr-canceled");
    canceled_elements.forEach((element) => {
      if (!canceled_hidden) element.classList.add("hidden");
      if (canceled_hidden) element.classList.remove("hidden");
    });
    canceled_hidden = !canceled_hidden;
  };

  let closed_hidden = false;
  const handleClickClosed = (event) => {
    event.target.parentNode.style.color = closed_hidden ? "#c7c7c7" : "#222222";

    var closed_elements = document.querySelectorAll(".tr-closed");
    closed_elements.forEach((el) => {
      if (!closed_hidden) el.classList.add("hidden");
      if (closed_hidden) el.classList.remove("hidden");
    });
    closed_hidden = !closed_hidden;
  };

  onMount(() => {
    GetClosedOrders();
  });
</script>

<div class="block closed-orders">
  <h4>
    Fermés
    <span class="actions-table">
      <span class="canceled-choice-btn" on:click={handleClickCanceled}>
        <TooltipIcon tooltip="Cacher/Afficher les ordres annulées" icon="ban" />
      </span>
      <span class="closed-choice-btn" on:click={handleClickClosed}>
        <TooltipIcon
          tooltip="Cacher/Afficher les ordres fermés"
          icon="door-closed"
        />
      </span>
    </span>
  </h4>
  <table class="flex-table flex-fixhead-table">
    <thead>
      <tr>
        <th>Type</th>
        <th>Date</th>
        <th>Paire</th>
        <th>Prix</th>
        <th>Volume</th>
        <th>Coût</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#if error && typeof error !== "boolean"}
        <span class="error">{error}</span>
      {/if}
      {#if !closedorders && !error}
        <SyncLoader size="30" color="#e8e8e8" unit="px" duration="1s" />
      {:else if closedorders}
        {#each closedorders as el, i}
          <tr id={el[0]} transition:fade class="tr-{el[1]['status']}">
            <td data-label="Type" class={el[1]["descr"]["type"]}>
              {#if el[1]["descr"]["type"] === "buy"}
                <span class="buy">Acheter</span>
              {:else}
                <span class="sell">Vendre</span>
              {/if}
            </td>
            <td data-label="Heure d'ouverture">
              <div class="Date">
                {formatDate(el[1]["opentm"], "D")}
                <span class="hour">
                  ({formatDate(el[1]["opentm"], "H")})
                </span>
              </div>
            </td>
            <td data-label="Asset">
              <span class="currency">{el[1]["descr"]["pair"]}</span>
            </td>
            <td data-label="Prix">
              {el[1]["descr"]["price"]}
            </td>
            <td data-label="Volume">
              <div class="volume">
                <div>
                  <span class="price-little">
                    {el[1]["vol"]}
                  </span>
                </div>
                <div>
                  <span class="price-little">
                    ({el[1]["vol_exec"]})
                  </span>
                </div>
              </div>
            </td>
            <td data-label="Coût">
              {#if Number(el[1]["cost"]) <= 0}
                {parseFloat(el[1]["cost"]).toFixed(4)}
              {:else}
                {el[1]["cost"]}
              {/if}
            </td>
            <td data-label="Status">
              <span class="badge-{el[1]['status']}">
                {el[1]["status"]}
              </span>
            </td>
            <td data-label="Actions">
              <span class="icon actions"><i class="fas fa-cog" /></span>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
  {#if closedorders}
    <div class="pagination">
      <span class="prev">
        <i class="fa fa-caret-square-left" />
      </span>
      <span class="total">{count}</span>
      <span class="next">
        <i class="fa fa-caret-square-right" />
      </span>
    </div>
  {/if}
</div>

<style>
  .closed-orders h4 {
    background-color: #3a3a3a;
    padding: 5px;
    border: 1px solid #222222;
    color: #c7c7c7;
    font-size: 0.9em;
    font-weight: inherit;
  }
  .closed-orders h4 .actions-table {
    float: right;
    margin-right: 30px;
  }
  .closed-orders .hour {
    font-size: 0.8em;
    color: #858585;
  }
  .closed-orders td.buy {
    border-left: 3px solid rgb(83 104 50);
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid rgb(37 46 24);
    background: #242424;
    padding: 15px 0 15px 10px;
  }
  .closed-orders td.sell {
    border-left: 3px solid #8d2525;
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid #3e2626;
    background: #242424;
    padding: 15px 0 15px 10px;
  }
  .closed-orders .buy {
    color: rgb(83 104 50);
    text-transform: uppercase;
  }
  .closed-orders .sell {
    color: #8d2525;
    text-transform: uppercase;
  }
  .closed-orders .currency {
    color: #555555;
  }
  .closed-orders .badge-canceled {
    padding: 5px;
    color: #ffa2a2;
    background-color: #442929;
    border: 1px dotted #1e1e1e;
    text-transform: capitalize;
  }
  .closed-orders .canceled-choice-btn {
    cursor: pointer;
    float: right;
    margin: 0 5px;
  }
  .closed-orders .closed-choice-btn {
    cursor: pointer;
    float: right;
    margin: 0 5px;
  }
  .closed-orders .badge-closed {
    color: #a3a3a3;
    background-color: #222222;
    border: 1px dotted #1e1e1e;
    text-transform: capitalize;
    padding: 7px 12px;
  }
  .closed-orders .hidden {
    display: none;
    visibility: hidden;
  }
  .closed-orders .actions {
    cursor: pointer;
  }

  .closed-orders .price-little {
    font-size: 0.8em;
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

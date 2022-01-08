<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  import UserData from "classes/UserData.js";
  import formatDate from "utils/formatDate.js";
  import { online, asymbole, ledgersdata } from "store/store.js";
  import { SyncLoader } from "svelte-loading-spinners";

  const ud = new UserData();

  let error = false;
  let ledgers = false;
  let ledgers_store = false;
  let limit = 0;
  let count = false;
  let life = 300; // Secondes

  const type_label = {
    margin: "Levier",
    rollover: "Rollover",
    trade: "Trader",
    staking: "Financement",
  };

  const get__store = (store) => {
    let $val;
    store.subscribe(($) => ($val = $))();
    return $val;
  };

  const GetLedgers = async () => {
    try {
      if (!$online) {
        error = true;
        return false;
      }

      ledgers_store = get__store(ledgersdata);

      if (ledgers_store) {
        let expired = parseInt(Date.now() / 1000) - ledgers_store.time > life;
        if (!expired) return (ledgers = ledgers_store.data);
      }

      //  FINIR LA PAGINATION ET VOIR LES PARAMS
      const res = await ud.getLedgers({
        start: 1,
        end: 10,
        ofs: 0,
      });

      if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
        error = res.error;
        if (limit < 5) {
          GetLedgers();
          limit++;
        }
      } else {
        if (res && typeof res !== "undefined") {
          let json = {
            data: Object.entries(res.ledger),
            time: parseInt(Date.now() / 1000),
          };

          ledgers = Object.entries(res.ledger);
          ledgersdata.set(json);
          count = res.count;
          error = false;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  onMount(async () => {
    await GetLedgers();
  });
</script>

<div class="block ledgers">
  <h4>Registre</h4>
  <table class="flex-table flex-fixhead-table">
    <thead>
      <tr>
        <th>Ref id</th>
        <th>Date</th>
        <th>Type</th>
        <th>Paire</th>
        <th>Montant</th>
        <th>Frais</th>
        <th>Solde</th>
      </tr>
    </thead>
    <tbody>
      {#if error && typeof error !== "boolean"}
        <span class="error">{error}</span>
      {/if}
      {#if !ledgers && !error}
        <SyncLoader size="30" color="#e8e8e8" unit="px" duration="1s" />
      {:else if typeof ledgers !== "undefined" && ledgers}
        {#each ledgers as ledger, i}
          <tr id={ledger[0]} transition:fade>
            <td data-label="Ref id" class="first">
              {String(ledger[1]["refid"]).substr(0, 12)}
            </td>
            <td data-label="Date/Heure d'ouverture">
              <div class="Date">
                <span class="block">{formatDate(ledger[1]["time"], "D")}</span>
                <span class="hour">
                  ({formatDate(ledger[1]["time"], "H")})
                </span>
              </div>
            </td>
            <td data-label="Type">
              <span class={ledger[1]["type"]}>
                {type_label[ledger[1]["type"]]}
              </span>
            </td>
            <td data-label="Paire">
              <span class="currency">{ledger[1]["asset"]}</span>
            </td>
            <td data-label="Montant">
              <div>
                <span class="block">{ledger[1]["amount"]}</span>
                <span class="currency">
                  {#if typeof $asymbole[ledger[1]["asset"]] !== "undefined"}
                    {$asymbole[ledger[1]["asset"]]["name"]}
                  {/if}
                </span>
              </div>
            </td>
            <td data-label="Frais">
              <div>
                <span class="block">{ledger[1]["fee"]}</span>
                <span class="currency">
                  {#if typeof $asymbole[ledger[1]["asset"]] !== "undefined"}
                    {$asymbole[ledger[1]["asset"]]["name"]}
                  {/if}
                </span>
              </div>
            </td>
            <td data-label="Solde">
              <div>
                <span class="block">{ledger[1]["fee"]}</span>
                <span class="currency">
                  {#if typeof $asymbole[ledger[1]["asset"]] !== "undefined"}
                    {$asymbole[ledger[1]["asset"]]["name"]}
                  {/if}
                </span>
              </div>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
  {#if ledgers}
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
  .ledgers .currency {
    color: #555555;
  }
  .ledgers .hour {
    font-size: 0.8em;
    color: #858585;
  }
  .ledgers .block {
    display: block;
  }
  .ledgers h4 {
    background-color: #3a3a3a;
    padding: 5px;
    border: 1px solid #222222;
    color: #c7c7c7;
    font-size: 0.9em;
    font-weight: inherit;
  }
  .ledgers td.first {
    border-left: 5px solid #181818;
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid #2c2c2c;
    background: #242424;
    padding: 15px 0 15px 10px;
  }
  .ledgers .margin {
    border: 1px solid #242424;
    background-color: #233024;
    color: #a9a9a9;
    padding: 7px 15px;
    text-transform: capitalize;
    min-width: 96px;
    border-radius: 5px;
    text-align: center;
  }
  .ledgers .market {
    border: 1px solid #242424;
    background-color: #202020;
    color: #a9a9a9;
    padding: 7px 15px;
    text-transform: capitalize;
    min-width: 96px;
    border-radius: 5px;
    text-align: center;
  }
  .ledgers .rollover {
    border: 1px solid #242424;
    background-color: #141010;
    color: #a9a9a9;
    padding: 7px 15px;
    text-transform: capitalize;
    min-width: 96px;
    border-radius: 5px;
    text-align: center;
  }
  .ledgers .trade {
    border: 1px solid #242424;
    background-color: #232630;
    color: #a9a9a9;
    padding: 7px 15px;
    text-transform: capitalize;
    min-width: 96px;
    border-radius: 5px;
    text-align: center;
  }
  .ledgers .staking {
    border: 1px solid #242424;
    background-color: #233030;
    color: #a9a9a9;
    padding: 7px 15px;
    text-transform: capitalize;
    min-width: 96px;
    border-radius: 5px;
    text-align: center;
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

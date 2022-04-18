<script>
  // ---------------------------------------------------------
  //  Imports
  // ---------------------------------------------------------
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";

  import UserData from "classes/UserData.js";
  import formatDate from "utils/formatDate.js";
  import { online, asymbole, ledgersdata } from "store/store.js";
  import DataTable, {
    Head,
    Body,
    Row,
    Cell,
    Pagination,
  } from "@smui/data-table";
  import Select, { Option } from "@smui/select";
  import IconButton from "@smui/icon-button";
  import { Label } from "@smui/common";
  import LinearProgress from "@smui/linear-progress";
  import Paper, { Title, Content } from "@smui/paper";
  import SnackBar from "components/SnackBar.svelte";

  // ---------------------------------------------------------
  //  Props
  // ---------------------------------------------------------
  const ud = new UserData();

  let error = false,
    ledgers = false,
    ledgers_store = false,
    count = false,
    life = 300, // Secondes
    isLoading = false;

  let snackBarText = "",
    snackBarShow = false;

  const typeLabel = {
    margin: $_("account.ledgers.typeLabel.margin"),
    rollover: $_("account.ledgers.typeLabel.rollover"),
    trade: $_("account.ledgers.typeLabel.trade"),
    staking: $_("account.ledgers.typeLabel.staking"),
    deposit: $_("account.ledgers.typeLabel.deposit"),
    withdrawal: $_("account.ledgers.typeLabel.withdrawal"),
  };

  // ---------------------------------------------------------
  //  Methods Declarations
  // ---------------------------------------------------------
  /**
   * get__store
   *********************/
  const get__store = (store) => {
    let $val;
    store.subscribe(($) => ($val = $))();
    return $val;
  };

  /**
   * GetLedgers
   *********************/
  const GetLedgers = async () => {
    try {
      if (!$online) {
        error = true;
        isLoading = true;
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

      if (
        typeof res !== "undefined" &&
        Object.prototype.hasOwnProperty.call(res, "error")
      ) {
        snackBarShow = true;
        snackBarText = `<strong>[KRAKEN API]</strong> ${res.endpoint}: ${res.message}`;

        error = res.error;
        setTimeout(() => {
          GetLedgers();
        }, res.timeout);
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
          isLoading = true;
        }
      }
    } catch (error) {
      console.error("[ERROR]:", error);
    }
  };

  /**
   * onMount
   *********************/
  onMount(async () => {
    try {
      await GetLedgers();
    } catch (error) {
      console.error("[ERROR]:", error);
    }
  });

  /**
   * Pagination
   *********************/
  let ledgersSlice = [],
    nbTotal = 0,
    start = 0,
    end = 0,
    lastPage = 0,
    rowsPerPage = 5,
    currentPage = 0,
    perPage = [5, 10, 25, 50];

  $: if (ledgers) {
    nbTotal = ledgers.length;
    start = currentPage * rowsPerPage;
    end = Math.min(start + rowsPerPage, nbTotal);
    ledgersSlice = ledgers.slice(start, end);
    lastPage = Math.max(Math.ceil(nbTotal / rowsPerPage) - 1, 0);

    if (currentPage > lastPage) currentPage = lastPage;
    if (rowsPerPage > nbTotal) rowsPerPage = nbTotal;

    isLoading = !!ledgers;
  }
</script>

<SnackBar showSnackbar={snackBarShow} text={snackBarText} />
<div class="block ledgers">
  {#if error && typeof error !== "boolean"}
    <Paper color="primary" variant="outlined" class="mdc-theme--primary" square>
      <Content>
        {error}
      </Content>
    </Paper>
  {/if}
  <DataTable
    table$aria-label={$_("account.ledgers.dataLabel")}
    style="width: 100%;"
    class="open-orders"
  >
    <LinearProgress indeterminate bind:closed={isLoading} slot="progress" />
    <Head>
      <Row>
        <Cell>{$_("account.ledgers.reference")}</Cell>
        <Cell>{$_("account.ledgers.date")}</Cell>
        <Cell>{$_("account.ledgers.type")}</Cell>
        <Cell>{$_("account.ledgers.pair")}</Cell>
        <Cell>{$_("account.ledgers.amount")}</Cell>
        <Cell>{$_("account.ledgers.fees")}</Cell>
        <Cell>{$_("account.ledgers.solde")}</Cell>
      </Row>
    </Head>
    <Body>
      {#if ledgers && nbTotal > 0}
        {#each ledgersSlice as ledger, i}
          <Row id={ledger[0]}>
            <Cell
              style="padding:0;width:13%;"
              data-label={$_("account.ledgers.reference")}
            >
              <div class="first">
                {String(ledger[1]["refid"]).substr(0, 12)}
              </div>
            </Cell>
            <Cell style="width:10%" data-label={$_("account.ledgers.date")}>
              <div class="Date">
                <span class="block">{formatDate(ledger[1]["time"], "D")}</span>
                <span class="hour">
                  ({formatDate(ledger[1]["time"], "H")})
                </span>
              </div>
            </Cell>
            <Cell style="width:10%" data-label={$_("account.ledgers.type")}>
              <span class={ledger[1]["type"]}>
                {typeLabel[ledger[1]["type"]]}
              </span>
            </Cell>
            <Cell data-label={$_("account.ledgers.pair")}>
              <span class="currency">{ledger[1]["asset"]}</span>
            </Cell>
            <Cell data-label={$_("account.ledgers.amount")}>
              <div>
                <span class="block">{ledger[1]["amount"]}</span>
                <span class="currency">
                  {#if typeof $asymbole[ledger[1]["asset"]] !== "undefined"}
                    {$asymbole[ledger[1]["asset"]]["name"]}
                  {/if}
                </span>
              </div>
            </Cell>
            <Cell data-label={$_("account.ledgers.fees")}>
              <div>
                <span class="block">{ledger[1]["fee"]}</span>
                <span class="currency">
                  {#if typeof $asymbole[ledger[1]["asset"]] !== "undefined"}
                    {$asymbole[ledger[1]["asset"]]["name"]}
                  {/if}
                </span>
              </div>
            </Cell>
            <Cell data-label={$_("account.ledgers.solde")}>
              <div>
                <span class="block">{ledger[1]["fee"]}</span>
                <span class="currency">
                  {#if typeof $asymbole[ledger[1]["asset"]] !== "undefined"}
                    {$asymbole[ledger[1]["asset"]]["name"]}
                  {/if}
                </span>
              </div>
            </Cell>
          </Row>
        {/each}
      {/if}
    </Body>
    <Pagination slot="paginate">
      <svelte:fragment slot="rowsPerPage">
        <Label>{$_("account.rowsPerPage")}</Label>
        <Select variant="outlined" bind:value={rowsPerPage} noLabel>
          {#each perPage as option}
            <Option value={option}>{option}</Option>
          {/each}
        </Select>
      </svelte:fragment>
      <svelte:fragment slot="total">
        {start + 1}-{end}
        {$_("account.of")}
        {nbTotal}
      </svelte:fragment>

      <IconButton
        class="material-icons"
        action="first-page"
        title={$_("account.firstPage")}
        on:click={() => (currentPage = 0)}
        disabled={currentPage === 0}>first_page</IconButton
      >
      <IconButton
        class="material-icons"
        action="prev-page"
        title={$_("account.prevPage")}
        on:click={() => currentPage--}
        disabled={currentPage === 0}>chevron_left</IconButton
      >
      <IconButton
        class="material-icons"
        action="next-page"
        title={$_("account.nextPage")}
        on:click={() => currentPage++}
        disabled={currentPage === lastPage}>chevron_right</IconButton
      >
      <IconButton
        class="material-icons"
        action="last-page"
        title={$_("account.lastPage")}
        on:click={() => (currentPage = lastPage)}
        disabled={currentPage === lastPage}>last_page</IconButton
      >
    </Pagination>
  </DataTable>
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
  .ledgers .first {
    border-left: 5px solid #5b5b5b;
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid #2c2c2c;
    background: #242424;
    padding: 15px 0 15px 10px;
    color: #6e6e6e;
    font-weight: bold;
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
</style>

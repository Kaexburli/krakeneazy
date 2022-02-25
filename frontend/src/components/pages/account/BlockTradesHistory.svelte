<script>
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";

  import UserData from "classes/UserData.js";
  import formatDate from "utils/formatDate.js";
  import { online, tradeshistorydata, assetpairs } from "store/store.js";
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

  const ud = new UserData();

  let error = false,
    tradeshistory = false,
    tradeshistory_store = false,
    life = 300, // Secondes
    isLoading = false;

  /**
   * get__store
   *********************/
  const get__store = (store) => {
    let $val;
    store.subscribe(($) => ($val = $))();
    return $val;
  };

  /**
   * GetTradesHistory
   *********************/
  const GetTradesHistory = async () => {
    try {
      if (!$online) {
        error = true;
        isLoading = true;
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
        error = false;
        isLoading = true;
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
      await GetTradesHistory();
    } catch (error) {
      console.error("[ERROR]:", error);
    }
  });

  /**
   * Pagination
   *********************/
  let tradeshistorySlice = [],
    nbTotal = 0,
    start = 0,
    end = 0,
    lastPage = 0,
    rowsPerPage = 5,
    currentPage = 0,
    perPage = [5, 10, 25, 50];

  $: if (tradeshistory) {
    nbTotal = tradeshistory.length;
    start = currentPage * rowsPerPage;
    end = Math.min(start + rowsPerPage, nbTotal);
    tradeshistorySlice = tradeshistory.slice(start, end);
    lastPage = Math.max(Math.ceil(nbTotal / rowsPerPage) - 1, 0);

    if (currentPage > lastPage) currentPage = lastPage;
    if (rowsPerPage > nbTotal) rowsPerPage = nbTotal;

    isLoading = !!tradeshistory;
  }
</script>

<div class="block tradeshistory">
  {#if error && typeof error !== "boolean"}
    <Paper color="primary" variant="outlined" class="mdc-theme--primary" square>
      <Content>
        {error}
      </Content>
    </Paper>
  {/if}
  <DataTable
    table$aria-label={$_("account.tradesHistory.dataLabel")}
    style="width: 100%;"
    class="open-orders"
  >
    <LinearProgress indeterminate bind:closed={isLoading} slot="progress" />
    <Head>
      <Row>
        <Cell>{$_("account.tradesHistory.type")}</Cell>
        <Cell>{$_("account.tradesHistory.date")}</Cell>
        <Cell>{$_("account.tradesHistory.pair")}</Cell>
        <Cell>{$_("account.tradesHistory.cost")}</Cell>
        <Cell>{$_("account.tradesHistory.price")}</Cell>
        <Cell>{$_("account.tradesHistory.volume")}</Cell>
        <Cell>{$_("account.tradesHistory.fees")}</Cell>
      </Row>
    </Head>
    <Body>
      {#if tradeshistorySlice && nbTotal > 0}
        {#each tradeshistorySlice as trade, i}
          <Row id={trade[0]}>
            <Cell
              style="padding:0;width:13%;"
              data-label={$_("account.tradesHistory.type")}
            >
              <div class={trade[1]["type"]}>
                {#if trade[1]["type"] === "buy"}
                  {$_("account.tradesHistory.buy")}
                  <span class="ordertype">
                    {trade[1]["ordertype"]}
                  </span>
                {:else}
                  {$_("account.tradesHistory.sell")}
                  <span class="ordertype">
                    {trade[1]["ordertype"]}
                  </span>
                {/if}
              </div>
            </Cell>
            <Cell
              style="width:10%"
              data-label={$_("account.tradesHistory.date")}
            >
              <div class="Date">
                <span class="block">
                  {formatDate(trade[1]["time"], "D")}
                </span>
                <span class="hour">
                  ({formatDate(trade[1]["time"], "H")})
                </span>
              </div>
            </Cell>
            <Cell data-label={$_("account.tradesHistory.pair")}>
              <span class="currency">
                {trade[1]["pair"]}
              </span>
            </Cell>
            <Cell data-label={$_("account.tradesHistory.cost")}>
              <div class="cost">
                <span class="block">{trade[1]["cost"]}</span>
                <span class="currency">
                  {$assetpairs[trade[1]["pair"]]["wsname"].split("/")[1]}
                </span>
              </div>
            </Cell>
            <Cell data-label={$_("account.tradesHistory.price")}>
              <div class="price">
                <span class="block">{trade[1]["price"]}</span>
                <span class="currency">
                  {$assetpairs[trade[1]["pair"]]["wsname"].split("/")[1]}
                </span>
              </div>
            </Cell>
            <Cell data-label={$_("account.tradesHistory.volume")}>
              <div class="volume">
                <span class="block">{trade[1]["vol"]}</span>
                <span class="currency">
                  {$assetpairs[trade[1]["pair"]]["wsname"].split("/")[1]}
                </span>
              </div>
            </Cell>
            <Cell data-label={$_("account.tradesHistory.fees")}>
              <div class="total-fee">
                <span class="fee">
                  <span class="label">
                    {$_("account.tradesHistory.fees")}:
                  </span>
                  {trade[1]["fee"]}
                </span>
                <br />
                <span class="margin_fee">
                  <span class="label">
                    {$_("account.tradesHistory.marginFee")}:
                  </span>
                  {trade[1]["margin"]}
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
  .tradeshistory .first {
    border-left: 5px solid #181818;
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid #2c2c2c;
    background: #242424;
    padding: 15px 0 15px 10px;
  }
  .tradeshistory .buy {
    border-left: 3px solid rgb(83 104 50);
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid rgb(37 46 24);
    background: #242424;
    padding: 15px 0 15px 10px;
  }
  .tradeshistory .sell {
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
</style>

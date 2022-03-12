<script>
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";
  import UserData from "classes/UserData.js";
  import formatDate from "utils/formatDate.js";
  import { online, closedordersdata } from "store/store.js";
  import TooltipIcon from "components/TooltipIcon.svelte";
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

  let error = false,
    closedorders = false,
    closedorders_store = false,
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
   * GetClosedOrders
   *********************/
  const GetClosedOrders = async () => {
    try {
      if (!$online) {
        error = true;
        isLoading = true;
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
        isLoading = true;
        setTimeout(() => {
          GetClosedOrders();
        }, res.timeout);
      } else {
        let json = {
          data: Object.entries(res.closed),
          time: parseInt(Date.now() / 1000),
        };

        closedorders = Object.entries(res.closed);
        closedordersdata.set(json);
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
  onMount(() => {
    GetClosedOrders();
  });

  /**
   * Pagination
   *********************/
  let closedordersSlice = [],
    nbTotal = 0,
    start = 0,
    end = 0,
    lastPage = 0,
    rowsPerPage = 5,
    currentPage = 0,
    perPage = [5, 10, 25, 50];

  $: if (closedorders) {
    nbTotal = closedorders.length;
    start = currentPage * rowsPerPage;
    end = Math.min(start + rowsPerPage, nbTotal);
    closedordersSlice = closedorders.slice(start, end);
    lastPage = Math.max(Math.ceil(nbTotal / rowsPerPage) - 1, 0);

    if (currentPage > lastPage) currentPage = lastPage;
    if (rowsPerPage > nbTotal) rowsPerPage = nbTotal;

    isLoading = !!closedorders;
  }
</script>

<div class="block closed-orders">
  {#if error && typeof error !== "boolean"}
    <Paper color="primary" variant="outlined" class="mdc-theme--primary" square>
      <Content>
        {error}
      </Content>
    </Paper>
  {/if}
  <DataTable
    table$aria-label={$_("account.closedOrders.dataLabel")}
    style="width: 100%;"
    class="open-orders"
  >
    <LinearProgress indeterminate bind:closed={isLoading} slot="progress" />
    <Head>
      <Row>
        <Cell>{$_("account.closedOrders.type")}</Cell>
        <Cell>{$_("account.closedOrders.date")}</Cell>
        <Cell>{$_("account.closedOrders.pair")}</Cell>
        <Cell>{$_("account.closedOrders.price")}</Cell>
        <Cell>{$_("account.closedOrders.volume")}</Cell>
        <Cell>{$_("account.closedOrders.cost")}</Cell>
        <Cell>{$_("account.closedOrders.statut")}</Cell>
      </Row>
    </Head>
    <Body>
      {#if closedorders && nbTotal > 0}
        {#each closedordersSlice as order, i}
          <Row id={order[0]} class="tr-{order[1]['status']}">
            <Cell
              style="padding:0;width:13%;"
              data-label={$_("account.closedOrders.type")}
            >
              <span class={order[1]["descr"]["type"]}>
                {#if order[1]["descr"]["type"] === "buy"}
                  {$_("account.closedOrders.buy")}
                {:else}
                  {$_("account.closedOrders.sell")}
                {/if}
              </span>
            </Cell>
            <Cell
              style="width:10%"
              data-label={$_("account.closedOrders.date")}
            >
              <div class="Date">
                <div>
                  {formatDate(order[1]["opentm"], "D")}
                </div>
                <span class="hour">
                  ({formatDate(order[1]["opentm"], "H")})
                </span>
              </div>
            </Cell>
            <Cell data-label={$_("account.closedOrders.pair")}>
              <span class="currency">{order[1]["descr"]["pair"]}</span>
            </Cell>
            <Cell data-label={$_("account.closedOrders.price")}>
              {order[1]["descr"]["price"]}
            </Cell>
            <Cell data-label={$_("account.closedOrders.volume")}>
              <div class="volume">
                <div>
                  <span class="price-little">
                    {order[1]["vol"]}
                  </span>
                </div>
                <div>
                  <span class="price-little">
                    ({order[1]["vol_exec"]})
                  </span>
                </div>
              </div>
            </Cell>
            <Cell data-label={$_("account.closedOrders.cost")}>
              {#if Number(order[1]["cost"]) <= 0}
                {parseFloat(order[1]["cost"]).toFixed(4)}
              {:else}
                {order[1]["cost"]}
              {/if}
            </Cell>
            <Cell
              style="width:5%;"
              data-label={$_("account.closedOrders.statut")}
            >
              <span class="badge badge-{order[1]['status']}">
                {order[1]["status"]}
              </span>
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
  .closed-orders h4 .actions-table {
    float: right;
    margin-right: 30px;
  }
  .closed-orders .hour {
    font-size: 0.8em;
    color: #858585;
  }
  .closed-orders .buy {
    border-left: 3px solid rgb(83 104 50);
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid rgb(37 46 24);
    background: #242424;
    padding: 15px 0 15px 10px;
    display: block;
  }
  .closed-orders .sell {
    border-left: 3px solid #8d2525;
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid #3e2626;
    background: #242424;
    padding: 15px 0 15px 10px;
    display: block;
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
  .closed-orders .badge {
    padding: 15px;
    color: rgb(141, 199, 54);
    background-color: #283826;
    border: 1px dotted #1e1e1e;
    text-transform: capitalize;
    display: block;
    min-width: 100px;
    text-align: center;
  }
  .closed-orders .badge-canceled {
    color: #ffa2a2;
    background-color: #442929;
    border: 1px dotted #1e1e1e;
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
</style>

<script>
  import { _ } from "svelte-i18n";
  import { onDestroy, onMount } from "svelte";
  import { online } from "store/store.js";
  import { owntrades } from "store/wsstore.js";
  import formatDate from "utils/formatDate.js";
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

  let error = false,
    owntradesdata = false,
    isLoading = false,
    unsubscribe = false;

  /**
   * onMount
   *********************/
  onMount(() => {
    unsubscribe = owntrades.subscribe((tick) => {
      if (!$online) {
        error = true;
        isLoading = true;
        return false;
      } else if (
        typeof tick !== "undefined" &&
        tick.hasOwnProperty("errorMessage")
      ) {
        error = "[" + tick.subscription.name + "] " + tick.errorMessage;
        isLoading = true;
      } else if (typeof tick !== "undefined" && Object.keys(tick).length >= 1) {
        if (tick.service === "OwnTrades" && tick.data) {
          owntradesdata = tick.data;
          isLoading = true;
        }
      }
    });
  });

  /**
   * onDestroy
   *********************/
  onDestroy(() => {
    unsubscribe;
  });

  /**
   * Pagination
   *********************/
  let owntradesdataSlice = [],
    nbTotal = 0,
    start = 0,
    end = 0,
    lastPage = 0,
    rowsPerPage = 5,
    currentPage = 0,
    perPage = [5, 10, 25, 50];

  $: if (owntradesdata) {
    nbTotal = owntradesdata.length;
    start = currentPage * rowsPerPage;
    end = Math.min(start + rowsPerPage, nbTotal);
    owntradesdataSlice = owntradesdata.slice(start, end);
    lastPage = Math.max(Math.ceil(nbTotal / rowsPerPage) - 1, 0);

    if (currentPage > lastPage) currentPage = lastPage;
    if (rowsPerPage > nbTotal) rowsPerPage = nbTotal;

    isLoading = !!owntradesdataSlice;
  }
</script>

<div class="block owntrades">
  {#if error && typeof error !== "boolean"}
    <span class="error">{error}</span>
  {/if}
  <DataTable
    table$aria-label={$_("account.ownTrades.dataLabel")}
    style="width: 100%;"
    class="open-orders"
  >
    <Head>
      <Row>
        <Cell>{$_("account.ownTrades.type")}</Cell>
        <Cell>{$_("account.ownTrades.date")}</Cell>
        <Cell>{$_("account.ownTrades.pair")}</Cell>
        <Cell>{$_("account.ownTrades.cost")}</Cell>
        <Cell>{$_("account.ownTrades.price")}</Cell>
        <Cell>{$_("account.ownTrades.volume")}</Cell>
        <Cell>{$_("account.ownTrades.fees")}</Cell>
      </Row>
    </Head>
    <Body>
      {#if owntradesdataSlice && nbTotal > 0}
        {#each owntradesdataSlice as el, i}
          <Row id={Object.keys(el)}>
            <Cell
              style="padding:0;width:13%;"
              data-label={$_("account.ownTrades.type")}
            >
              <div class={el[Object.keys(el)]["type"]}>
                {#if el[Object.keys(el)]["type"] === "buy"}
                  {$_("account.ownTrades.buy")}
                  <span class="ordertype">
                    {el[Object.keys(el)]["ordertype"]}
                  </span>
                {:else}
                  {$_("account.ownTrades.sell")}
                  <span class="ordertype">
                    {el[Object.keys(el)]["ordertype"]}
                  </span>
                {/if}
              </div>
            </Cell>
            <Cell style="width:10%" data-label={$_("account.ownTrades.date")}>
              <div class="Date">
                <span class="block">
                  {formatDate(el[Object.keys(el)]["time"], "D")}
                </span>
                <span class="hour">
                  ({formatDate(el[Object.keys(el)]["time"], "H")})
                </span>
              </div>
            </Cell>
            <Cell data-label={$_("account.ownTrades.pair")}>
              <span class="currency">
                {el[Object.keys(el)]["pair"]}
              </span>
            </Cell>
            <Cell data-label={$_("account.ownTrades.cost")}>
              <div class="cost">
                <span class="block">{el[Object.keys(el)]["cost"]}</span>
                <span class="currency"
                  >{el[Object.keys(el)]["pair"].split("/")[1]}</span
                >
              </div>
            </Cell>
            <Cell data-label={$_("account.ownTrades.price")}>
              <div class="price">
                <span class="block">{el[Object.keys(el)]["price"]}</span>
                <span class="currency"
                  >{el[Object.keys(el)]["pair"].split("/")[1]}</span
                >
              </div>
            </Cell>
            <Cell data-label={$_("account.ownTrades.volume")}>
              <div class="volume">
                <span class="block">{el[Object.keys(el)]["vol"]}</span>
                <span class="currency"
                  >{el[Object.keys(el)]["pair"].split("/")[0]}</span
                >
              </div>
            </Cell>
            <Cell data-label={$_("account.ownTrades.fees")}>
              <div class="total-fee">
                <span class="fee">
                  <span class="label"
                    >{$_("account.ownTrades.fees")} :
                  </span>{el[Object.keys(el)]["fee"]}</span
                ><br />
                <span class={$_("account.ownTrades.fees")}>
                  <span class="label"
                    >{$_("account.ownTrades.marginFee")} :
                  </span>{el[Object.keys(el)]["margin"]}</span
                >
              </div>
            </Cell>
          </Row>
        {/each}
      {/if}
    </Body>
    <LinearProgress indeterminate bind:closed={isLoading} slot="progress" />
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
  .owntrades .buy {
    border-left: 3px solid rgb(83 104 50);
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid rgb(37 46 24);
    background: #242424;
    padding: 15px 0 15px 10px;
  }
  .owntrades .sell {
    border-left: 3px solid #8d2525;
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid #3e2626;
    background: #242424;
    padding: 15px 0 15px 10px;
  }
  .owntrades .buy {
    color: rgb(83 104 50);
    display: block;
    text-transform: uppercase;
  }
  .owntrades .sell {
    color: #8d2525;
    display: block;
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
</style>

<script>
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";
  import { page } from "store/store.js";
  import LinearProgress from "@smui/linear-progress";
  import ChartItem from "components/pages/statistics/ChartItem.svelte";

  import { assign, createMachine } from "xstate";
  import { useMachine } from "utils/useMachin.js";
  import { statisticsService } from "machin/statistics/Service.js";

  import { FetchExport, ProcessingData } from "machin/statistics/Method.js";

  let errorMsg,
    datas = [],
    isError = false,
    isLoading = false;

  /**
   * displayError
   * @description Permet l'affichage des erreurs
   * @param { Object } ctx Context
   * @param { Object } event Evenement
   */
  const displayError = async (ctx, event) => {
    console.error("[ERROR]:", ctx, event);
    await wait(30000);
    send({ type: "FETCH" });
  };

  /**
   * service
   * @description Définie les services invoqué par la machine à état
   */
  const services = {
    fetchExport: (ctx, event) => FetchExport(ctx, event),
    processingData: (ctx, event) => ProcessingData(ctx, event),
  };

  /**
   * actions
   * @description Définie les actions appelées par la machine à état
   */
  const actions = {
    assignData: assign({
      ledgers: (ctx, { data = [] }) => data.ledgers,
      trades: (ctx, { data = [] }) => data.trades,
    }),
    assignDataDisplay: assign({
      dataformat: (ctx, { data = [] }) => data,
    }),
    displayError: (ctx, event) => displayError(ctx, event),
  };

  /**
   * statisticsMachine
   * @description Instantie une machine à état (createMachine)
   * @param { statisticsService } Définition du service
   */
  const statisticsMachine = createMachine(statisticsService, {
    services,
    actions,
  });

  /**
   * state, send
   * @description Definie les variables state et send
   * @param { statisticsMachine }
   */
  const { state, send } = useMachine(statisticsMachine);

  /**
   * onMount
   * @description Méthode svelte
   */
  onMount(() => {
    send({ type: "FETCH" });
  });

  $: {
    if ($state.matches("success")) send({ type: "NEXT" });
    isError = $state.matches("error");
    isLoading = !$state.matches("displaying");
    datas = $state.context.dataformat;
    if (
      Object.prototype.hasOwnProperty.call(datas, "chartDatas") &&
      datas.chartDatas.length == 0
    ) {
      $page = "reports";
    }
  }
</script>

{#if isError}
  <span class="error">{errorMsg}</span>
{/if}

<div class="block">
  <h3>{$_("statistics.title")}</h3>
  {#if isLoading}
    <LinearProgress indeterminate />
  {/if}
  <div class="chart-block">
    {#if Object.prototype.hasOwnProperty.call(datas, "chartDatas")}
      {#each Object.keys(datas.chartDatas) as ledg}
        <div class="chart">
          <h4>{$_(`statistics.${ledg}`)}</h4>
          <ChartItem
            data={Object.assign({}, datas.chartDatas[ledg])}
            chartLayout="pie"
          />
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .chart-block {
    display: flex;
    flex-wrap: wrap;
  }
  .chart {
    background-color: #212121;
    border: 1px solid #181818;
    min-width: 100px;
    max-height: 200px;
    padding-bottom: 50px;
  }
  .chart h4 {
    text-transform: capitalize;
    padding: 10px;
    background-color: #1a1a1a;
  }
  :global(progress) {
    display: block;
    width: 100%;
  }
  :global(.export-title) {
    color: #999999;
    cursor: pointer;
    padding: 5px 0;
  }
  :global(.export-infos) {
    color: #555555;
  }
  :global(.export-infos ul) {
    transition: 1s;
    padding: 10px;
    margin-left: 10px;
  }
  :global(.export-infos ul > li) {
    list-style: inside;
  }
  :global(.export-id) {
    color: #999999;
    font-weight: bold;
  }
  :global(.export-descr) {
    color: #999999;
    font-weight: bold;
  }
  :global(.export-report) {
    color: #999999;
  }
  :global(.export-fields) {
    color: #999999;
  }
  :global(.export-format) {
    color: #999999;
  }
  :global(.export-status) {
    color: #dddddd;
    background: rgb(165, 165, 165);
    padding: 1px 6px;
    margin: 0 5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    font-size: 0.8em;
  }
  :global(.export-status.processed) {
    color: #dddddd;
    background: darkolivegreen;
    padding: 1px 6px;
  }
  :global(.export-status.processing) {
    color: #dddddd;
    background: orange;
    padding: 1px 6px;
  }
  :global(.export-status.queued) {
    color: #dddddd;
    background: darkred;
    padding: 1px 6px;
  }
  :global(.export-label) {
    color: #979797;
  }
  :global(.error) {
    color: red;
  }
</style>

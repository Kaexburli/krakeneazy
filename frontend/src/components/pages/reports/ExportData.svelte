<script>
  import { onMount, onDestroy, getContext } from "svelte";
  import { assign, createMachine } from "xstate";
  import { useMachine } from "machin/export/useMachin.js";
  import { exportService } from "machin/export/exportMachin.js";

  import {
    AddExport,
    RetreiveExport,
    StatusExport,
    getListExport,
  } from "machin/export/exportMethod.js";

  import { ledgersregister, tradesregister, exportcsv } from "store/store.js";
  import formatDate from "utils/formatDate.js";
  import { SyncLoader, Circle } from "svelte-loading-spinners";
  import { tweened } from "svelte/motion";
  import { linear } from "svelte/easing";

  const progress = tweened(0, {
    duration: 1000,
    easing: linear,
  });

  let progressBar = false;
  let msg = false;
  let datas = false;
  let exportExpired = false;

  let addInitInProgress = false;
  let isLoading = false;
  let isQueued = false;

  const wait = (time) => {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  };

  const initLoadData = (_ctx, _event) => {
    return async (callback, _onEvent) => {
      const res = await getListExport();

      if (Array.isArray(res)) callback({ type: "PROCESSED", newData: res });
      else callback(res.callback);
    };
  };

  const addExport = (_ctx, event) => {
    return async (callback, _onEvent) => {
      const res = await AddExport(event.data.type);
      callback({ type: "ADDED", data: { type: event.data.type, id: res.id } });
    };
  };

  const statusExport = (ctx, event) => {
    return async (callback, _onEvent) => {
      const res = await StatusExport(event.data.type, event.data.id);

      if (ctx.count >= 2) await wait(5000);

      callback({
        type: res[0].status.toUpperCase(), // QUEUED
        data: {
          type: event.data.type,
          id: event.data.id,
          createdtm: res[0].createdtm,
        },
      });
    };
  };

  const retreiveExport = (ctx, event) => {
    msg += "Téléchargement terminé! <br />";
    progress.set(1);
    progressBar = false;
    progress.set(0);
    return async (callback, _onEvent) => {
      msg += "Extraction du fichier exporté <br />";
      const retreive = await RetreiveExport(event.data.id, event.data.type);
      if (typeof retreive !== "undefined" && retreive.hasOwnProperty("error")) {
        msg += retreive.error + "<br /><br />";
      } else if (typeof retreive !== "undefined" && retreive.res) {
        msg += `Extraction du fichier ${retreive.filename} terminé! <br /><br />`;
        ctx.count = 0;
      }
      callback({ type: "DONE" });
    };
  };

  const removeExport = async (ctx, event) => {
    console.log("[removeExport]");
  };

  const checkError = async (ctx, event) => {
    console.error(event.data);
  };

  const services = {
    initLoadData: (ctx, event) => initLoadData(ctx, event),
    addExport: (ctx, event) => addExport(ctx, event),
    statusExport: (ctx, event) => statusExport(ctx, event),
    retreiveExport: (ctx, event) => retreiveExport(ctx, event),
    removeExport: (ctx, event) => removeExport(ctx, event),
    checkError: (ctx, event) => checkError(ctx, event),
  };

  /**
   * Actions
   */
  const assignProgress = (ctx, event) => {
    if (ctx.count === 0) {
      msg = `[${new Date().toLocaleString()}] <br />Initialisation de l'export <strong>${
        event.data.type
      }</strong> initial [${event.data.id}] <br />`;
      msg += `En attente de l'export <strong>${event.data.type}</strong>... <br />`;
      msg += "Lancement du téléchargement de l'export <br />";
    }
    progressBar = true;
    progress.set((parseInt(Date.now() / 1000) - event.data.createdtm) / 100);
    ctx.count++;
  };

  const actions = {
    assignData: assign({
      data: ({ data }, { newData = [] }) => [...data, ...newData],
    }),
    assignProgress: (ctx, event) => assignProgress(ctx, event),
  };

  const exportMachine = createMachine(exportService, { services, actions });
  const { state, send } = useMachine(exportMachine);

  /**
   * Method onMount
   */
  onMount(() => {
    send({ type: "LOAD_DATA" });
  });

  /**
   * Method onDestroy
   */
  onDestroy(() => {});

  $: {
    isLoading = !$state.matches("processed") ? true : false;
    isQueued = $state.event.type === "QUEUED" ? true : false;
    datas = $state.context.data;
  }
</script>

{#if isQueued}
  <pre class="console">
  {#if msg}{@html msg}{/if}
  {#if progressBar}
      <progress value={$progress} />
    {/if}
</pre>
{/if}

{#if isLoading && !isQueued}
  <SyncLoader size="30" color="#e8e8e8" unit="px" duration="1s" />
{/if}

{#if datas.length >= 1}
  <table class="flex-table flex-fixhead-table">
    <thead>
      <tr>
        <th>Type</th>
        <th>Période</th>
        <th>Expiration</th>
        <th>Status</th>
        <th>ID</th>
        <th>Format</th>
      </tr>
    </thead>
    <tbody>
      {#each datas as ex, i}
        <tr>
          <td>
            <span class="capitaliz">{ex.report} </span>
          </td>
          <td>
            <div>
              <span>{formatDate(ex.datastarttm, "D")}</span>
              <span class="time">{formatDate(ex.datastarttm, "H")}</span>
            </div>
            <div class="space">&#x2192;</div>
            <div>
              <span>{formatDate(ex.dataendtm, "D")}</span>
              <span class="time">{formatDate(ex.dataendtm, "H")}</span>
            </div>
          </td>
          <td>
            <div>
              <span>{formatDate(ex.expiretm, "D")}</span><br />
              <span class="time">{formatDate(ex.expiretm, "H")}</span>
            </div>
          </td>
          <td>
            <span
              class="status {ex.flags === '1'
                ? 'canceled'
                : ex.flags === '2'
                ? 'deleted'
                : ex.status.toLowerCase()}"
            >
              {#if ex.flags === "0"}
                {ex.status}
              {:else if ex.flags === "1"}
                Canceled
              {:else if ex.flags === "2"}
                Deleted
              {:else}
                -
              {/if}
            </span>
          </td>
          <td>{ex.id}</td>
          <td>{ex.format}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  .status {
    height: 20px;
    color: #dddddd;
    background: rgb(165, 165, 165);
    padding: 1px 6px;
    margin: 0 5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    font-size: 0.8em;
  }
  .status.processed {
    color: #dddddd;
    background: darkolivegreen;
    padding: 1px 6px;
  }
  .status.processing {
    color: #dddddd;
    background: orange;
    padding: 1px 6px;
  }
  .status.canceled {
    color: #dddddd;
    background: brown;
    padding: 1px 6px;
  }
  .status.deleted {
    color: #dddddd;
    background: darkred;
    padding: 1px 6px;
  }
  .status.queued {
    color: #dddddd;
    background: black;
    padding: 1px 6px;
  }
  .time {
    display: inline-block;
    color: #555555;
  }
  .capitaliz {
    text-transform: capitalize;
  }
  .space {
    margin: 5px 10px 5px 5px;
  }
  .console {
    margin: 10px;
    border: 1px solid #333;
    padding: 10px;
    background: #333;
    font-size: 0.8em;
  }
  :global(.circle) {
    display: inline-block;
    margin-right: 3px;
  }
</style>

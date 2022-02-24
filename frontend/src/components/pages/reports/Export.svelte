<script>
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";
  import formatDate from "utils/formatDate.js";
  import LinearProgress from "@smui/linear-progress";
  import { User } from "store/userStore.js";

  import { assign, createMachine } from "xstate";
  import { useMachine } from "utils/useMachin.js";
  import { exportService } from "machin/export/Service.js";

  import {
    AddExport,
    RetreiveExport,
    StatusExport,
    getListExport,
    RemoveExport,
  } from "machin/export/Method.js";

  let datas = false,
    message = false,
    isQueued = false,
    isError = false,
    isLoading = false,
    progressBar = false,
    errorMsg,
    userId = $User.id;

  /**
   * wait
   */
  const wait = (time) => {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  };

  /**
   * initLoadData
   */
  const initLoadData = (ctx, event) => {
    return async (callback, _onEvent) => {
      ctx.userId = userId; // Set userId in context
      const res = await getListExport(ctx, event);

      if (Array.isArray(res)) callback({ type: "PROCESSED", newData: res });
      else if (res.hasOwnProperty("callback")) callback(res.callback);
      else if (!res) callback("ERROR");
    };
  };

  /**
   * addExport
   */
  const addExport = (_ctx, event) => {
    message = $_("reports.export.initExport", {
      values: {
        date: new Date().toLocaleString(),
        type: `<strong>${event.data.type}</strong><br />`,
      },
    });

    return async (callback, _onEvent) => {
      const res = await AddExport(event.data.type);

      if (res.hasOwnProperty("callback")) {
        if (res.callback.type === "ERROR_TRAD") {
          const callBack = {
            type: "ERROR",
            error: $_(`reports.export.${res.callback.error}`),
          };
          return callback(callBack);
        }

        return callback(res.callback);
      }

      if (res.id) {
        message += $_("reports.export.waitExport", {
          values: {
            type: `<strong>${event.data.type}</strong><br />`,
          },
        });

        return callback({
          type: "ADDED",
          data: { type: event.data.type, id: res.id },
        });
      }
    };
  };

  /**
   * statusExport
   */
  const statusExport = (ctx, event) => {
    return async (callback, _onEvent) => {
      const res = await StatusExport(event.data.type, event.data.id, userId);

      if (res) {
        if (res.hasOwnProperty("error"))
          callback({ type: "ERROR", error: $_(`reports.export.${res.error}`) });

        if (ctx.count >= 1) await wait(10000);

        res.map((r) => {
          callback({
            type: r.status.toUpperCase() || false, // QUEUED
            data: {
              type: event.data.type,
              id: event.data.id,
              createdtm: r.createdtm,
            },
          });
        });
      } else {
        console.error("statusExport unoccured error !!!!!!");
      }
    };
  };

  /**
   * retreiveExport
   */
  const retreiveExport = (ctx, event) => {
    message += `<br />${$_("reports.export.endExport")}<br />`;
    progressBar = false;
    return async (callback, _onEvent) => {
      message += `${$_("reports.export.extractExport")}<br />`;
      const retreive = await RetreiveExport(
        event.data.id,
        event.data.type,
        userId
      );

      if (typeof retreive !== "undefined" && retreive.hasOwnProperty("error")) {
        message += retreive.error;
      } else if (typeof retreive !== "undefined" && retreive.res) {
        message += $_("reports.export.endExtractExport", {
          values: {
            filename: retreive.filename,
          },
        });
        ctx.count = 0;
      }
      callback({ type: "DONE" });
    };
  };

  /**
   * checkError
   */
  const checkError = async (_ctx, event) => {
    errorMsg = event.hasOwnProperty("data")
      ? event.data
      : event.hasOwnProperty("error")
      ? event.error
      : event;

    console.error("[checkError]:" + errorMsg, event);
    await wait(30000);
  };

  /**
   * assignProgress
   */
  const assignProgress = (ctx, event) => {
    if (ctx.count === 0) {
      let string = $_("reports.export.downloadExport", {
        values: {
          id: `<strong>[${event.data.id}]</strong>`,
        },
      });
      if (message) message += string;
      else message = string;
    } else message += Array(ctx.count).join(".");

    progressBar = true;
    ctx.count++;
  };

  /**
   * assignExpired
   */
  const assignExpired = (ctx, event) => {
    const ids = event.data.ids;
    ids.map(async (id) => {
      await RemoveExport(id, userId);
      ctx.expired.push(id);
    });
  };

  /**
   * services
   */
  const services = {
    initLoadData: (ctx, event) => initLoadData(ctx, event),
    addExport: (ctx, event) => addExport(ctx, event),
    statusExport: (ctx, event) => statusExport(ctx, event),
    retreiveExport: (ctx, event) => retreiveExport(ctx, event),
    checkError: (ctx, event) => checkError(ctx, event),
  };

  /**
   * actions
   */
  const actions = {
    assignData: assign({
      data: ({ data }, { newData = [] }) => [...data, ...newData],
    }),
    assignProgress: (ctx, event) => assignProgress(ctx, event),
    assignExpired: (ctx, event) => assignExpired(ctx, event),
  };

  const exportMachine = createMachine(exportService, { services, actions });
  const { state, send } = useMachine(exportMachine);

  /**
   * Method onMount
   */
  onMount(() => {
    send({ type: "LOAD_DATA" });
  });

  $: {
    isLoading = !$state.matches("processed");
    isError = $state.matches("failure");
    isQueued =
      ["ADD", "ADDED", "QUEUED"].includes($state.event.type) ||
      $state.matches("retreive")
        ? true
        : false;
    datas = $state.context.data;
  }
</script>

{#if isError}
  <span class="error">{$_("reports.export.error")}: {errorMsg}</span>
{/if}

{#if isQueued}
  <pre class="console">
    {#if message}{@html message}{/if}
    {#if progressBar}
      <LinearProgress indeterminate />
    {/if}
    </pre>
{/if}

{#if isLoading && !isQueued}
  <LinearProgress indeterminate />
{/if}

{#if datas.length >= 1}
  <table class="flex-table flex-fixhead-table">
    <thead>
      <tr>
        <th>{$_("reports.export.type")}</th>
        <th>{$_("reports.export.period")}</th>
        <th>{$_("reports.export.expiration")}</th>
        <th>{$_("reports.export.statut")}</th>
        <th>{$_("reports.export.id")}</th>
        <th>{$_("reports.export.format")}</th>
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
                {$_("reports.export.canceled")}
              {:else if ex.flags === "2"}
                {$_("reports.export.deleted")}
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

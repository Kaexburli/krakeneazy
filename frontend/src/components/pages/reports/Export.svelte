<script>
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";
  import { User } from "store/userStore.js";
  import formatDate from "utils/formatDate.js";
  import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
  import LinearProgress from "@smui/linear-progress";

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
      else if (Object.prototype.hasOwnProperty.call(res, "callback"))
        callback(res.callback);
      else if (!res) callback("ERROR");
    };
  };

  /**
   * addExport
   */
  const addExport = (_ctx, event) => {
    message = $_("reports.export.initExport", {
      values: {
        type: `<strong>${event.data.type}</strong><br />`,
      },
    });

    return async (callback, _onEvent) => {
      const res = await AddExport(event.data.type);

      if (Object.prototype.hasOwnProperty.call(res, "callback")) {
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
        message +=
          $_("reports.export.waitExport", {
            values: {
              type: `<strong>${event.data.type}</strong>`,
            },
          }) + "<br />";

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
        if (Object.prototype.hasOwnProperty.call(res, "error"))
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
    return async (callback, _onEvent) => {
      message += `${$_("reports.export.extractExport")}<br />`;
      const retreive = await RetreiveExport(
        event.data.id,
        event.data.type,
        userId
      );

      if (
        typeof retreive !== "undefined" &&
        Object.prototype.hasOwnProperty.call(retreive, "error")
      ) {
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
    errorMsg = Object.prototype.hasOwnProperty.call(event, "data")
      ? event.data
      : =Object.prototype.hasOwnProperty.call(event, "error")
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
      ["ADD", "ADDED", "QUEUED", "RETRIEVE"].includes($state.event.type) ||
      $state.matches("retreive")
        ? true
        : false;
    datas = $state.context.data;

    progressBar = !datas.length ? false : true;
  }
</script>

{#if !progressBar}
  <div class="box">
    <LinearProgress indeterminate bind:closed={progressBar} />
    <pre class="console">
      {#if isQueued}
        {#if message}
          {@html message}
        {:else}
          {$_("reports.export.wait")}
        {/if}
      {:else}
        {$_("reports.export.wait")}
      {/if}
  </pre>
  </div>
{/if}

{#if isError}
  <span class="error">{$_("reports.export.error")}: {errorMsg}</span>
{/if}

{#if datas.length >= 1}
  <DataTable table$aria-label="User list" style="width: 100%;">
    <Head>
      <Row>
        <Cell>{$_("reports.export.type")}</Cell>
        <Cell>{$_("reports.export.period")}</Cell>
        <Cell>{$_("reports.export.expiration")}</Cell>
        <Cell>{$_("reports.export.statut")}</Cell>
        <Cell>{$_("reports.export.id")}</Cell>
        <Cell>{$_("reports.export.format")}</Cell>
      </Row>
    </Head>
    <Body>
      {#each datas as ex, i}
        <Row>
          <Cell style="width: 5%;">{ex.report}</Cell>
          <Cell style="width: 45%;">
            <span>{formatDate(ex.datastarttm, "D")}</span>
            <span class="time">{formatDate(ex.datastarttm, "H")}</span>
            <span class="space">&#x2192;</span>
            <span>{formatDate(ex.dataendtm, "D")}</span>
            <span class="time">{formatDate(ex.dataendtm, "H")}</span>
          </Cell>
          <Cell style="width: 15%;">
            <div>
              <span>{formatDate(ex.expiretm, "D")}</span><br />
              <span class="time">{formatDate(ex.expiretm, "H")}</span>
            </div>
          </Cell>
          <Cell style="width: 15%;">
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
          </Cell>
          <Cell style="width: 10%;">{ex.id}</Cell>
          <Cell style="width: 10%;">{ex.format}</Cell>
        </Row>
      {/each}
    </Body>

    {#if isLoading && !isQueued}
      <LinearProgress indeterminate bind:closed={isLoading} slot="progress" />
    {/if}
  </DataTable>
{/if}

<style>
  .status {
    height: 20px;
    color: #dddddd;
    background: rgb(165, 165, 165);
    padding: 10px;
    margin: 0 5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    font-size: 0.8em;
  }
  .status.processed {
    color: #dddddd;
    background: darkolivegreen;
  }
  .status.processing {
    color: #dddddd;
    background: orange;
  }
  .status.canceled {
    color: #dddddd;
    background: brown;
  }
  .status.deleted {
    color: #dddddd;
    background: darkred;
  }
  .status.queued {
    color: #dddddd;
    background: black;
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

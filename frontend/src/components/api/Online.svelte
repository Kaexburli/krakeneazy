<script>
  import { _ } from "svelte-i18n";
  import { onMount, onDestroy, tick } from "svelte";
  import { online } from "store/store.js";
  import websocketStore from "svelte-websocket-store";
  import Badge from "svelte-favicon-badge";
  import KrakenStatusAPI from "components/api/KrakenStatusAPI.svelte";

  // Appel Websocket
  const server =
    location.protocol === "http:"
      ? `${["ws:", location.host].join("//")}`
      : `${["wss:", location.host].join("//")}`;
  const wss_systemstatus = server + "/api/ws/systemstatus";
  const wss_krakenstatus = server + "/api/ws/krakenstatus";
  const wsSystemStatus = websocketStore(wss_systemstatus);
  const wsKrakenStatus = websocketStore(wss_krakenstatus);
  // Appel Websocket

  let count = 0,
    background = "#FF0000",
    color = "#FFFFFF",
    error = false,
    status = "online",
    interval = Date.now(),
    krakenIncidentsDatas = false,
    krakenMaintenances = false,
    krakenStatus = false,
    krakenIncidents = [],
    components = [];

  export let display;

  /**
   * initKrakenStatusApi
   * @description Initialise les appels du status KRAKEN
   */
  const initKrakenStatusApi = async (datas) => {
    // Vérification des maintenances programmées
    krakenMaintenances = datas.scheduled_maintenances;
    if (datas && datas.status.indicator !== "none") {
      krakenStatus = datas.status.description;
    }

    // Vérification des components
    const krakenComponents = datas.components;
    if ((krakenComponents || []).length) {
      components = [];
      for (const KKComponent of krakenComponents) {
        if (KKComponent.status !== "operational") {
          const status = KKComponent.status;
          const name = KKComponent.name;
          const description =
            KKComponent.description !== null ? KKComponent.description : "";
          const errMsg = `[${status}] ${name} ${description}`;
          components.push(errMsg);
        }
      }
      krakenStatus += components.map((v) => `\n ${v}`);
    }

    // Vérification des incidents
    krakenIncidentsDatas = datas.incidents;
    if ((krakenIncidentsDatas || []).length) {
      krakenIncidents = [];
      for (const incident of krakenIncidentsDatas) {
        const updates = incident.incident_updates;
        for (const update of updates) {
          krakenIncidents.push({
            name: incident.name,
            resolved_at: incident.resolved_at,
            started_at: incident.started_at,
            updated_at: incident.updated_at,
            impact: incident.impact,
            status: incident.status,
            affected: update.affected_components,
            body: update.body,
          });
        }
      }
    }
  };

  /**
   * onMount
   * @description Svelte function native
   */
  onMount(async () => {
    wsKrakenStatus.subscribe((tick) => {
      if (
        !tick ||
        typeof tick === "undefined" ||
        tick.service !== "WsKrakenStatus" ||
        !Object.prototype.hasOwnProperty.call(tick, "data")
      )
        return false;

      initKrakenStatusApi(tick.data);
    });

    wsSystemStatus.subscribe((tick) => {
      if (
        !tick ||
        typeof tick === "undefined" ||
        tick.service !== "WsSystemStatus"
      )
        return false;

      if (Object.prototype.hasOwnProperty.call(tick.data, "errno")) {
        count = 1;
        error =
          "[" +
          tick.data.errno +
          "] " +
          tick.data.code +
          " " +
          tick.data.syscall;
        status = "offline";
        online.update((n) => false);
      } else if (
        Object.prototype.hasOwnProperty.call(tick.data, "errorMessage")
      ) {
        count = 1;
        error =
          "[" + tick.data.subscription.name + "] " + tick.data.errorMessage;
        status = "offline";
        online.update((n) => false);
      } else if (Object.prototype.hasOwnProperty.call(tick.data, "error")) {
        count = 1;
        let message = tick.data.message;
        error = "[" + tick.data.error + "] " + message;
        status = "offline";
      } else if (Object.prototype.hasOwnProperty.call(tick.data, "status")) {
        let timestamp = new Date(tick.data.timestamp).getTime();
        let diff_beetween = interval - timestamp;
        diff_beetween = Math.floor(diff_beetween / 1000 / 60 / 60 / 24);
        online.update((n) => diff_beetween === -1);
        status = tick.data.status;
        error = false;
      } else if (
        !$online &&
        !Object.prototype.hasOwnProperty.call(tick.data, "status")
      ) {
        count = 1;
        error = "ERROR";
        return false;
      }
    });
  });

  /**
   * onDestroy
   * @description Svelte function native
   */
  onDestroy(() => {
    display = false;
  });
</script>

{#if display === "header"}
  <Badge {count} {color} {background} href="/favicon.png" />
  {#if !$online}
    <div id="error-network">
      <div id="offline">
        <i class="fa fa-exclamation-triangle" />
        {$_("online.errorMessage")}&nbsp;
      </div>
    </div>
  {/if}
{:else if display === "footer"}
  {#if krakenIncidents.length}
    <KrakenStatusAPI {krakenIncidents} {krakenStatus} {krakenMaintenances} />
  {/if}
  <div class="online-api">
    {#if error}
      <span class="error_status">{error}</span>
    {/if}

    {#if status === undefined}
      <span class="dot" />
    {:else if status === "online"}
      <span class="status-green">{$_(`online.${status}`)}&nbsp;&nbsp;</span>
      <span class="dot dot-green" />
    {:else if status === "offline"}
      <span class="status-red">{$_(`online.${status}`)}&nbsp;&nbsp;</span>
      <span class="dot dot-red" />
    {:else}
      <span class="status-orange">{$_(`online.${status}`)}&nbsp;&nbsp;</span>
      <span class="dot dot-orange" />
    {/if}
  </div>
{/if}

<style>
  .online-api {
    text-align: right;
    float: right;
    font-size: 0.8em;
    margin-top: 3px;
    vertical-align: middle;
  }
  .dot {
    height: 10px;
    width: 10px;
    background-color: #bbb;
    border-radius: 50%;
    display: inline-block;
    margin-left: 2px;
  }
  .dot-green {
    background-color: chartreuse;
    vertical-align: inherit;
  }
  .dot-red {
    background-color: red;
    vertical-align: inherit;
  }
  .dot-orange {
    background-color: orange;
    vertical-align: inherit;
  }
  .status-green {
    color: chartreuse;
    vertical-align: inherit;
    text-transform: uppercase;
    font-size: 0.7em;
  }
  .status-red {
    color: red;
    vertical-align: inherit;
    text-transform: uppercase;
    font-size: 0.7em;
  }
  .status-orange {
    color: orange;
    vertical-align: inherit;
    text-transform: uppercase;
    font-size: 0.7em;
  }
  .error_status {
    color: red;
    font-size: 0.8em;
  }
  /* .errno {
    color: #f15353;
  } */
  #offline {
    background-color: #b30000;
    color: #e9e9e9;
    border: 1px solid #262626;
    display: block;
    z-index: 30;
    padding: 10px;
    position: relative;
    font-weight: bold;
    font-size: 0.8em;
  }
  #error-network {
    z-index: 20;
    position: fixed; /* Sit on top of the page content */
    width: 100%; /* Full width (cover the whole page) */
    height: 100%; /* Full height (cover the whole page) */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6); /* Black background with opacity */
    cursor: pointer; /* Add a pointer on hover */
  }
</style>

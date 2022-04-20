<script>
  // ---------------------------------------------------------
  //  Imports
  // ---------------------------------------------------------
  import { _ } from "svelte-i18n";
  import { fade } from "svelte/transition";
  import { onMount, onDestroy } from "svelte";
  import { online } from "store/store.js";
  import { mounted } from "store/mounted.js";
  import websocketStore from "svelte-websocket-store";
  import Badge from "svelte-favicon-badge";
  import KrakenStatusAPI from "api/KrakenStatusAPI.svelte";

  // ---------------------------------------------------------
  //  Props
  // ---------------------------------------------------------
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

  let countOffline = 0,
    background = "#FF0000",
    color = "#FFFFFF",
    error = false,
    status = "online",
    interval = Date.now(),
    krakenIncidentsDatas = false,
    krakenMaintenances = false,
    krakenStatus = false,
    krakenIncidents = [],
    components = [],
    closeWsKrakenStatus,
    closeWsSystemStatus;

  export let display;

  // ---------------------------------------------------------
  //  Methods Declarations
  // ---------------------------------------------------------
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
    closeWsKrakenStatus = wsKrakenStatus.subscribe((tick) => {
      if (
        !tick ||
        tick.service !== "WsKrakenStatus" ||
        !Object.prototype.hasOwnProperty.call(tick, "data")
      )
        return false;

      initKrakenStatusApi(tick.data);
    });

    closeWsSystemStatus = wsSystemStatus.subscribe((tick) => {
      // console.log("wsSystemStatus tick", tick);
      if (!tick) {
        return false;
      } else if (!tick.ok) {
        // { "ok": false, "service": "WsSystemStatus", "error": {"errno": -3008, "code": "ENOTFOUND", "syscall": "getaddrinfo", "hostname": "api.kraken.com" }, "data": {} }
        online.update((n) => false);
        status = "offline";
        error = `[${tick.error.code}]`;
        countOffline++;
      } else {
        // { "ok": true, "error": false, "service": "WsSystemStatus", "data": { "status": "online", "timestamp": "2022-04-19T16:56:06Z" } }
        let timestamp = new Date(tick.data.timestamp).getTime();
        let diff_beetween = interval - timestamp;
        diff_beetween = Math.floor(diff_beetween / 1000 / 60 / 60 / 24);
        online.update((n) => diff_beetween === -1);
        status = tick.data.status;
        error = tick.error;
        countOffline = 0;
      }
    });
  });

  /**
   * onDestroy
   * @description Svelte function native
   */
  onDestroy(() => {
    closeWsKrakenStatus();
    closeWsSystemStatus();
    display = false;
  });
</script>

{#if display === "header" && $mounted}
  <Badge count={countOffline} {color} {background} href="/favicon.png" />
  {#if !$online}
    <div id="error-network">
      <div id="offline">
        <i class="fa fa-exclamation-triangle" />
        {$_("online.errorMessage")}&nbsp;
      </div>
    </div>
  {/if}
{:else if display === "footer" && $mounted}
  {#if krakenIncidents.length}
    <KrakenStatusAPI {krakenIncidents} {krakenStatus} {krakenMaintenances} />
  {/if}
  <div class="online-api">
    {#if error}
      <span class="error_status">{error}</span>
    {/if}
    <span class="wrapper" in:fade>
      {#if status === undefined}
        <span class="dot" />
      {:else if status === "online"}
        <span class="status-green">
          {$_(`online.${status}`)}&nbsp;&nbsp;
        </span>
        <span class="dot dot-green" />
      {:else if status === "offline"}
        <span class="status-red">
          {$_(`online.${status}`)}&nbsp;&nbsp;
        </span>
        <span class="dot dot-red" />
      {:else}
        <span class="status-orange">
          {$_(`online.${status}`)}&nbsp;&nbsp;
        </span>
        <span class="dot dot-orange" />
      {/if}
    </span>
  </div>
{/if}

<style>
  .online-api {
    text-align: right;
    float: right;
    vertical-align: middle;
  }
  .online-api .wrapper {
    font-size: 0.9em;
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

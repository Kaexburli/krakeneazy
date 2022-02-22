<script>
  import { _ } from "svelte-i18n";
  import { onMount, onDestroy } from "svelte";
  import { online } from "store/store.js";
  import websocketStore from "svelte-websocket-store";
  import Badge from "svelte-favicon-badge";
  import KrakenStatusAPI from "components/api/KrakenStatusAPI.svelte";

  // Appel Websocket
  const server = __env["BACKEND_WS_URI"];
  const wss_systemstatus = server + "/systemstatus";
  const wsSystemStatus = websocketStore(wss_systemstatus);
  // Appel Websocket

  let count = 0,
    background = "#FF0000",
    color = "#FFFFFF",
    error = false,
    status = "online",
    interval = Date.now(),
    krakenStatusFetch = false,
    krakenIncidentsFetch = false,
    krakenMaintenances = false,
    krakenStatus = false,
    krakenIncidents = [],
    components = [];

  export let display;

  /**
   * fetchKrakenStatusAPI
   * @description Appels du status KRAKEN
   */
  const fetchKrakenStatusAPI = async () => {
    try {
      const statusKraken = await fetch(__env["KRAKEN_STATUS_API_URL"]);
      if (statusKraken.ok) {
        let body = await statusKraken.json();
        return body;
      }
    } catch (error) {
      console.error("[ERROR]:", error);
    }

    return false;
  };

  /**
   * initKrakenStatusApi
   * @description Initialise les appels du status KRAKEN
   */
  const initKrakenStatusApi = async () => {
    krakenStatusFetch = await fetchKrakenStatusAPI();

    // Vérification des maintenances programmées
    krakenMaintenances = krakenStatusFetch.scheduled_maintenances;

    if (krakenStatusFetch && krakenStatusFetch.status.indicator !== "none") {
      krakenStatus = krakenStatusFetch.status.description;
    }

    // Vérification des components
    const krakenComponents = krakenStatusFetch.components;
    if (krakenComponents.length) {
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
    krakenIncidentsFetch = krakenStatusFetch.incidents;
    if (krakenIncidentsFetch.length) {
      krakenIncidents = [];
      for (const incident of krakenIncidentsFetch) {
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
    wsSystemStatus.subscribe((tick) => {
      initKrakenStatusApi();
      if (typeof tick === "undefined") return false;
      if (tick.service !== "WsSystemStatus") return false;

      if (tick.data.hasOwnProperty("errno")) {
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
      } else if (tick.data.hasOwnProperty("errorMessage")) {
        count = 1;
        error =
          "[" + tick.data.subscription.name + "] " + tick.data.errorMessage;
        status = "offline";
        online.update((n) => false);
      } else if (tick.data.hasOwnProperty("error")) {
        count = 1;
        let message = tick.data.message;
        error = "[" + tick.data.error + "] " + message;
        status = "offline";
      } else if (tick.data.hasOwnProperty("status")) {
        let timestamp = new Date(tick.data.timestamp).getTime();
        let diff_beetween = interval - timestamp;
        diff_beetween = Math.floor(diff_beetween / 1000 / 60 / 60 / 24);
        online.update((n) => diff_beetween === -1);
        status = tick.data.status;
        error = false;
      } else if (!$online && !tick.data.hasOwnProperty("status")) {
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
        <span class="errno">[{error}]</span>&nbsp;
        {$_("online.errorMessage")}
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
      {$_(`online.${status}`)}&nbsp;&nbsp;<span class="dot dot-green" />
    {:else if status === "offline"}
      {$_(`online.${status}`)}&nbsp;&nbsp;<span class="dot dot-red" />
    {:else}
      {$_(`online.${status}`)}<span class="dot" />
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
  .error_status {
    color: red;
    font-size: 0.8em;
  }
  .errno {
    color: #f15353;
  }
  #offline {
    background-color: #5a2828;
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

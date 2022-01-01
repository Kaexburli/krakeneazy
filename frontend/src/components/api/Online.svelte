<script>
  import { onMount } from "svelte";
  import { wssurl, online } from "store/store.js";
  import websocketStore from "svelte-websocket-store";
  import Badge from "svelte-favicon-badge";

  // Appel Websocket
  let wss_systemstatus;
  wssurl.subscribe((server) => (wss_systemstatus = server + "/systemstatus"));
  const wsSystemStatus = websocketStore(wss_systemstatus);
  // Appel Websocket

  let count = 0;
  let background = "#FF0000";
  let color = "#FFFFFF";

  let error = false;
  let status = "online";
  let interval = Date.now();

  export let display;

  onMount(() => {
    wsSystemStatus.subscribe((tick) => {
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
</script>

{#if display === "header"}
  <Badge {count} {color} {background} href="/favicon.png" />
  {#if !$online}
    <div id="error-network">
      <div id="offline">
        <i class="fa fa-exclamation-triangle" />
        <span class="errno">[{error}]</span>&nbsp; Problème réseaux, veuillez
        vérifier votre connection internet.
      </div>
    </div>
  {/if}
{:else if display === "footer"}
  <div class="online-api">
    {#if error}
      <span class="error_status">{error}</span>
    {/if}

    {#if status === undefined}
      <span class="dot" />
    {:else if status === "online"}
      {status}&nbsp;<span class="dot dot-green" />
    {:else if status === "offline"}
      {status}&nbsp;<span class="dot dot-red" />
    {:else}
      <span class="dot" />
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

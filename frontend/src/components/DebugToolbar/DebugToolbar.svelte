<script>
  import { slide } from "svelte/transition";
  import { debugT } from "components/DebugToolBar/DebugToolBar.js";

  let isVisible = false;
  let isPerfVisible = false;
  let hasData = false;

  $: {
    if ($debugT && $debugT !== "" && $debugT.length > 0) hasData = true;
  }

  function sendNavigationTiming() {
    var nt = performance.getEntriesByType("navigation")[0];
    console.log(nt);
    var navigation =
      '<span class="label">Start Time:</span> ' + nt.startTime + "ms <br />";
    navigation +=
      ' <span class="label">Duration:</span>  ' + nt.duration + "ms <br />";
    navigation +=
      ' <span class="label">Unload:</span> ' +
      (nt.unloadEventEnd - nt.unloadEventStart) +
      "ms <br />";
    navigation +=
      ' <span class="label">Redirect:</span> ' +
      (nt.redirectEnd - nt.redirectStart) +
      "ms <br />";
    navigation +=
      ' <span class="label">App Cache:</span> ' +
      (nt.domainLookupStart - nt.fetchStart) +
      "ms <br />";
    navigation +=
      ' <span class="label">DNS:</span> ' +
      (nt.domainLookupEnd - nt.domainLookupStart) +
      "ms <br />";
    navigation +=
      '<span class="label"> TCP:</span> ' +
      (nt.connectEnd - nt.connectStart) +
      "ms <br />";
    navigation +=
      ' <span class="label">Request:</span> ' +
      (nt.responseStart - nt.requestStart) +
      "ms <br />";
    navigation +=
      ' <span class="label">Response:</span> ' +
      (nt.responseEnd - nt.responseStart) +
      "ms <br />";
    navigation +=
      ' <span class="label">Processing: </span>' +
      (nt.domComplete - nt.domContentLoadedEventEnd) +
      "ms <br />";
    navigation +=
      ' <span class="label">Load Event:</span> ' +
      (nt.loadEventEnd - nt.loadEventStart) +
      "ms";
    return navigation;
  }
</script>

{#if isVisible}
  <div id="debugtoolbar" in:slide out:slide>
    <div id="header">
      <h3>
        <i class="fas fa-bug" /> &nbsp; DebugToolBar
        <span class="head right">
          <i
            class="fas fa-clock"
            on:click={() => (isPerfVisible = !isPerfVisible)}
          />
          <i
            class="fas fa-angle-double-down"
            on:click={() => (isVisible = !isVisible)}
          />
        </span>
      </h3>
    </div>
    <div class="container">
      {#if isPerfVisible}
        <div class="performance" in:slide out:slide>
          {@html sendNavigationTiming()}
          <!-- <pre>
        {JSON.stringify(window.performance.timing, false, 2)}
      </pre> -->
        </div>
      {/if}
      {#if $debugT !== "undefined" && $debugT.length > 0 && $debugT}
        {#if typeof $debugT === "object"}
          <pre>
        {JSON.stringify($debugT, false, 2)}
      </pre>
        {:else if typeof $debugT === "string"}
          {$debugT}
        {/if}
      {/if}
    </div>
  </div>
{/if}

<div id="debugtoolbarBtn">
  <i
    id="toogle"
    class="fas fa-bug"
    on:click={() => (isVisible = !isVisible)}
    class:hasData
    class:isVisible
  />
</div>

<style>
  #debugtoolbar {
    position: absolute;
    bottom: 25px;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    background-color: #2c2c2c;
    overflow: auto;
  }
  #debugtoolbar #header {
    height: 30px;
    width: 100%;
    background-color: #8d2525;
    color: #222222;
  }
  #debugtoolbar #header h3 {
    padding: 3px;
  }
  .container {
    width: 100%;
    height: auto;
  }
  .performance {
    font-size: 0.8em;
    color: white;
    font-weight: normal;
    background-color: rgb(0, 58, 58);
    padding: 5px;
    border-top: 1px dotted black;
    border-bottom: 1px dotted black;
  }
  .head i {
    margin: 0 5px;
    cursor: pointer;
  }
  .head i:hover {
    color: white;
  }
  :global(.label) {
    font-size: 1em;
    font-weight: bold;
    color: #a3a3a3;
  }

  #debugtoolbar pre {
    font-family: "Menlo", "Noto Mono", monospace;
    color: white;
    font-size: 1.2em;
    white-space: pre-wrap;
    min-height: 460px;
    display: block;
    padding: 1em;
    tab-size: 2;
    overflow: auto;
    min-width: 600px;
    background-color: #1c1c1c;
    margin: 5px 2px;
    border: 3px solid #242424;
  }

  #debugtoolbarBtn {
    display: block;
    float: right;
    margin: 0 0 0 10px;
  }
  #debugtoolbarBtn #toogle {
    cursor: pointer;
    border: 1px solid rgb(20, 20, 20, 1);
  }
  #debugtoolbarBtn #toogle.hasData {
    color: rgb(0, 255, 0);
  }
  #debugtoolbarBtn #toogle:hover,
  #debugtoolbarBtn #toogle.isVisible {
    border: 1px solid #222222;
    color: brown;
  }
</style>

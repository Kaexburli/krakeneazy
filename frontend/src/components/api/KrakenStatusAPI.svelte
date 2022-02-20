<script>
  import { _ } from "svelte-i18n";
  import { slide } from "svelte/transition";

  export let incidents;

  let isVisible = false;
  let hasData = incidents && incidents.length ? true : false;

  let medium = {
    hour12: false,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const formatter = new Intl.DateTimeFormat(navigator.language, medium);
</script>

{#if isVisible}
  <div id="krakenStatusAPI" in:slide out:slide>
    <div id="header">
      <h3>
        <i class="fas fa-triangle-exclamation" /> &nbsp; {$_(
          "krakenStatusAPI.title"
        )}
        <span class="head right">
          <i
            class="fas fa-angle-double-down"
            on:click={() => (isVisible = !isVisible)}
          />
        </span>
      </h3>
    </div>
    <div class="container">
      {#if isVisible && hasData}
        <div class="incidents" in:slide out:slide>
          {#each incidents as item}
            <h3 class={item.impact}>{item.name}</h3>
            <div class="item">
              <p><strong class="upper">{item.status}</strong> : {item.body}</p>
              <p>
                <strong>
                  {$_("krakenStatusAPI.affected")}
                </strong>
              </p>
              <ul>
                {#each item.affected as affected}
                  <li>{affected.name} : {affected.new_status}</li>
                {/each}
              </ul>
            </div>
            <div class="item-footer">
              <p class="datetime">
                <strong>
                  {$_("krakenStatusAPI.started")}
                </strong>
                {formatter.format(new Date(item.started_at).getTime())}
                <strong>
                  {$_("krakenStatusAPI.updated")}
                </strong>
                {formatter.format(new Date(item.updated_at).getTime())}
                <strong>
                  {$_("krakenStatusAPI.resolved")}
                </strong>
                {#if item.resolved_at === null}
                  --/--/--, --:--:--
                {:else}
                  {formatter.format(new Date(item.resolved_at).getTime())}
                {/if}
              </p>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<div id="krakenStatusAPIBtn">
  <i
    id="toogle"
    class="fas fa-triangle-exclamation"
    on:click={() => (isVisible = !isVisible)}
    class:hasData
    class:isVisible
  />
</div>

<style>
  #krakenStatusAPI {
    position: absolute;
    bottom: 25px;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    background-color: #2c2c2c;
    overflow: auto;
  }
  #krakenStatusAPI #header {
    height: 30px;
    width: 100%;
    background-color: #8d2525;
    color: #222222;
  }
  #krakenStatusAPI #header h3 {
    padding: 3px;
  }
  .container {
    width: 100%;
    height: auto;
    padding: 10px;
  }
  .incidents {
    font-size: 1em;
    color: black;
    font-weight: normal;
    background-color: rgb(167 167 167);
    padding: 0;
    border-top: 1px dotted black;
    border-bottom: 1px dotted black;
  }
  .incidents h3 {
    background-color: #272727;
    padding: 10px;
  }
  .incidents h3.minor {
    color: #222222;
    background-color: #d1a91c;
  }
  .incidents .item {
    padding: 10px;
  }
  .incidents .item-footer {
    padding: 5px;
    background-color: #575757;
  }
  .incidents .datetime {
    font-size: 0.9em;
  }
  .incidents .upper {
    text-transform: uppercase;
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

  #krakenStatusAPIBtn {
    display: block;
    float: right;
    margin: 0 0 0 10px;
  }
  #krakenStatusAPIBtn #toogle {
    cursor: pointer;
    border: 1px solid rgb(20, 20, 20, 1);
  }
  #krakenStatusAPIBtn #toogle.hasData {
    color: #d1a91c;
  }
  #krakenStatusAPIBtn #toogle:hover,
  #krakenStatusAPIBtn #toogle.isVisible {
    border: 1px solid #222222;
    color: #cdeeee;
  }
</style>

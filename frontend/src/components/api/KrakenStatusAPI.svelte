<script>
  import { _ } from "svelte-i18n";
  import { slide } from "svelte/transition";
  import Tooltip, { Wrapper, Content } from "@smui/tooltip";

  export let krakenStatus;
  export let krakenIncidents;
  export let krakenMaintenances;

  let isVisible = false;
  let hasData = krakenIncidents && krakenIncidents.length ? true : false;
  let hasProcess =
    krakenMaintenances && krakenMaintenances.length ? true : false;
  let hasDegraded = krakenStatus ? true : false;

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
        <i class="fas fa-triangle-exclamation" /> &nbsp;
        {$_("krakenStatusAPI.title")}
        <span class="head right">
          <i
            class="fas fa-angle-double-down"
            on:click={() => (isVisible = !isVisible)}
          />
        </span>
      </h3>
    </div>
    <div class="container">
      {#if isVisible && (hasData || hasDegraded || hasProcess)}
        {#if hasProcess}
          <div class="krakenMaintenances" in:slide out:slide>
            <h4>{$_("krakenStatusAPI.titleMaintenance")}</h4>
            {#each krakenMaintenances as item}
              <div class="item">
                <strong>[{item.impact.toUpperCase()}]</strong>
                <a href={item.shortlink} target="_blank">
                  {item.name}
                </a>
                <div class="item-scheduled">
                  <p class="datetime">
                    <strong>
                      {$_("krakenStatusAPI.scheduledFor")}
                    </strong>
                    {formatter.format(new Date(item.scheduled_for).getTime())}
                    <strong>
                      {$_("krakenStatusAPI.scheduledUntil")}
                    </strong>
                    {formatter.format(new Date(item.scheduled_until).getTime())}
                  </p>
                </div>
                {#if item.hasOwnProperty("components") && item.components !== null}
                  <div>
                    <ul>
                      {#each item.components as component}
                        <li>
                          {component.name} : {component.status.replace(
                            "_",
                            " "
                          )}
                        </li>
                      {/each}
                    </ul>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
        {#if hasData}
          <div class="krakenIncidents" in:slide out:slide>
            {#each krakenIncidents as item}
              <div class="content">
                <h4 class={item.impact}>
                  <strong>[{item.impact.toUpperCase()}]</strong>
                  {item.name}
                </h4>
                <div class="item">
                  <p>
                    <strong class="upper">{item.status}</strong> : {item.body}
                  </p>
                  <p>
                    <strong>
                      {$_("krakenStatusAPI.affected")}
                    </strong>
                  </p>
                  {#if item.hasOwnProperty("affected") && item.affected !== null}
                    <ul>
                      {#each item.affected as affected}
                        <li>
                          {affected.name} : {affected.new_status.replace(
                            "_",
                            " "
                          )}
                        </li>
                      {/each}
                    </ul>
                  {/if}
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
              </div>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  </div>
{/if}

{#if hasData || hasDegraded}
  <div id="krakenStatusAPIBtn">
    <Wrapper>
      <i
        id="toogle"
        class="fas fa-triangle-exclamation"
        on:click={() => (isVisible = !isVisible)}
        class:hasData
        class:isVisible
        class:hasDegraded
      />
      {#if krakenStatus}
        <Tooltip xPos="start">
          <Content style="color: #fff;font-size:0.9em;">
            {krakenStatus}
          </Content>
        </Tooltip>
      {/if}
    </Wrapper>
  </div>
{/if}

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
    max-height: 600px;
  }
  #krakenStatusAPI #header {
    height: 30px;
    width: 100%;
    background-color: #c7c7c7;
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
  .krakenMaintenances {
    font-size: 0.9em;
    color: #272727;
    font-weight: normal;
    padding: 0;
    border-top: 1px dotted black;
    border-bottom: 1px dotted black;
  }
  .krakenMaintenances h4 {
    background-color: #00706e;
    padding: 10px;
  }
  .krakenMaintenances .item a {
    color: #534100;
  }

  .krakenMaintenances .item {
    padding: 10px;
    margin-bottom: 5px;
    background-color: rgb(167 167 167);
  }
  .krakenIncidents {
    font-size: 0.8em;
    color: black;
    font-weight: normal;
    padding: 0;
    border-top: 1px dotted black;
    border-bottom: 1px dotted black;
  }
  .krakenIncidents .content {
    width: 50%;
    float: left;
    border: 1px solid #2c2c2c;
  }
  .krakenIncidents h4 {
    background-color: #272727;
    padding: 10px;
  }
  .krakenIncidents h4.minor {
    color: #222222;
    background-color: #d1a91c;
  }
  .krakenIncidents h4.major {
    color: #222222;
    background-color: #d20000;
  }
  .krakenIncidents .item {
    min-height: 100px;
    padding: 10px;
    background-color: rgb(167 167 167);
  }
  .krakenIncidents .item-footer {
    padding: 5px;
    background-color: #575757;
    margin-bottom: 1px;
    font-size: 0.8em;
    color: lightblue;
  }
  .krakenIncidents .datetime {
    font-size: 0.9em;
  }
  .krakenIncidents .upper {
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
  #krakenStatusAPIBtn #toogle.hasDegraded {
    color: #d11c1c;
  }
  #krakenStatusAPIBtn #toogle:hover,
  #krakenStatusAPIBtn #toogle.isVisible {
    border: 1px solid #222222;
    color: #cdeeee;
  }
</style>

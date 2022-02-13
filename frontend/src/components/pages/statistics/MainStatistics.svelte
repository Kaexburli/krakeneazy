<script>
  import { _ } from "svelte-i18n";
  import { slide } from "svelte/transition";
  import Statistics from "components/pages/statistics/Statistics.svelte";
</script>

<div id="page-statistic" in:slide out:slide>
  <h1>{$_("statistics.title")}</h1>
  <div class="statistics">
    <Statistics />
  </div>
</div>

<style>
  .statistics {
    display: grid;
    /* grid-template-rows: repeat(2, 50px); */

    background-color: #212121;
    padding: 5px 10px;
    border: 1px solid #2e2e2e;
  }
  :global(.statistics div.block) {
    margin: 5px;
    padding: 10px;
    min-width: 200px;
    background-color: #282828;
    font-size: 0.8em;
  }
  :global(.statistics div.block h3) {
    background-color: darkgrey;
    color: #222222;
    padding: 5px;
    margin: -10px -10px 5px -10px;
    font-size: 1.1em;
  }
</style>

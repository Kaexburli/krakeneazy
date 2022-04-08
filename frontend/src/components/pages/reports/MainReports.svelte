<script>
  import { _ } from "svelte-i18n";
  import { User } from "store/userStore.js";
  import { slide } from "svelte/transition";
  import ExportData from "components/pages/reports/Export.svelte";

  const isLogged = User.isLogged();
</script>

{#if isLogged}
  <div id="page-reports" in:slide out:slide>
    <h1>{$_("reports.main.title")}</h1>

    <div class="reports">
      <ExportData />
    </div>
  </div>
{/if}

<style>
  .reports {
    display: grid;
    /* grid-template-rows: repeat(2, 50px); */

    background-color: #212121;
    /* padding: 5px 10px; */
    border: 1px solid #2e2e2e;
  }
  :global(.reports div.block) {
    margin: 5px;
    padding: 10px;
    min-width: 200px;
    background-color: #282828;
    font-size: 0.8em;
  }
  :global(.reports div.block h3) {
    background-color: darkgrey;
    color: #222222;
    padding: 5px;
    margin: -10px -10px 5px -10px;
    font-size: 1.1em;
  }
</style>

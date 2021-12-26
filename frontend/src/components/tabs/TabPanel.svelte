<script>
  import { getContext } from "svelte";
  import { TABS } from "components/tabs/Tabs.svelte";

  const panel = {};
  const { registerPanel, selectedPanel } = getContext(TABS);

  registerPanel(panel);
</script>

{#if $selectedPanel === panel}
  <div class="tab-content">
    <slot />
  </div>
{/if}

<style>
  .tab-content {
    padding: 0px 2px 2px 2px;
  }
</style>

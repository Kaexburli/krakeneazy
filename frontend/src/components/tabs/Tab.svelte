<script>
  import { getContext } from "svelte";
  import { TABS } from "components/tabs/Tabs.svelte";

  const tab = {};
  const { registerTab, selectTab, selectedTab } = getContext(TABS);

  registerTab(tab);
</script>

<button class:selected={$selectedTab === tab} on:click={() => selectTab(tab)}>
  <slot />
</button>

<style>
  button {
    color: #cdcdcd;
    display: inline-block;
    padding: 10px;
    background-color: #282828;

    border-top: 1px solid #181818;
    border-left: 1px solid #181818;
    border-right: 1px solid #181818;
    border-bottom: none;

    -webkit-border-top-left-radius: 5px;
    -webkit-border-top-right-radius: 5px;
    -moz-border-radius-topleft: 5px;
    -moz-border-radius-topright: 5px;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;

    font-size: 0.8em;
  }
  button:hover {
    background-color: #414141;
    cursor: pointer;
  }
  .selected {
    background-color: #414141;
  }
</style>

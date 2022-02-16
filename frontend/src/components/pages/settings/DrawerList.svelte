<script>
  import Drawer, { AppContent, Content } from "@smui/drawer";
  import List, { Item, Text, Separator } from "@smui/list";

  export let items = [];
  export let activeTabPosition = 1;
</script>

<div class="drawer-container">
  <Drawer>
    <Content>
      <List>
        {#each items as item}
          <Item
            href="javascript:void(0)"
            on:click={() => (activeTabPosition = item.position)}
          >
            <Text>{item.label}</Text>
          </Item>
          <Separator />
        {/each}
      </List>
    </Content>
  </Drawer>

  {#each items as item}
    {#if activeTabPosition == item.position}
      <AppContent class="app-content">
        <div class="mdc-typography--headline6 p10 bcb">{item.subtitle}</div>
        <main class="main-content">
          <svelte:component this={item.component} />
        </main>
      </AppContent>
    {/if}
  {/each}
</div>

<style>
  /* These classes are only needed because the
    drawer is in a container on the page. */
  .drawer-container {
    position: relative;
    display: flex;
    align-items: stretch;
    border: 1px solid #222222;
    overflow: hidden;
    z-index: 0;
  }

  * :global(.app-content) {
    flex: auto;
    /* overflow: auto; */
    position: relative;
    /* flex-grow: 1; */
  }

  .main-content {
    overflow: auto;
    padding: 16px;
    height: 100%;
    box-sizing: border-box;
    background-color: #272727;
  }

  .p10 {
    padding: 10px;
  }

  .bcb {
    background-color: brown;
  }
</style>

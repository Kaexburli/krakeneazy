<script>
  // ---------------------------------------------------------
  //  Imports
  // ---------------------------------------------------------
  import { onMount } from "svelte";
  import SelectDevises from "components/SelectDevises.svelte";
  import AssetPairsSearch from "components/AssetPairsSearch.svelte";
  import Logout from "components/Logout.svelte";

  // ---------------------------------------------------------
  //  Props
  // ---------------------------------------------------------
  let sidebar = null,
    domLoaded = false;

  // ---------------------------------------------------------
  //  Methods Declarations
  // ---------------------------------------------------------
  const bootstrap = (readyState) => {
    if (["interactive", "complete"].includes(readyState)) {
      sidebar = document.getElementById("sidebar");
      domLoaded = true;
    }
  };

  const handleClickMenu = (e) => {
    document.body.classList.toggle("active");
    if (!sidebar) console.debug("[ERROR] handleClickMenu");
    else sidebar.classList.toggle("active");
  };

  onMount(() => {
    bootstrap(document.readyState);
  });

  $: if (domLoaded) handleClickMenu();
</script>

<div class="header">
  <div class="top_navbar">
    <div class="toggle-menu">
      <a href={"#"} on:click|preventDefault={handleClickMenu}>
        <i class="fas fa-bars" />
      </a>
    </div>
    <AssetPairsSearch />
    <SelectDevises />
    <Logout />
  </div>
</div>

<style>
  .header {
    width: calc(100% - 1px);
    margin-left: 1px;
    transition: all 0.5s ease;

    position: fixed;
    z-index: 10;
    top: 0;
    right: 0;
  }
  .header .top_navbar {
    background: rgb(40, 40, 40);
    border-bottom: 1px solid #272727;
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 30px;
  }
  .header .top_navbar .toggle-menu a {
    font-size: 28px;
    color: #f4fbff;
  }
  .header .top_navbar .toggle-menu a:hover {
    color: #a2ecff;
  }
</style>

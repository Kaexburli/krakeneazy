<script>
  import SelectDevises from "components/SelectDevises.svelte";
  import AssetPairsSearch from "components/AssetPairsSearch.svelte";

  const handleClickMenu = (e) => {
    document.body.classList.toggle("active");
    document.getElementById("sidebar").classList.toggle("active");
  };

  // Active par default
  document.addEventListener("DOMContentLoaded", function (event) {
    handleClickMenu();
  });
</script>

<div class="header">
  <div class="top_navbar">
    <div class="toggle-menu">
      <a href="/" on:click|preventDefault={handleClickMenu}>
        <i class="fas fa-bars" />
      </a>
    </div>
    <AssetPairsSearch />
    <SelectDevises />
  </div>
</div>

<style>
  .header {
    width: calc(100% - 1px);
    margin-left: 1px;
    transition: all 0.5s ease;

    position: fixed;
    z-index: 2;
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

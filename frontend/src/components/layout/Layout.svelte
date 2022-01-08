<script>
  import Sidebar from "components/layout/Sidebar.svelte";
  import Header from "components/layout/Header.svelte";
  import Main from "components/layout/Main.svelte";
  import Footer from "components/layout/Footer.svelte";
  import OnlineApi from "components/api/Online.svelte";
  import GetAssets from "components/api/GetAssets.svelte";
  import PriceALert from "components/api/PriceALert.svelte";
  import { Modals, closeModal } from "svelte-modals";
</script>

<div class="layout">
  <!-- // No displaying -->
  <OnlineApi display="header" />
  <GetAssets />
  <PriceALert />
  <Modals>
    <div slot="backdrop" class="backdrop" on:click={closeModal} />
  </Modals>
  <!-- // No displaying -->

  <Header />
  <Sidebar />
  <Main />
  <Footer />
  <PriceALert display="true" />
</div>

<style>
  .layout {
    width: 100%;
    min-height: 100%;
    margin-bottom: -50px;
    display: inline-block;
  }
  .backdrop {
    position: fixed;
    z-index: 888;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
  }
</style>

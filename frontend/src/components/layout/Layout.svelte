<script>
  import Sidebar from "components/layout/Sidebar.svelte";
  import Header from "components/layout/Header.svelte";
  import Main from "components/layout/Main.svelte";
  import Footer from "components/layout/Footer.svelte";
  import OnlineApi from "components/api/Online.svelte";
  import GetAssets from "components/api/GetAssets.svelte";
</script>

<div class="layout">
  <!-- // No displaying -->
  <OnlineApi display="header" />
  <GetAssets />
  <!-- // No displaying -->

  <Header />
  <Sidebar />
  <Main />
  <Footer />
</div>

<style>
  .layout {
    width: 100%;
    min-height: 100%;
    margin-bottom: -50px;
    display: inline-block;
  }
</style>
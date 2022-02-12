<script>
  import Sidebar from "components/layout/Sidebar.svelte";
  import Header from "components/layout/Header.svelte";
  import Main from "components/layout/Main.svelte";
  import Footer from "components/layout/Footer.svelte";
  import OnlineApi from "components/api/Online.svelte";
  import GetAssets from "components/api/GetAssets.svelte";
  import PriceAlert from "components/api/PriceAlert.svelte";
  import Authentification from "components/pages/auth/Authentification.svelte";
  import { Modals, closeModal } from "svelte-modals";
  import { User } from "store/userStore.js";

  /** I18n */
  import { addMessages, init, getLocaleFromNavigator } from "svelte-i18n";
  import en from "lang/en.json";
  import fr from "lang/fr.json";
  addMessages("en", en);
  addMessages("fr", fr);
  init({ fallbackLocale: "en", initialLocale: getLocaleFromNavigator() });

  /** Authentification */
  let isLoggedIn;
  User.init();

  /** store */
  $: isLoggedIn = User.isLogged();
</script>

{#if !isLoggedIn}
  <Authentification />
{:else}
  <div class="layout">
    <!-- // No displaying -->
    <OnlineApi display="header" />
    <GetAssets />
    <PriceAlert />
    <Modals>
      <div slot="backdrop" class="backdrop" on:click={closeModal} />
    </Modals>
    <!-- // No displaying -->

    <Header />
    <Sidebar />
    <Main />
    <Footer />
    <PriceAlert display="true" />
  </div>
{/if}

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

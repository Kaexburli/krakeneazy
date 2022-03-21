<script>
  import { onMount, setContext } from "svelte";
  import Sidebar from "components/layout/Sidebar.svelte";
  import Header from "components/layout/Header.svelte";
  import Main from "components/layout/Main.svelte";
  import Footer from "components/layout/Footer.svelte";
  import OnlineApi from "components/api/Online.svelte";
  import GetAssets from "components/api/GetAssets.svelte";
  import PriceAlert from "components/api/PriceAlert.svelte";
  import Authentification from "components/pages/auth/Authentification.svelte";
  import { Modals, closeModal } from "svelte-modals";
  import { User, hasApikeysStore } from "store/userStore.js";
  import { SvelteToast } from "@zerodevx/svelte-toast";

  /** I18n */
  import { addMessages, init, getLocaleFromNavigator } from "svelte-i18n";
  import en from "lang/en.json";
  import fr from "lang/fr.json";
  addMessages("en", en);
  addMessages("fr", fr);
  init({
    fallbackLocale: "en",
    initialLocale: getLocaleFromNavigator(),
  });

  /** Authentification */
  let userProfile;
  let isLoggedIn;
  User.init();
  isLoggedIn = User.isLogged();
  const getProfile = async () => {
    return await User.getProfile();
  };

  // Vérification des clés api pour l'affichage du menu
  const hasApikeys = {
    subscribe: hasApikeysStore.subscribe,
    change: (data) => {
      hasApikeysStore.update(() => data);
    },
  };
  setContext("data", hasApikeys);

  onMount(async () => {
    userProfile = await getProfile();
  });

  /** store */
  $: if (userProfile) {
    let change = userProfile.user.apikeys.length ? true : false;
    hasApikeys.change(change);
  }
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
    <Sidebar {isLoggedIn} />
    <Main {User} />
    <Footer />
  </div>
{/if}

<SvelteToast />
<div class="wrap">
  <SvelteToast target="new" />
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

  /* SvelteToast */
  .wrap {
    --toastContainerTop: 0.2rem;
    --toastContainerRight: 0.5rem;
    --toastContainerBottom: auto;
    --toastContainerLeft: 0.5rem;
    --toastWidth: 50%;
    --toastMinHeight: 2rem;
    --toastPadding: 0 0.5rem;
    font-size: 0.875rem;
  }
  @media (min-width: 40rem) {
    .wrap {
      --toastContainerRight: auto;
      --toastContainerLeft: calc(50vw - 20rem);
      --toastWidth: 40rem;
    }
  }
</style>

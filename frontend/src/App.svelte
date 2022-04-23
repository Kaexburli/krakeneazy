<script>
  import Layout from "components/layout/Layout.svelte";
  import { pair, assetpair } from "store/store.js";
  import { BrowserTabTracker } from "browser-session-tabs";

  const env = __App["env"].ENVIRONMENT;

  // Réinjecte la dernier recherche assetPair pour les nouveau onglets
  const sessionId = BrowserTabTracker.sessionId;
  if (sessionId) {
    let _sessionStorage = JSON.parse(
      localStorage.getItem(`${sessionId}_lastSearchPair`)
    );

    if (
      (!$pair || !$assetpair) &&
      _sessionStorage &&
      Object.prototype.hasOwnProperty.call(_sessionStorage, "pair") &&
      Object.prototype.hasOwnProperty.call(_sessionStorage, "assetpair")
    ) {
      $pair = _sessionStorage.pair;
      $assetpair = _sessionStorage.assetpair;
    }
  }

  console.log();
</script>

<svelte:head>
  {#if env === "production"}
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script
      async
      src="https://www.googletagmanager.com/gtag/js?id=G-9Z0L8Q1CNS"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag("js", new Date());

      gtag("config", "G-9Z0L8Q1CNS");
    </script>
  {/if}
</svelte:head>

<Layout />

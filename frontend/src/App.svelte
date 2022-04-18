<script>
  import Layout from "components/layout/Layout.svelte";

  const env = __App["env"].ENVIRONMENT;
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

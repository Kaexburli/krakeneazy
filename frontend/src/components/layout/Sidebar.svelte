<script>
  import { _ } from "svelte-i18n";
  import { page } from "store/store.js";
  import { hasApikeysStore } from "store/userStore.js";

  // User
  export let isLoggedIn;
  if (!isLoggedIn) page.update((n) => "home");

  const handleClickMenu = (slug) => {
    if (slug && typeof slug !== ("undefined" || null)) page.update((n) => slug);
  };

  // Pages
  const pages = [
    {
      name: $_("sidebar.home"),
      slug: "home",
      icon: "fa-home",
      authenticated: false,
      apikeys: false,
    },
    {
      name: $_("sidebar.account"),
      slug: "account",
      icon: "fa-user-shield",
      authenticated: true,
      apikeys: true,
    },
    {
      name: $_("sidebar.trading"),
      slug: "trading",
      icon: "fa-desktop",
      authenticated: true,
      apikeys: true,
    },
    {
      name: $_("sidebar.statistics"),
      slug: "statistic",
      icon: "fa-tachometer-alt",
      authenticated: true,
      apikeys: true,
    },
    {
      name: $_("sidebar.reports"),
      slug: "reports",
      icon: "fa-chart-line",
      authenticated: true,
      apikeys: true,
    },
    {
      name: $_("sidebar.settings"),
      slug: "settings",
      icon: "fa-cog",
      authenticated: true,
      apikeys: false,
    },
  ];
</script>

<div id="sidebar">
  <div class="logo">
    <h3>{$_("site.name")}</h3>
  </div>
  <ul>
    {#each pages as { name, slug, icon, authenticated, apikeys }, i}
      {#if !authenticated || (authenticated && isLoggedIn && !apikeys) || (apikeys && $hasApikeysStore)}
        <li>
          <a
            href="/{slug}"
            class:active={$page === slug}
            on:click|preventDefault={() => handleClickMenu(slug)}
          >
            <span class="icon"><i class="fas {icon}" /></span>
            <span class="item">{name}</span>
          </a>
        </li>
      {/if}
    {/each}
  </ul>
</div>

<style>
  #sidebar:global(.active) {
    left: 0;
    width: 60px;
    display: flex;
    flex-direction: column;
  }

  #sidebar:global(.active li span.item) {
    display: none;
    visibility: hidden;
    opacity: 0;
    transition-delay: 0s;
  }

  #sidebar li span.item {
    display: inline-block;
    visibility: visible;
    opacity: 1;
    transition: visibility 0s linear 0.5s, opacity 0.5s linear;
  }

  #sidebar:global(.active) ul li a {
    font-size: 20px;
    padding: 15px;
  }

  #sidebar {
    background: rgb(34, 34, 34);
    position: fixed;
    top: 0;
    left: 0;
    width: 175px;
    height: 100%;
    padding: 0 0 20px 0;
    transition: all 0.5s ease;
  }

  #sidebar .logo {
    padding: 10px;
    text-align: center;
    height: 50px;
    background-color: #181818;
  }

  #sidebar .logo h3 {
    color: #ffffff;
    margin: 0;
  }

  #sidebar ul li a {
    display: block;
    padding: 13px 30px;
    border-bottom: 1px solid #343434;
    color: rgb(241, 237, 237);
    font-size: 0.8em;
    position: relative;
  }

  #sidebar ul li a .icon {
    color: #dee4ec;
    width: 30px;
    display: inline-block;
  }
  #sidebar ul li a:hover,
  #sidebar ul li a.active {
    color: #dbdbdb;

    background: rgb(46, 46, 46);
    border-right: 2px solid rgb(34, 34, 34);
  }

  #sidebar ul li a:hover .icon,
  #sidebar ul li a.active .icon {
    color: #dbdbdb;
  }

  #sidebar ul li a:hover:before,
  #sidebar ul li a.active:before {
    display: block;
  }
</style>

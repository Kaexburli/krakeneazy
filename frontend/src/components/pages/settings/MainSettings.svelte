<script>
  import { _ } from "svelte-i18n";
  import { User } from "store/userStore.js";
  import { slide } from "svelte/transition";

  import DrawerList from "./DrawerList.svelte";
  import Profile from "./profile.svelte";
  import Kraken from "./kraken.svelte";
  import Settings from "./settings.svelte";

  const isLogged = User.isLogged();

  let items = [
    {
      label: $_("settings.drawer.labels.profile"),
      subtitle: $_("settings.drawer.subtitle.profile"),
      position: 1,
      component: Profile,
    },
    {
      label: $_("settings.drawer.labels.kraken"),
      subtitle: $_("settings.drawer.subtitle.kraken"),
      position: 2,
      component: Kraken,
    },
    {
      label: $_("settings.drawer.labels.settings"),
      subtitle: $_("settings.drawer.subtitle.settings"),
      position: 3,
      component: Settings,
    },
  ];
</script>

{#if isLogged}
  <div id="page-settings" in:slide out:slide>
    <h1>{$_("settings.title")}</h1>

    <div class="box">
      <DrawerList {items} />
    </div>
  </div>
{/if}

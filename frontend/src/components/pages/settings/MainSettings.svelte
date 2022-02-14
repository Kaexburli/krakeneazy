<script>
  import { _ } from "svelte-i18n";
  import { slide } from "svelte/transition";

  import DrawerList from "./DrawerList.svelte";
  import Profile from "./profile.svelte";
  import Tab2 from "./kraken.svelte";
  import Tab3 from "./settings.svelte";

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
      component: Tab2,
    },
    {
      label: $_("settings.drawer.labels.settings"),
      subtitle: $_("settings.drawer.subtitle.settings"),
      position: 3,
      component: Tab3,
    },
  ];
</script>

<div id="page-settings" in:slide out:slide>
  <h1>{$_("settings.title")}</h1>

  <div class="box">
    <DrawerList {items} />
  </div>
</div>

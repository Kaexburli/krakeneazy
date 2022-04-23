<script>
  // ---------------------------------------------------------
  //  Imports
  // ---------------------------------------------------------
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";
  import { User } from "store/userStore.js";

  // ---------------------------------------------------------
  //  Props
  // ---------------------------------------------------------
  let userProfile = false;

  // ---------------------------------------------------------
  //  Methods Declarations
  // ---------------------------------------------------------
  const getProfile = async () => {
    return await User.getProfile();
  };

  onMount(async () => {
    userProfile = await getProfile();
  });

  $: console.log(userProfile);
</script>

Settings
{#if userProfile}
  <pre>{JSON.stringify(userProfile.user.settings, false, 2)}</pre>
{/if}

<script>
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";
  import { User } from "store/userStore.js";

  let userProfile = false;

  const getProfile = async () => {
    return await User.getProfile();
  };

  onMount(async () => {
    userProfile = await getProfile();
  });
</script>

Settings
{#if userProfile}
  <pre>{JSON.stringify(userProfile.user.settings, false, 2)}</pre>
{/if}

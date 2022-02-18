<script>
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";
  import { User } from "store/userStore.js";

  import FormField from "@smui/form-field";
  import Radio from "@smui/radio";
  import Button from "@smui/button";
  import Checkbox from "@smui/checkbox";
  import Textfield from "@smui/textfield";
  import Icon from "@smui/textfield/icon";
  import HelperText from "@smui/textfield/helper-text";
  import LayoutGrid, { Cell } from "@smui/layout-grid";

  let userProfile = false,
    firstname = "",
    lastname = "",
    username = "",
    email = "";

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

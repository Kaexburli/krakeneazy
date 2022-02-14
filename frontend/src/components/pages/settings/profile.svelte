<script>
  import { _ } from "svelte-i18n";
  import { User } from "store/userStore.js";

  let profile = false;
  $: if ($User) {
    (async () => {
      profile = await User.getProfile();
    })();
  }

  import FormField from "@smui/form-field";
  import Radio from "@smui/radio";
  import Button from "@smui/button";
  import Checkbox from "@smui/checkbox";
  import Textfield from "@smui/textfield";
  import Icon from "@smui/textfield/icon";
  import HelperText from "@smui/textfield/helper-text";
  import LayoutGrid, { Cell } from "@smui/layout-grid";

  let firstname = "",
    lastname = "",
    username = "",
    email = "";
</script>

{#if profile}
  <LayoutGrid>
    <Cell span={6}>
      <div class="margins mbot">
        <h4>{$_("settings.profile.firstname.label")}</h4>
        <Textfield
          style="width: 100%;"
          helperLine$style="width: 100%;"
          bind:value={firstname}
          label={profile.user.firstname}
        >
          <HelperText slot="helper"
            >{$_("settings.profile.firstname.helper")}</HelperText
          >
        </Textfield>
      </div>
      <div class="margins mbot">
        <h4>{$_("settings.profile.lastname.label")}</h4>
        <Textfield
          style="width: 100%;"
          helperLine$style="width: 100%;"
          bind:value={lastname}
          label={profile.user.lastname}
          autocomplete="off"
        >
          <HelperText slot="helper"
            >{$_("settings.profile.lastname.helper")}</HelperText
          >
        </Textfield>
      </div>
      <div class="margins mbot">
        <h4>{$_("settings.profile.password.label")}</h4>
        <Textfield
          style="width: 100%;"
          helperLine$style="width: 100%;"
          bind:value={email}
          label=""
          autocomplete="off"
        >
          <HelperText slot="helper"
            >{$_("settings.profile.password.helper")}</HelperText
          >
        </Textfield>
      </div>
    </Cell>
    <Cell span={6}>
      <div class="margins mbot">
        <h4>{$_("settings.profile.username.label")}</h4>
        <Textfield
          style="width: 100%;"
          helperLine$style="width: 100%;"
          bind:value={username}
          label={profile.user.username}
          autocomplete="off"
        >
          <HelperText slot="helper"
            >{$_("settings.profile.username.helper")}</HelperText
          >
        </Textfield>
      </div>
      <div class="margins mbot">
        <h4>{$_("settings.profile.email.label")}</h4>
        <Textfield
          style="width: 100%;"
          helperLine$style="width: 100%;"
          bind:value={email}
          label={profile.user.email}
          autocomplete="off"
        >
          <HelperText slot="helper"
            >{$_("settings.profile.email.helper")}</HelperText
          >
        </Textfield>
      </div>
      <div class="margins mbot">
        <h4>{$_("settings.profile.passwordConfirm.label")}</h4>
        <Textfield
          style="width: 100%;"
          helperLine$style="width: 100%;"
          bind:value={email}
          label=""
          autocomplete="off"
        >
          <HelperText slot="helper"
            >{$_("settings.profile.passwordConfirm.helper")}</HelperText
          >
        </Textfield>
      </div>
    </Cell>
  </LayoutGrid>
{/if}

<style>
  .mbot {
    margin-bottom: 10px;
  }
</style>

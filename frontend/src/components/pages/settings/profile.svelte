<script>
  import { t, _ } from "svelte-i18n";
  import { onMount } from "svelte";
  import { User } from "store/userStore.js";
  import { changeUserData } from "utils/userApi.js";
  import { Moon } from "svelte-loading-spinners";
  import { toast } from "@zerodevx/svelte-toast";

  import Textfield from "@smui/textfield";
  import Icon from "@smui/textfield/icon";
  import HelperText from "@smui/textfield/helper-text";
  import LayoutGrid, { Cell } from "@smui/layout-grid";

  let userProfile = false,
    firstname = "",
    lastname = "",
    username = "",
    email = "",
    password = "",
    passwordConfirm = "",
    saveLoad = false,
    invalidEmail = false,
    invalidFirstname = false,
    invalidLastname = false,
    invalidUsername = false,
    invalidPassword = false,
    invalidPasswordConfirm = false;

  const fieldsLabel = {
    firstname: $_("settings.profile.firstname.label"),
    lastname: $_("settings.profile.lastname.label"),
    username: $_("settings.profile.username.label"),
    email: $_("settings.profile.email.label"),
    password: $_("settings.profile.password.label"),
    passwordConfirm: $_("settings.profile.password.label"),
  };

  /**
   * escapeRegExp
   * @description Echap les caractères dans le mot de passe
   * @param { String } psswd Mot de passe
   */
  const escapeRegExp = (psswd) => {
    return psswd.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, "\\$&");
  };

  /**
   * Notification
   * @description Envoi une alert message
   * @param { String } message Message a afficher
   * @param { String } theme Thème (default, success, error)
   */
  const Notification = (message, theme = "default", reload = false) => {
    if (!message) return;

    const themes = {
      default: {},
      success: {
        "--toastBackground": "darkgreen",
        "--toastBarBackground": "#1f4a22",
      },
      error: {
        "--toastBackground": "brown",
        "--toastBarBackground": "#4a1f1f",
      },
    };
    theme = themes[theme];

    toast.push(message, {
      initial: 0,
      next: 1,
      pausable: true,
      dismissable: true,
      target: "new",
      theme,
      duration: reload ? 500 : 5000,
      onpop: () => {
        reload ? location.reload() : false;
      },
    });
  };

  const handleChange = async (e, field) => {
    saveLoad = field;
    const value = e.target.value;
    const validated =
      invalidFirstname ||
      invalidLastname ||
      invalidEmail ||
      invalidUsername ||
      invalidPassword ||
      invalidPasswordConfirm;

    if (field === "password") {
      saveLoad = false;
      if (validated) {
        Notification(
          $_("settings.profile.error", { values: { field } }),
          "error"
        );
        return false;
      } else return true;
    }

    if (validated && field !== "email") {
      Notification(
        $_("settings.profile.error", { values: { field: fieldsLabel[field] } }),
        "error"
      );
      saveLoad = false;
      return false;
    } else {
      if (field === "passwordConfirm") field = "password";
      const change = await changeUserData(
        userProfile.token,
        { [field]: value },
        field
      );

      if (change.ok) {
        Notification(
          $_("settings.profile.success", {
            values: { field: fieldsLabel[field] },
          }),
          "success"
        );
        userProfile = await getProfile();
      } else {
        Notification(change.message, "error");
      }
      saveLoad = false;
      return true;
    }
  };

  const getProfile = async () => {
    return await User.getProfile();
  };

  onMount(async () => {
    userProfile = await getProfile();
  });
</script>

{#if userProfile}
  <LayoutGrid>
    <Cell span={6}>
      <div class="margins mbot">
        <h4>{fieldsLabel.firstname}</h4>
        <Textfield
          type="name"
          style="width: 100%;"
          helperLine$style="width: 100%;"
          input$autocomplete="name"
          bind:value={firstname}
          bind:invalid={invalidFirstname}
          updateInvalid
          label={userProfile.user.firstname}
          on:change={(e) => handleChange(e, "firstname")}
          input$pattern={"^[a-zA-Z-]+$"}
          autocomplete="off"
        >
          <Icon class="material-icons" slot="leadingIcon">person</Icon>
          <Icon class="material-icons" slot="trailingIcon">
            {#if saveLoad === "firstname"}
              <Moon size="20" color="#e8e8e8" unit="px" duration="0.5s" />
            {:else}
              &nbsp;
            {/if}
          </Icon>
          <HelperText validationMsg slot="helper">
            {$_("settings.profile.firstname.helper")}
          </HelperText>
        </Textfield>
      </div>
      <div class="margins mbot">
        <h4>{fieldsLabel.username}</h4>
        <Textfield
          type="username"
          style="width: 100%;"
          helperLine$style="width: 100%;"
          input$autocomplete="username"
          bind:value={username}
          bind:invalid={invalidUsername}
          updateInvalid
          label={userProfile.user.username}
          on:change={(e) => handleChange(e, "username")}
          input$pattern={"^[A-Za-z0-9_-]{1,254}$"}
          autocomplete="off"
        >
          <Icon class="material-icons" slot="leadingIcon">perm_identity</Icon>
          <Icon class="material-icons" slot="trailingIcon">
            {#if saveLoad === "username"}
              <Moon size="20" color="#e8e8e8" unit="px" duration="0.5s" />
            {:else}
              &nbsp;
            {/if}
          </Icon>
          <HelperText validationMsg slot="helper">
            {$_("settings.profile.username.helper")}
          </HelperText>
        </Textfield>
      </div>
      <div class="margins mbot">
        <h4>{fieldsLabel.password}</h4>
        <Textfield
          type="password"
          style="width: 100%;"
          helperLine$style="width: 100%;"
          input$autocomplete="name"
          bind:value={password}
          bind:invalid={invalidPassword}
          updateInvalid
          label=""
          on:change={(e) => handleChange(e, "password")}
          input$pattern={"^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$"}
          autocomplete="off"
        >
          <Icon class="material-icons" slot="leadingIcon">lock</Icon>
          <Icon class="material-icons" slot="trailingIcon">
            {#if saveLoad === "password"}
              <Moon size="20" color="#e8e8e8" unit="px" duration="0.5s" />
            {:else}
              &nbsp;
            {/if}
          </Icon>
          <HelperText validationMsg slot="helper">
            {$_("settings.profile.password.helper")}
          </HelperText>
        </Textfield>
      </div>
    </Cell>
    <Cell span={6}>
      <div class="margins mbot">
        <h4>{fieldsLabel.lastname}</h4>
        <Textfield
          type="name"
          style="width: 100%;"
          helperLine$style="width: 100%;"
          input$autocomplete="name"
          bind:value={lastname}
          bind:invalid={invalidLastname}
          updateInvalid
          label={userProfile.user.lastname}
          on:change={(e) => handleChange(e, "lastname")}
          input$pattern={"^[a-zA-Z-]+$"}
          autocomplete="off"
        >
          <Icon class="material-icons" slot="leadingIcon">person</Icon>
          <Icon class="material-icons" slot="trailingIcon">
            {#if saveLoad === "lastname"}
              <Moon size="20" color="#e8e8e8" unit="px" duration="0.5s" />
            {:else}
              &nbsp;
            {/if}
          </Icon>
          <HelperText validationMsg slot="helper">
            {$_("settings.profile.lastname.helper")}
          </HelperText>
        </Textfield>
      </div>

      <div class="margins mbot">
        <h4>{fieldsLabel.email}</h4>
        <Textfield
          type="email"
          style="width: 100%;"
          helperLine$style="width: 100%;"
          input$autocomplete="email"
          bind:value={email}
          bind:invalid={invalidEmail}
          updateInvalid
          label={userProfile.user.email}
          on:change={(e) => handleChange(e, "email")}
          autocomplete="off"
          disabled
        >
          <Icon class="material-icons" slot="leadingIcon">email</Icon>
          <Icon class="material-icons" slot="trailingIcon">
            {#if saveLoad === "email"}
              <Moon size="20" color="#e8e8e8" unit="px" duration="0.5s" />
            {:else}
              &nbsp;
            {/if}
          </Icon>
          <HelperText validationMsg slot="helper">
            {$_("settings.profile.email.helper")}
          </HelperText>
        </Textfield>
      </div>
      <div class="margins mbot">
        <h4>{fieldsLabel.passwordConfirm}</h4>
        <Textfield
          type="password"
          style="width: 100%;"
          helperLine$style="width: 100%;"
          input$autocomplete="name"
          bind:value={passwordConfirm}
          bind:invalid={invalidPasswordConfirm}
          updateInvalid
          label=""
          on:change={(e) => handleChange(e, "passwordConfirm")}
          input$pattern={"^" + escapeRegExp(password).replace(/\*/, ".*") + "$"}
          autocomplete="off"
        >
          <Icon class="material-icons" slot="leadingIcon">lock</Icon>
          <Icon class="material-icons" slot="trailingIcon">
            {#if saveLoad === "passwordConfirm"}
              <Moon size="20" color="#e8e8e8" unit="px" duration="0.5s" />
            {:else}
              &nbsp;
            {/if}
          </Icon>
          <HelperText validationMsg slot="helper">
            {$_("settings.profile.passwordConfirm.helper")}
          </HelperText>
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

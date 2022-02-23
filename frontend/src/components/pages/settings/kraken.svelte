<script>
  import { _ } from "svelte-i18n";
  import { onMount, getContext } from "svelte";
  import { User } from "store/userStore.js";
  import { addApiKey, removeApiKey } from "utils/userApi.js";
  import { toast } from "@zerodevx/svelte-toast";

  import { Moon } from "svelte-loading-spinners";
  import Button, { Label, Icon } from "@smui/button";
  import Textfield from "@smui/textfield";
  import HelperText from "@smui/textfield/helper-text";
  import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
  import Badge from "@smui-extra/badge";
  import Checkbox from "@smui/checkbox";
  import Dialog, { Title, Content, Actions } from "@smui/dialog";

  const hasApikeys = getContext("data");

  const subtrLength = 20;
  let open = false,
    selectedId = [],
    privateKey = "",
    publicKey = "",
    loadingAdd = false,
    loadingRemove = false,
    userProfile = false,
    nbKey = 0,
    nbSelected = 0;

  const getProfile = async () => {
    return await User.getProfile();
  };

  let long = {
    hour12: false,
    weekday: "long",
    year: "numeric",
    month: "long",
    weekday: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const formatter = new Intl.DateTimeFormat(navigator.language, long);

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

  const resetForm = () => {
    privateKey = "";
    publicKey = "";
    loadingAdd = false;
  };

  const submitAddApiKey = async () => {
    loadingAdd = true;
    if (privateKey === "" || publicKey === "") {
      resetForm();
      Notification($_("settings.kraken.addError"), "error");
      return false;
    }

    const addapikey = await addApiKey(userProfile.token, {
      privateKey,
      publicKey,
    });

    if (addapikey.ok) {
      userProfile = await getProfile();
      hasApikeys.change(true);
      Notification($_("settings.kraken.addSuccess"), "success");
      resetForm();
    } else {
      if (typeof addapikey.message === "string")
        Notification(addapikey.message, "error");
      else {
        if (typeof addapikey.message === "object") {
          Object.values(addapikey.message).map((val) => {
            Notification(val.message, "error");
          });
        }
      }
      resetForm();
    }
  };

  const submitRemoveApiKey = async () => {
    loadingRemove = true;
    const removeapikey = await removeApiKey(userProfile.token, {
      userId: userProfile.user._id,
      ids: selectedId,
    });

    if (removeapikey.ok) {
      userProfile = await getProfile();
      hasApikeys.change(userProfile.user.apikeys.length >= 1 ? true : false);
      loadingRemove = false;
      selectedId = [];
      Notification(
        $_("settings.kraken.removeSuccess", {
          values: { n: nbSelected },
        }),
        "success"
      );
    } else {
      Notification(removeapikey.message, "error");
      loadingRemove = false;
    }
  };

  onMount(async () => {
    userProfile = await getProfile();
  });

  $: if (userProfile) {
    let keyids = [];
    userProfile.user.apikeys.filter((v) => {
      keyids.push(v._id);
    });

    const checkIncludesInapikeys = (id) => {
      return keyids.includes(id);
    };

    nbKey = userProfile.user.apikeys.length;
    nbSelected = selectedId.every(checkIncludesInapikeys)
      ? selectedId.length
      : 0;
  }
</script>

<div class="margins mbot">
  <h4>{$_("settings.kraken.form.title")}</h4>
</div>
<div class="margins mbot">
  <Textfield
    style="width: 100%;"
    helperLine$style="width: 100%;"
    bind:value={publicKey}
    label={$_("settings.kraken.form.publickey")}
    required="true"
  >
    <HelperText slot="helper">
      {$_("settings.kraken.form.publickeyHelper")}
    </HelperText>
  </Textfield>
</div>
<div class="margins mbot">
  <h4>{$_("settings.profile.lastname.label")}</h4>
  <Textfield
    style="width: 100%;"
    helperLine$style="width: 100%;"
    bind:value={privateKey}
    label={$_("settings.kraken.form.privatekey")}
    required="true"
  >
    <HelperText slot="helper">
      {$_("settings.kraken.form.privatekeyHelper")}
    </HelperText>
  </Textfield>
</div>

<div class="margins btn-back" align="right">
  <Button on:click={submitAddApiKey}>
    <Icon class="material-icons">
      {#if loadingAdd}
        <Moon size="20" color="#e8e8e8" unit="px" duration="0.5s" />
      {:else}
        save
      {/if}
    </Icon>
    <Label>{$_("settings.kraken.form.addKeyBtn")}</Label>
  </Button>
</div>
<hr />
<div class="margins mbot">
  <h4>
    <div style="margin-top: 1.5em;">
      <span style="position: relative; display: inline-block; padding: .5em;">
        {$_("settings.kraken.table.title", { values: { n: nbKey } })}
        {#if userProfile}
          <Badge aria-label="notification count">
            {nbKey}
          </Badge>
        {/if}
      </span>
    </div>
  </h4>
</div>

{#if userProfile}
  <DataTable style="width: 100%;">
    <Head>
      <Row>
        <Cell checkbox>
          <Checkbox indeterminate={selectedId === []} />
        </Cell>
        <Cell>{$_("settings.kraken.table.publickey")}</Cell>
        <Cell>{$_("settings.kraken.table.privatekey")}</Cell>
        <Cell>{$_("settings.kraken.table.createdAt")}</Cell>
      </Row>
    </Head>
    <Body>
      {#each userProfile.user.apikeys as keys (keys._id)}
        {#if keys.apiKeyPrivate !== "false" && keys.apiKeyPublic !== "false"}
          <Row>
            <Cell checkbox>
              <Checkbox
                bind:group={selectedId}
                value={keys._id}
                valueKey={keys._id}
              />
            </Cell>
            <Cell>{keys.apiKeyPublic.substring(0, subtrLength)}...</Cell>
            <Cell>{keys.apiKeyPrivate.substring(0, subtrLength)}...</Cell>
            <Cell>{formatter.format(new Date(keys.createdAt).getTime())}</Cell>
          </Row>
        {/if}
      {/each}
    </Body>
  </DataTable>
  {#if nbSelected}
    <div class="margins btn-back" align="right">
      <Button on:click={() => (open = true)}>
        <Icon class="material-icons">
          {#if loadingRemove}
            <Moon size="20" color="#e8e8e8" unit="px" duration="0.5s" />
          {:else}
            delete
          {/if}
        </Icon>
        <Label>{$_("settings.kraken.table.removeKeyBtn")}</Label>
      </Button>
    </div>
  {/if}
{:else}
  {$_("settings.kraken.table.noKeyFound")}
{/if}

<Dialog
  bind:open
  aria-labelledby="simple-title"
  aria-describedby="simple-content"
>
  <Title id="simple-title">
    {$_("settings.kraken.dialog.title")}
  </Title>
  <Content id="simple-content">
    {$_("settings.kraken.dialog.description", {
      values: { n: nbSelected },
    })}
  </Content>
  <Actions>
    <Button>
      <Label>{$_("settings.kraken.dialog.no")}</Label>
    </Button>
    <Button on:click={submitRemoveApiKey}>
      <Label>{$_("settings.kraken.dialog.yes")}</Label>
    </Button>
  </Actions>
</Dialog>

<style>
  .mbot {
    margin-bottom: 15px;
  }

  .btn-back {
    background-color: #333333;
  }

  hr {
    border-color: #202020;
    background-color: #212121;
  }
</style>

<script>
  // ---------------------------------------------------------
  //  Imports
  // ---------------------------------------------------------
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";

  import UserData from "classes/UserData.js";
  import { online, asymbole } from "store/store.js";
  import LinearProgress from "@smui/linear-progress";
  import { hasApikeysStore } from "store/userStore.js";
  import SnackBar from "components/SnackBar.svelte";

  // ---------------------------------------------------------
  //  Props
  // ---------------------------------------------------------
  const ud = new UserData();

  let error = false,
    balance = false;

  let snackBarText = "",
    snackBarShow = false;

  // ---------------------------------------------------------
  //  Methods Declarations
  // ---------------------------------------------------------
  const GetBalance = async () => {
    try {
      if (!$online) {
        error = true;
        return false;
      }

      const res = await ud.getBalance();

      if (
        typeof res !== "undefined" &&
        Object.prototype.hasOwnProperty.call(res, "error")
      ) {
        snackBarShow = true;
        snackBarText = `<strong>[KRAKEN API]</strong> ${res.endpoint}: ${res.message}`;

        error = res.error;
        setTimeout(() => {
          GetBalance();
        }, res.timeout);
      } else {
        balance = res;
        error = false;
      }
    } catch (error) {
      console.error("[ERROR]:", error);
    }
  };

  onMount(() => {
    if ($hasApikeysStore) GetBalance();
  });
</script>

<SnackBar showSnackbar={snackBarShow} text={snackBarText} />
<div class="block">
  <h3>{$_("account.balance.title")}</h3>
  <ul class="balance">
    {#if error && typeof error !== "boolean"}
      <span class="error">{error}</span>
    {/if}
    {#if !balance && !error}
      <LinearProgress indeterminate />
    {:else}
      {#each Object.entries(balance) as [asset, bal]}
        {#if bal > 0}
          <li>
            {#if Object.prototype.hasOwnProperty.call($asymbole, asset)}
              <span class="label">
                <img
                  src="img/icons/white/{$asymbole[asset].icon}.png"
                  alt={$asymbole[asset].name}
                  class="asset-icon"
                />
                {$asymbole[asset].name}
              </span>
            {:else}
              <span class="label">{asset}</span>
            {/if}
            <span class="solde">
              {#if Object.prototype.hasOwnProperty.call($asymbole, asset)}
                <span class="symbol">({$asymbole[asset].symbol})</span>
              {/if}
              {bal}
            </span>
          </li>
        {/if}
      {/each}
    {/if}
  </ul>
</div>

<style>
  ul.balance li span.label {
    color: #858585;
    text-align: left;
    vertical-align: middle;
  }
  ul.balance li span.solde {
    text-align: center;
    color: darkgoldenrod;
    float: right;
  }
  ul.balance li span.symbol {
    margin-right: 2px;
    font-size: 0.9em;
    color: white;
  }
  ul.balance img.asset-icon {
    width: 15px;
    height: 15px;
    display: inline-block;
    vertical-align: middle;
    margin-right: 3px;
  }
</style>

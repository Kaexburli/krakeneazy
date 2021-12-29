<script>
  import { onMount } from "svelte";

  import UserData from "classes/UserData.js";
  import { online, asymbole } from "store/store.js";
  import { SyncLoader } from "svelte-loading-spinners";

  const ud = new UserData();

  let error = false;
  let balance = false;
  let limit = 0;

  const GetBalance = async () => {
    try {
      if (!$online) {
        error = true;
        return false;
      }

      if (error === 'ERROR: 500 ["EAPI:Rate limit exceeded"]') {
        return false;
      }

      const res = await ud.getBalance();
      if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
        error = res.error;
        if (limit < 5) {
          GetBalance();
          limit++;
        }
      } else {
        balance = res;
        error = false;
      }
    } catch (error) {
      console.log(error);
    }
  };

  onMount(() => {
    setTimeout(() => {
      GetBalance();
    }, 500);
  });
</script>

<div class="block">
  <h3>Solde du compte</h3>
  <ul class="balance">
    {#if error && limit <= 5 && typeof error !== "boolean"}
      <span class="error">{error}</span>
    {/if}
    {#if !balance && !error}
      <SyncLoader size="30" color="#e8e8e8" unit="px" duration="1s" />
    {:else}
      {#each Object.entries(balance) as [asset, bal]}
        {#if bal > 0}
          <li>
            {#if $asymbole.hasOwnProperty(asset)}
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
              {#if $asymbole.hasOwnProperty(asset)}
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

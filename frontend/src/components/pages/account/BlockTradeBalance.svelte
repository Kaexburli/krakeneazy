<script>
  // ---------------------------------------------------------
  //  Imports
  // ---------------------------------------------------------
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";

  import UserData from "classes/UserData.js";
  import { WSTradeBalance } from "store/wsstore.js";

  import { devise, online, sound, asymbole } from "store/store.js";
  import LinearProgress from "@smui/linear-progress";
  import TooltipIcon from "components/TooltipIcon.svelte";

  import SnackBar from "components/SnackBar.svelte";

  // ---------------------------------------------------------
  //  Props
  // ---------------------------------------------------------
  let error = false,
    tradebalancedata,
    balance_way = "down",
    balance_way_tmp,
    played = false,
    trading_percent,
    asset = $devise;

  let snackBarText = "",
    snackBarShow = false;

  let tbLabel = {
    eb: {
      label: $_("account.tradeBalance.eb.label"),
      info: $_("account.tradeBalance.eb.info"),
    },
    tb: {
      label: $_("account.tradeBalance.tb.label"),
      info: $_("account.tradeBalance.tb.info"),
    },
    m: {
      label: $_("account.tradeBalance.m.label"),
      info: $_("account.tradeBalance.m.info"),
    },
    n: {
      label: $_("account.tradeBalance.n.label"),
      info: $_("account.tradeBalance.n.info"),
    },
    c: {
      label: $_("account.tradeBalance.c.label"),
      info: $_("account.tradeBalance.c.info"),
    },
    v: {
      label: $_("account.tradeBalance.v.label"),
      info: $_("account.tradeBalance.v.info"),
    },
    e: {
      label: $_("account.tradeBalance.e.label"),
      info: $_("account.tradeBalance.e.info"),
    },
    mf: {
      label: $_("account.tradeBalance.mf.label"),
      info: $_("account.tradeBalance.mf.info"),
    },
    ml: {
      label: $_("account.tradeBalance.ml.label"),
      info: $_("account.tradeBalance.ml.info"),
    },
  };

  // ---------------------------------------------------------
  //  Methods Declarations
  // ---------------------------------------------------------
  const playSound = (track) => {
    let audio = new Audio("../sound/" + track + ".wav");
    let playPromise = audio.play();
    playPromise;
    played = false;
  };

  const GetTradeBalance = async () => {
    try {
      if (!$online) {
        error = true;
        return false;
      }

      const ud = new UserData();
      const res = await ud.getTradeBalance(asset);

      if (
        typeof res !== "undefined" &&
        Object.prototype.hasOwnProperty.call(res, "error")
      ) {
        snackBarShow = true;
        snackBarText = `<strong>[KRAKEN API]</strong> ${res.endpoint}: ${res.message}`;

        error = res.error;
        setTimeout(() => {
          GetTradeBalance();
        }, res.timeout);
      } else {
        tradebalancedata = res;
        error = false;
      }
    } catch (error) {
      console.error("[ERROR]:", error);
      error = false;
    }
  };

  onMount(() => {
    GetTradeBalance();
  });

  $: if ($WSTradeBalance) {
    if (Object.prototype.hasOwnProperty.call($WSTradeBalance, "eb")) {
      tradebalancedata = $WSTradeBalance;
    }
  }

  $: if (tradebalancedata) {
    // Calcul du pourcentage de perte et profit
    trading_percent = Number(
      Number(tradebalancedata["v"]) / Number(tradebalancedata["c"]) // Valorisation - coût
    );
    trading_percent = trading_percent * 100; // x 100
    trading_percent = 100 - trading_percent; // 100 -

    if (!isNaN(trading_percent)) {
      // Joue un sont en cas de changement de perte et profit
      balance_way_tmp = balance_way;
      balance_way = trading_percent >= 0 ? "up" : "down";
      if (balance_way != balance_way_tmp) {
        balance_way_tmp = balance_way;
        played = true;
      }
    }
  }
</script>

<SnackBar showSnackbar={snackBarShow} text={snackBarText} />
<div class="block">
  <h3>{$_("account.tradeBalance.title")}</h3>
  <ul class="trade-balance">
    <!-- {#if error && typeof error !== "boolean"}
      <span class="error">{error}</span>
    {/if} -->
    {#if !tradebalancedata && !error}
      <LinearProgress indeterminate />
    {:else if tradebalancedata}
      {#each Object.entries(tradebalancedata) as [index, bal]}
        {#if ["eb", "tb", "m", "e", "mf"].includes(index)}
          <li>
            <TooltipIcon
              tooltip={tbLabel[index].info}
              text={tbLabel[index].label}
            />
            <span class="solde">
              {#if index == "eb"}
                <span class="solde-account">
                  {parseFloat(bal).toFixed(2)}
                  {#if Object.prototype.hasOwnProperty.call($asymbole, asset)}
                    <span class="symbol">{$asymbole[asset].symbol}</span>
                  {/if}
                </span>
              {:else if index == "e"}
                <span
                  class={parseFloat(tradebalancedata["e"]) >=
                  parseFloat(tradebalancedata["tb"])
                    ? "good"
                    : "realynotgood"}
                >
                  {parseFloat(bal).toFixed(2)}
                  {#if Object.prototype.hasOwnProperty.call($asymbole, asset)}
                    <span class="symbol">{$asymbole[asset].symbol}</span>
                  {/if}
                </span>
              {:else}
                {parseFloat(bal).toFixed(2)}
                {#if Object.prototype.hasOwnProperty.call($asymbole, asset)}
                  <span class="symbol">{$asymbole[asset].symbol}</span>
                {/if}
              {/if}
            </span>
          </li>
        {/if}
      {/each}
    {/if}
  </ul>
</div>

<div class="block">
  <h3>{$_("account.tradeBalance.title2")}</h3>
  <ul class="trade-balance">
    {#if error && typeof error !== "boolean"}
      <span class="error">{error}</span>
    {/if}
    {#if !tradebalancedata && !error}
      <LinearProgress indeterminate />
    {:else if tradebalancedata}
      {#each Object.entries(tradebalancedata) as [index, bal]}
        {#if ["n", "c", "v", "ml"].includes(index)}
          <li>
            <TooltipIcon
              tooltip={tbLabel[index].info}
              text={tbLabel[index].label}
            />
            <span class="solde">
              {#if index == "n"}
                {#if $sound == "up" && played}
                  {#if parseFloat(bal) >= 0 ? playSound("win") : playSound("loose")}
                    <span class="hidden" />
                  {/if}
                {/if}
                <span class={parseFloat(bal) >= 0 ? "win" : "loose"}>
                  {#if !isNaN(trading_percent)}
                    <span class="percent">
                      ({parseFloat(trading_percent).toFixed(2)}%)
                    </span>
                  {/if}
                  {parseFloat(bal).toFixed(2)}
                  {#if Object.prototype.hasOwnProperty.call($asymbole, asset)}
                    <span class="symbol">{$asymbole[asset].symbol}</span>
                  {/if}
                </span>
              {:else if index == "ml"}
                <span
                  class={parseFloat(bal) >= 100
                    ? "good"
                    : parseFloat(bal) >= 80
                    ? "notgood"
                    : "realynotgood"}
                >
                  {parseFloat(bal).toFixed(2)}
                </span>
                <span class="symbol">%</span>
              {:else}
                {parseFloat(bal).toFixed(2)}
                {#if Object.prototype.hasOwnProperty.call($asymbole, asset)}
                  <span class="symbol">{$asymbole[asset].symbol}</span>
                {/if}
              {/if}
            </span>
          </li>
        {/if}
      {/each}
    {/if}
  </ul>
</div>

<style>
  ul.trade-balance li span.solde {
    text-align: center;
    color: #22b1b1;
    float: right;
  }
  ul.trade-balance li span.symbol {
    margin-left: 2px;
    font-size: 0.9em;
    color: white;
  }
  ul.trade-balance .win {
    color: rgb(141, 199, 54);
  }
  ul.trade-balance .loose {
    color: #fb5d5d;
  }
  ul.trade-balance .good {
    color: rgb(141, 199, 54);
  }
  ul.trade-balance .notgood {
    color: #ff7300;
  }
  ul.trade-balance .realynotgood {
    color: #fb5d5d;
  }
  ul.trade-balance .solde-account {
    color: rgb(141, 199, 54);
    font-weight: bold;
  }
  ul.trade-balance .percent {
    margin-right: 3px;
    font-size: 0.9em;
  }
</style>

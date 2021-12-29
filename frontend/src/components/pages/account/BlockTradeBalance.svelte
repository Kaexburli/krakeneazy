<script>
  import { onMount } from "svelte";

  import UserData from "classes/UserData.js";

  import {
    devise,
    online,
    sound,
    asymbole,
    wstradebalancedata,
  } from "store/store.js";
  import { wstradebalance } from "store/wstradebalance.js";
  import { SyncLoader } from "svelte-loading-spinners";
  import TooltipIcon from "components/TooltipIcon.svelte";

  let error = false;
  let tradebalance = false;
  let limit = 0;
  let balance_way = "down";
  let balance_way_tmp;
  let played = false;
  let trading_percent;
  const asset = $devise;

  const playSound = (track) => {
    let audio = new Audio("../sound/" + track + ".wav");
    let playPromise = audio.play();
    playPromise;
    played = false;
  };

  let tb_label = {
    eb: {
      label: "Solde du compte",
      info: "Total des devises et crypto combiné",
    },
    tb: {
      label: "Solde de transactions",
      info: "Soldes total des devises de marge",
    },
    m: {
      label: "Marge utilisée",
      info: "Montant total de la marge utilisée sur les positions ouvertes",
    },
    n: {
      label: "Perte/Profit",
      info: "Perte/Profit sur papier de toutes les positions ouvertes",
    },
    c: {
      label: "Coût d'ouverture",
      info: "Coût initale de toutes les positions ouvertes",
    },
    v: {
      label: "Valorisation actuelle",
      info: "Valeur théorique de toutes les positions ouverte",
    },
    e: {
      label: "Équité",
      info: "Soldes de transactions combiné aux pertes/profits non réalisés",
    },
    mf: {
      label: "Marge disponible",
      info: "Soldes de marge utilisable. Égal à l'équité moins la marge utilisée",
    },
    ml: {
      label: "Niveau de marge",
      info: "Pourcentage d'équité par rapport à la marge utilisée",
    },
  };

  const GetTradeBalance = async () => {
    try {
      if (!$online) {
        error = true;
        return false;
      }

      const ud = new UserData();
      const res = await ud.getTradeBalance(asset);

      if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
        console.error("GetTradeBalance", res.error);
        if (limit < 2) {
          GetTradeBalance();
          limit++;
        }
      } else {
        tradebalance = res;
        wstradebalancedata.set(tradebalance);
        error = false;
      }
    } catch (error) {
      console.log(error);
    }
  };

  onMount(() => {
    setTimeout(() => {
      GetTradeBalance();
    }, 500);

    wstradebalance.subscribe((tick) => {
      if (typeof tick !== "undefined") {
        if (!$online) {
          error = true;
          return false;
        } else if (tick.hasOwnProperty("error")) {
          error = tick.error;
          console.error("ERROR", error);
        } else if (Object.keys(tick).length >= 1) {
          if (!tick.hasOwnProperty("error")) {
            tradebalance = tick;
            wstradebalancedata.set(tradebalance);
          }
        }
      }
    });
  });

  $: {
    if ($wstradebalancedata) {
      // Calcul du pourcentage de perte et profit
      trading_percent = Number(
        Number($wstradebalancedata["v"]) / Number($wstradebalancedata["c"]) // Valorisation - coût
      );
      trading_percent = trading_percent * 100; // x 100
      trading_percent = 100 - trading_percent; // 100 -

      if (!isNaN(trading_percent)) {
        // Joue un sont en cas de cahngement de perte et profit
        balance_way_tmp = balance_way;
        balance_way = trading_percent >= 0 ? "up" : "down";
        if (balance_way != balance_way_tmp) {
          balance_way_tmp = balance_way;
          played = true;
        }
      }
    }
  }
</script>

<div class="block">
  <h3>Solde de trading</h3>
  <ul class="trade-balance">
    {#if error && limit <= 2 && typeof error !== "boolean"}
      <span class="error">{error}</span>
    {/if}
    {#if !$wstradebalancedata && !error}
      <SyncLoader size="30" color="#e8e8e8" unit="px" duration="1s" />
    {:else}
      {#each Object.entries($wstradebalancedata) as [index, bal]}
        {#if ["eb", "tb", "m", "e", "mf"].includes(index)}
          <li>
            <TooltipIcon
              tooltip={tb_label[index].info}
              text={tb_label[index].label}
            />
            <span class="solde">
              {#if index == "eb"}
                <span class="solde-account">
                  {parseFloat(bal).toFixed(2)}
                  {#if $asymbole.hasOwnProperty(asset)}
                    <span class="symbol">{$asymbole[asset].symbol}</span>
                  {/if}
                </span>
              {:else if index == "e"}
                <span
                  class={parseFloat($wstradebalancedata["e"]) >=
                  parseFloat($wstradebalancedata["tb"])
                    ? "good"
                    : "realynotgood"}
                >
                  {parseFloat(bal).toFixed(2)}
                  {#if $asymbole.hasOwnProperty(asset)}
                    <span class="symbol">{$asymbole[asset].symbol}</span>
                  {/if}
                </span>
              {:else}
                {parseFloat(bal).toFixed(2)}
                {#if $asymbole.hasOwnProperty(asset)}
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
  <h3>Valorisation de la position</h3>
  <ul class="trade-balance">
    {#if error && limit <= 5 && typeof error !== "boolean"}
      <span class="error">{error}</span>
    {/if}
    {#if !$wstradebalancedata && !error}
      <SyncLoader size="30" color="#e8e8e8" unit="px" duration="1s" />
    {:else}
      {#each Object.entries($wstradebalancedata) as [index, bal]}
        {#if ["n", "c", "v", "ml"].includes(index)}
          <li>
            <TooltipIcon
              tooltip={tb_label[index].info}
              text={tb_label[index].label}
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
                  {#if $asymbole.hasOwnProperty(asset)}
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
                {#if $asymbole.hasOwnProperty(asset)}
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

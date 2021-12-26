<script>
  import { onMount } from "svelte";

  import UserData from "classes/UserData.js";
  import { online, assetpair, asymbole } from "store/store.js";
  import { SyncLoader } from "svelte-loading-spinners";
  import { tweened } from "svelte/motion";
  import { linear } from "svelte/easing";

  let currency;
  let tradevol;
  let next_vol;
  let progress_value;
  let progress_percent;
  let actual_fees_taker;
  let actual_fees_maker;
  let next_fees_taker;
  let next_fees_maker;

  const progress = tweened(0, {
    duration: 1000,
    easing: linear,
  });

  let error = false;
  let tradevolume = false;
  let limit = 0;

  const GetTradeVolume = async () => {
    if (!$online) {
      error = true;
      return false;
    }

    if (typeof $assetpair.altname === "undefined") {
      error = "Veuillez choisir une paire d'asset";
      return false;
    }

    if (error === 'ERROR: 500 ["EAPI:Rate limit exceeded"]') {
      error = true;
      return false;
    }

    const ud = new UserData();
    const res = await ud.getTradeVolume({ pair: $assetpair.altname });
    if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
      error = res.error;
      if (limit < 5) {
        GetTradeVolume();
        limit++;
      }
    } else {
      tradevolume = res;
      error = false;
    }
  };

  onMount(() => {
    GetTradeVolume();
  });

  $: {
    tradevolume;

    if (typeof tradevolume !== "undefined") {
      if (tradevolume.hasOwnProperty("currency")) {
        tradevol = Number(tradevolume.volume).toFixed(2);
        currency = $asymbole[tradevolume.currency]["symbol"];
        next_vol = Number(
          tradevolume.fees[Object.keys(tradevolume.fees)[0]]["nextvolume"]
        ).toFixed(2);
        progress_value = Number(
          Number(tradevolume.volume) /
            Number(
              tradevolume.fees[Object.keys(tradevolume.fees)[0]]["nextvolume"]
            )
        );
        progress_percent = progress_value * 100;
        actual_fees_taker =
          tradevolume.fees[Object.keys(tradevolume.fees)[0]]["fee"];
        actual_fees_maker =
          tradevolume.fees_maker[Object.keys(tradevolume.fees)[0]]["fee"];
        next_fees_taker =
          tradevolume.fees[Object.keys(tradevolume.fees)[0]]["nextfee"];
        next_fees_maker =
          tradevolume.fees_maker[Object.keys(tradevolume.fees)[0]]["nextfee"];
        progress.set(progress_value);
      }
    }
  }
</script>

<div class="block">
  <h3>Grille Tarifaire</h3>
  {#if error && typeof error !== "boolean"}
    <span class="error">{error}</span>
  {/if}
  {#if !tradevolume && !error}
    <SyncLoader size="30" color="#e8e8e8" unit="px" duration="1s" />
  {:else if tradevolume}
    <div class="trade_volume">
      <h5>Volume</h5>
      <div>
        <span class="label">{tradevol} {currency}</span> /
        <span class="label">{next_vol} {currency}</span>
      </div>
      <span class="label">
        Volume sur 30 jours
        <span class="percent">({progress_percent.toFixed(2)}%)</span>
      </span>
      <progress value={$progress} />
    </div>
    <div class="trade_volume_fees">
      <h5>Frais</h5>
      <div>
        <span class="label"> Actuel </span>
        <span class="currency">({$assetpair.wsname})</span>
        <span class="right">{actual_fees_maker}% / {actual_fees_taker}%</span>
      </div>
      <hr />
      <div>
        <span class="label"> Suivant </span>
        <span class="currency">({$assetpair.wsname})</span>
        <span class="right">{next_fees_maker}% / {next_fees_taker}%</span>
      </div>
    </div>
  {/if}
</div>

<style>
  progress {
    display: block;
    width: 100%;
  }
  .trade_volume span.label,
  .trade_volume span.label {
    cursor: unset;
    font-weight: unset;
  }
  .trade_volume .percent {
    font-size: 0.9em;
    color: tomato;
    float: right;
  }
  .trade_volume {
    padding: 0 0 10px 0;
  }
  .trade_volume_fees .right {
    float: right;
    text-align: right;
    font-size: 0.9em;
  }
  .trade_volume_fees .currency {
    font-size: 0.8em;
  }
  .trade_volume_fees hr {
    border: 1px solid #3a3a3a;
    margin: 1px 0;
  }
</style>

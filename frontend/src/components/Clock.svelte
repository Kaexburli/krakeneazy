<script>
  import { _ } from "svelte-i18n";
  import { User } from "store/userStore.js";
  import { time, elapsed } from "store/store.js";

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

  let short = {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  let medium = {
    hour12: false,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const formatter = new Intl.DateTimeFormat("fr-FR", medium);

  const cmtt = (milli) => {
    const seconds = Math.floor((milli / 1000) % 60);
    const minutes = Math.floor((milli / 1000 / 60) % 60);
    const hours = Math.floor((milli / 1000 / 60 / 60) % 24);

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");
  };

  let diffTime = false;
  let beginDate = false;
  let endDate = false;
  let exp = false;

  $: if ($User) {
    User.getData().then((result) => {
      exp = result.exp;
      beginDate = formatter.format(result.iat * 1000);
      endDate = formatter.format(result.exp * 1000);
    });
  }

  setInterval(() => {
    const currentTime = new Date().getTime() / 1000;
    diffTime = (exp - currentTime) * 1000;
    diffTime = cmtt(diffTime);
  }, 1000);
</script>

<div class="clock">
  <strong>{$_("footer.clock.date")}</strong> : {formatter.format($time)}

  <!-- 
  {$_("footer.clock.display_since")}
  {$elapsed} {$_("footer.clock.secondes", { values: { n: $elapsed } })}
 -->

  {#if beginDate}
    <strong>{$_("footer.clock.beginSession")}</strong> : {beginDate}
  {/if}
  {#if endDate}
    <strong>{$_("footer.clock.endSession")}</strong> : {endDate}
    <strong>{$_("footer.clock.in")}</strong> : {#if diffTime}{diffTime}{/if}
  {/if}
</div>

<style>
  .clock {
    display: inline-block;
    text-align: left;
    font-size: 0.8em;
    padding-top: 5px;
  }
</style>

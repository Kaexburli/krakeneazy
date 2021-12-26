<script>
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

  const formatter = new Intl.DateTimeFormat("fr-FR", long);
</script>

<div class="clock">
  {formatter.format($time)}

  Affiché depuis:
  {$elapsed}
  {$elapsed === 1 ? "second" : "seconds"}
</div>

<style>
  .clock {
    display: inline-block;
    text-align: left;
    font-size: 0.8em;
    padding-top: 5px;
  }
</style>

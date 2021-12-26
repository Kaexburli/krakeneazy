<script>
  import Clock from "components/Clock.svelte";
  import OnlineApi from "components/api/Online.svelte";
</script>

<div class="footer">
  <Clock />
  <OnlineApi display="footer" />
</div>

<style>
  .footer {
    background: rgb(20, 20, 20, 1);
    border-top: 1px solid #1c1c1c;

    width: calc(100% - 1px);
    margin-left: 1px;
    transition: all 0.5s ease;
    padding: 0 10px;
    height: 25px;
    bottom: 0;
    position: fixed;
    color: #464646;
    font-size: 0.9em;
    z-index: 9;
  }
</style>

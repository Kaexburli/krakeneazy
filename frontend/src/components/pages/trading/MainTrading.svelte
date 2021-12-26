<script>
  import { fade, scale } from "svelte/transition";
</script>

<div
  id="page-trading"
  in:scale={{ delay: 200, duration: 300 }}
  out:fade={{ delay: 1, duration: 1 }}
>
  <h1>Trading</h1>
  <div class="trading">qdqsdsq</div>
</div>

<style>
  .trading {
    display: grid;
    /* grid-template-rows: repeat(2, 50px); */

    background-color: #212121;
    padding: 5px 10px;
    border: 1px solid #2e2e2e;
  }
  :global(.trading div.block) {
    margin: 5px;
    padding: 10px;
    min-width: 200px;
    background-color: #282828;
    font-size: 0.8em;
  }
  :global(.trading div.block h3) {
    background-color: darkgrey;
    color: #222222;
    padding: 5px;
    margin: -10px -10px 5px -10px;
    font-size: 1.1em;
  }
</style>

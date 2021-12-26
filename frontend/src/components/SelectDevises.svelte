<script>
  import { devise } from "store/store.js";

  let selected = $devise;

  let devises_list = [
    { id: "ZEUR", text: "EUR" },
    { id: "ZUSD", text: "USD" },
  ];

  $: {
    devise.update((n) => (n = selected));
  }
</script>

<div class="select-devises">
  <select
    name="devises"
    id="devises"
    class="devises"
    bind:value={selected}
    on:change={() => location.reload()}
  >
    {#each devises_list as devise_item}
      <option value={devise_item.id} {selected}>
        {devise_item.text}
      </option>
    {/each}
  </select>
</div>

<style>
  .select-devises {
    float: right;
  }
  .select-devises .devises {
    border: 1px solid #222222;
    background-color: #222222;
    color: #cdcdcd;
    outline: none;
    height: 30px;
    border-left: 1px solid #303030;
    padding-left: 10px;
  }
  .select-devises .devises option {
    border: 1px solid #222222;
    background-color: #222222;
  }
</style>

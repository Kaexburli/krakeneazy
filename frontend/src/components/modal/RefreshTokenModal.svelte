<script>
  import { _ } from "svelte-i18n";
  import Button, { Label } from "@smui/button";

  // provided by Modals
  export let isOpen;
  export let timer;
  export let confirm;
  export let no;
</script>

{#if isOpen}
  <div role="dialog" class="modal">
    <div class="contents">
      <h3>{$_("modal.refreshToken.title")}</h3>
      <p>{$_("modal.refreshToken.message", { values: { n: timer } })}</p>
      <div class="actions">
        <Button color="secondary" on:click={no}>
          <Label>{$_("modal.refreshToken.btnLogout")}</Label>
        </Button>&nbsp;
        <Button on:click={confirm} variant="outlined">
          <Label>{$_("modal.refreshToken.btnStay")}</Label>
        </Button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal {
    position: fixed;
    z-index: 999;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    /* allow click-through to backdrop */
    pointer-events: none;
  }

  .contents {
    min-width: 240px;
    border-radius: 6px;
    padding: 16px;
    background: #1c1c1c;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: auto;
    color: #a7a7a7;
    border: 3px solid #222222;
  }

  h3 {
    text-align: left;
    font-size: 1.2em;
  }

  p {
    text-align: center;
    margin-top: 16px;
  }

  button {
    padding: 5px;
    margin: 0 10px;
    background-color: #333333;
    border: 2px solid #444444;
    cursor: pointer;
    color: #a7a7a7;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
  }

  button:hover {
    background-color: #555555;
  }

  .actions {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
  }
</style>

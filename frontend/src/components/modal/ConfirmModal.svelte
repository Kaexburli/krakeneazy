<script>
  import { _ } from "svelte-i18n";
  import Button, { Label } from "@smui/button";

  // provided by Modals
  export let isOpen;
  export let title;
  export let message;
  export let confirm;
  export let cancel;
</script>

{#if isOpen}
  <div role="dialog" class="modal">
    <div class="contents">
      <h3>{title}</h3>
      <p>{message}</p>
      <div class="actions">
        <Button color="secondary" on:click={cancel}>
          <Label>{$_("modal.confirmation.cancel")}</Label>
        </Button>&nbsp;
        <Button on:click={confirm} variant="outlined">
          <Label>{$_("modal.confirmation.confirm")}</Label>
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

  .actions {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
  }
</style>

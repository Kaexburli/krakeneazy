<script>
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
        <button class="left" on:click={cancel}>Annuler</button>
        <button class="right" on:click={confirm}>Confirmer</button>
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
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: auto;
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
  }

  .actions {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
  }
</style>

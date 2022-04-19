<script>
  import { blur, slide } from "svelte/transition";
  export let hideSnackbar = () => {
    showSnackbar = false;
  };
  export let showSnackbar = false;
  export let autoDismissDuration = 5000;
  export let inTransition = slide;
  export let outTransition = blur;
  export let text = "Welcome to the Snackbar by Om Londhe.";
  export let borderTopLeftRadius = "7px";
  export let borderTopRightRadius = "7px";
  export let borderBottomLeftRadius = "7px";
  export let borderBottomRightRadius = "7px";
  export let borderWidth = "1px";
  export let borderColor = "rgb(255 0 0)";
  export let backgroundColor = "#ff3e00";
  export let showHighlightBorder = false;
  export let highlightBorderColor = "#ff3e00";
  export let highlightBorderWidth = "1px";
  export let textColor = "black";
  export let iconColor = "black";
  const snackbatStyle = `
		border-bottom-left-radius: ${borderBottomLeftRadius};
		border-bottom-right-radius: ${borderBottomRightRadius};
		border-top-right-radius: ${borderTopRightRadius};
		border-top-left-radius: ${borderTopLeftRadius};
		border-width: ${borderWidth};
		border-color: ${borderColor};
		background-color: ${backgroundColor};
		border-left-color: ${showHighlightBorder ? highlightBorderColor : borderColor};
		border-left-width: ${showHighlightBorder ? highlightBorderWidth : borderWidth};
	`;
  const textStyle = `color: ${textColor}`;
  $: if (showSnackbar && autoDismissDuration) {
    setTimeout(hideSnackbar, autoDismissDuration);
  }
</script>

{#if showSnackbar}
  <div class="snackbar" style={snackbatStyle} in:inTransition out:outTransition>
    <p class="text" style={textStyle}>{@html text}</p>
    <div class="icon" on:click={hideSnackbar}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="ionicon"
        viewBox="0 0 512 512"
        ><title>Close</title><path
          fill="none"
          stroke={iconColor}
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="32"
          d="M368 368L144 144M368 144L144 368"
        /></svg
      >
    </div>
  </div>
{/if}

<style>
  .snackbar {
    position: fixed;
    top: 100%;
    left: calc(15% - 4px);
    transform: translateX(-50%) translateY(-120%);
    width: fit-content;
    max-width: 800px;
    margin-left: 4px;
    margin-right: 4px;
    display: flex;
    align-items: center;
    z-index: 9999;
    padding-top: 7px;
    padding-bottom: 7px;
    border-style: solid;
  }
  .text {
    margin-left: 11px;
    flex: 1;
    font-size: 14px;
  }
  .icon {
    margin: 0;
    padding: 0;
    display: grid;
    place-items: center;
    margin-right: 11px !important;
    margin-left: 11px !important;
    border-radius: 50%;
    height: 24px;
    width: 24px;
    cursor: pointer;
  }
</style>

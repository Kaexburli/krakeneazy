<script>
  export let tooltip = false;
  export let icon = false;
  export let text = false;

  const nl2br = (str, isXhtml) => {
    if (typeof str === "undefined" || str === null) {
      return "";
    }
    const breakTag =
      isXhtml || typeof isXhtml === "undefined" ? "<br " + "/>" : "<br>";
    return (str + "").replace(/(\r\n|\n\r|\r|\n)/g, breakTag + "$1");
  };
</script>

{#if tooltip}
  <span data-tooltip={nl2br(tooltip, true)}>
    {#if icon}<i class="fa fa-{icon}" />{/if}
    <slot />
    {#if text}
      <span class="label">
        {text}
      </span>
    {/if}
  </span>
{/if}

<svelte:head>
  <style>
    /*This would all go into the global.css file*/
    [data-tooltip] {
      z-index: 2;
      position: relative;
      display: inline-block;
      margin-right: 3px;
    }

    [data-tooltip]:before,
    [data-tooltip]:after {
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
      transition: 0.2s ease-out;
      transform: translate(-50%, 5px);
    }

    [data-tooltip]:before {
      position: absolute;
      z-index: 3;
      bottom: 100%;
      left: 50%;
      margin-bottom: 5px;
      padding: 7px;
      width: 100%;
      min-width: 100px;
      max-width: 250px;
      -webkit-border-radius: 3px;
      -moz-border-radius: 3px;
      border-radius: 3px;
      background-color: #000;
      background-color: hsla(0, 0%, 20%, 0.9);
      color: #cdcdcd;
      content: attr(data-tooltip);
      text-align: center;
      font-size: 14px;
      font-weight: bold;
      line-height: 1.2;
      transition: 0.2s ease-out;
    }

    [data-tooltip]:after {
      position: absolute;
      bottom: 100%;
      left: 50%;
      width: 0;
      border-top: 5px solid #000;
      border-top: 5px solid hsla(0, 0%, 20%, 0.9);
      border-right: 5px solid transparent;
      border-left: 5px solid transparent;
      content: " ";
      font-size: 0;
      line-height: 0;
    }

    [data-tooltip]:hover:before,
    [data-tooltip]:hover:after {
      visibility: visible;
      opacity: 1;
      transform: translate(-50%, 0);
    }
    [data-tooltip="false"]:hover:before,
    [data-tooltip="false"]:hover:after {
      visibility: hidden;
      opacity: 0;
    }
    span.label {
      cursor: pointer;
      color: #858585;
      text-align: left;
    }
  </style>
</svelte:head>

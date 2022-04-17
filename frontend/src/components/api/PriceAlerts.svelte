<script>
  // ---------------------------------------------------------
  //  Imports
  // ---------------------------------------------------------
  import { _ } from "svelte-i18n";
  import { pricealertlist } from "store/store.js";
  import { WSTickerAlert } from "store/wsstore.js";
  import { toast } from "@zerodevx/svelte-toast";

  import MenuSurface from "@smui/menu-surface";
  import List, { Group, Subheader, Item, Separator, Text } from "@smui/list";
  import Accordion, { Panel, Header, Content } from "@smui-extra/accordion";
  import Textfield from "@smui/textfield";
  import Icon from "@smui/textfield/icon";

  // ---------------------------------------------------------
  //  Props
  // ---------------------------------------------------------
  export let display = false;
  let isActive = false;
  let icon = isActive ? "fa-angle-double-right" : "fa-bell";
  let hasPriceAlert;

  // ---------------------------------------------------------
  //  Methods Declarations
  // ---------------------------------------------------------
  const playSound = (track) => {
    let audio = new Audio("../sound/" + track + ".mp3");
    let playPromise = audio.play();
    playPromise;
  };

  const sendAlertPrice = (pair, price, way) => {
    let phraseAlert = `<div style="background: #333333;margin:-5px 0 5px 0;padding:3px;font-size:0.8em;color:${
      way === "up" ? "#5b9208" : "#ff8e8e"
    }">${$_(
      "pricealert.modal.title"
    )}</div><div style="padding:0 5px;><h3 style="font-size:1em;color:#999999;">${pair}</h3><div style="font-size:0.8em;"> ${$_(
      "pricealert.modal.price"
    )} ${way === "up" ? $_("pricealert.modal.up") : $_("pricealert.modal.down")}
    ${
      way === "up"
        ? '<strong style="color:#5b9208;">' +
          price +
          pair.split("/")[1] +
          "</strong>"
        : '<strong style="color:#ff8e8e;">' +
          price +
          pair.split("/")[1] +
          "</strong>"
    } </div></div>`;

    playSound(way + "-alert2");

    toast.push(phraseAlert, {
      initial: 0,
      next: 0,
      dismissable: true,
    });
  };

  $: if (
    $WSTickerAlert &&
    typeof $WSTickerAlert !== "undefined" &&
    typeof $pricealertlist !== "undefined"
  ) {
    let pairs = Object.keys($pricealertlist);
    pairs.forEach((pair) => {
      if (
        typeof $WSTickerAlert[pair] !== "undefined" &&
        $WSTickerAlert[pair] !== null
      ) {
        if ($WSTickerAlert[pair].hasOwnProperty("a")) {
          let tickerPrice = $WSTickerAlert[pair]["a"][0];
          let upList = $pricealertlist[pair]["up"];
          let downList = $pricealertlist[pair]["down"];

          upList.filter((upPrice) => {
            if (parseFloat(tickerPrice) >= parseFloat(upPrice)) {
              let index = upList.indexOf(upPrice);
              if (index > -1) {
                upList.splice(index, 1);
                $pricealertlist[pair]["up"] = [...upList];
              }
              sendAlertPrice(pair, upPrice, "up");
            }
          });

          downList.filter((downPrice) => {
            if (parseFloat(tickerPrice) <= parseFloat(downPrice)) {
              let index = downList.indexOf(downPrice);
              if (index > -1) {
                downList.splice(index, 1);
                $pricealertlist[pair]["down"] = [...downList];
              }
              sendAlertPrice(pair, downPrice, "down");
            }
          });
        }
      }
    });
  }

  $: hasPriceAlert = Object.keys($pricealertlist).length >= 1 ? true : false;

  const toogleBoxPriceAlert = () => {
    let paWrapper = document.querySelector(".pricealert-wrapper").style;
    if (!paWrapper) console.debug("[ERROR] toogleBoxPriceAlert");
    isActive = !isActive;
    if (isActive) paWrapper.right = "0px";
    else if (!isActive) paWrapper.right = "-275px";
  };

  const handleRemoveClick = (pushway, index, pair) => {
    let list = $pricealertlist[pair][pushway];
    list.splice(index, 1);
    $pricealertlist[pair][pushway] = [...list];
  };

  const handleClickPrice = (event, pushway, index, pair, price) => {
    const spanprice = event.target;
    const alertprice = spanprice.parentElement;
    const alertpricecontainer = alertprice.parentElement;
    const alertprice_redo = alertprice.querySelector(".fa-sync");
    const alertprice_input_block =
      alertprice.querySelector(".alert-price-input");
    const alertprice_input_field =
      alertprice_input_block.querySelector("input");

    // On affiche le champ et on cache le prix
    spanprice.style.display = "none";
    alertprice_input_block.style.display = "inline-block";
    alertprice_input_field.focus();

    // Validation : on remplace la valeur par la nouvelle
    // et on cache le champ pour afficher le prix
    alertprice_redo.addEventListener("click", () => {
      let inputvalues =
        alertprice_input_field.value !== ""
          ? alertprice_input_field.value
          : price;
      let list = $pricealertlist[pair][pushway];
      list[index] = inputvalues;
      $pricealertlist[pair][pushway] = [...list];
      spanprice.innerHTML = inputvalues;
      spanprice.style.display = "inline-block";
      alertprice_input_block.style.display = "none";
      alertpricecontainer.style.background = "#888888";
      setTimeout(() => {
        alertpricecontainer.style.background =
          pushway === "up" ? "#202a20" : "#2a2020";
      }, 200);
    });

    // Validation : on remplace la valeur par la nouvelle
    // et on cache le champ pour afficher le prix
    alertprice_input_field.addEventListener("keypress", (e) => {
      if (e.keyCode === 13) {
        let inputvalues =
          alertprice_input_field.value !== ""
            ? alertprice_input_field.value
            : price;
        let list = $pricealertlist[pair][pushway];
        list[index] = inputvalues;
        $pricealertlist[pair][pushway] = [...list];
        spanprice.innerHTML = inputvalues;
        spanprice.style.display = "inline-block";
        alertprice_input_block.style.display = "none";
        alertpricecontainer.style.background = "#888888";
        setTimeout(() => {
          alertpricecontainer.style.background =
            pushway === "up" ? "#202a20" : "#2a2020";
        }, 200);
      }
    });

    // Si le champ est affiché on le cache
    // en cas de clic autre par que sur le boutton de validation
    alertprice_input_field.onblur = function () {
      setTimeout(() => {
        spanprice.style.display = "inline-block";
        alertprice_input_block.style.display = "none";
      }, 200);
    };
  };

  const handleClickDisplayList = (id) => {
    const ulDiv = document.querySelector("#pricealert-slide-" + id);
    if (!ulDiv) console.debug("[ERROR] handleClickDisplayList");
    else
      ulDiv.style.display = ulDiv.style.display === "none" ? "block" : "none";
  };
</script>

{#if display && hasPriceAlert}
  <div class="pricealert-wrapper">
    <div class="pricealert-button" on:click={toogleBoxPriceAlert}>
      <span><i class="fa {icon}" /></span>
    </div>
    <div class="overflow">
      <h3>{$_("pricealert.title")}</h3>
      <div class="pricealert-container">
        {#each Object.entries($pricealertlist) as list}
          <div id="alert-{list[0].replace('/', '-')}">
            {#if Object.values(list[1]["up"]).length >= 1 || Object.values(list[1]["down"]).length >= 1}
              <span
                class="listpair"
                on:click={handleClickDisplayList(list[0].replace("/", "-"))}
                >{list[0]}</span
              >
              <div
                id="pricealert-slide-{list[0].replace('/', '-')}"
                style="display:none;"
              >
                {#if Object.values(list[1]["up"]).length >= 1}
                  <ul class="alert-up">
                    {#each list[1]["up"] as up}
                      <li data-index={list[1]["up"].indexOf(up)}>
                        <i class="fa fa-level-up-alt" />
                        {$_("pricealert.alertUp")}
                        <span class="alert-price">
                          <span class="alert-price-input">
                            <input
                              type="number"
                              placeholder={up}
                              class="input-price"
                            />&nbsp;
                            <i class="fa fa-sync" />
                          </span>
                          <span
                            class="price"
                            on:click={(event) =>
                              handleClickPrice(
                                event,
                                "up",
                                list[1]["up"].indexOf(up),
                                list[0],
                                up
                              )}>{up}</span
                          >
                        </span>
                        <span
                          class="remove right"
                          on:click={handleRemoveClick(
                            "up",
                            list[1]["up"].indexOf(up),
                            list[0]
                          )}><i class="fa fa-trash" /></span
                        >
                      </li>
                    {/each}
                  </ul>
                {/if}
                <hr />
                {#if Object.values(list[1]["down"]).length >= 1}
                  <ul class="alert-down">
                    {#each list[1]["down"] as down}
                      <li data-index={list[1]["down"].indexOf(down)}>
                        <i class="fa fa-level-down-alt" />
                        {$_("pricealert.alertDown")}
                        <span class="alert-price">
                          <span class="alert-price-input">
                            <input
                              type="number"
                              placeholder={down}
                              class="input-price"
                            />&nbsp;
                            <i class="fa fa-sync" />
                          </span>
                          <span
                            class="price"
                            on:click={(event) =>
                              handleClickPrice(
                                event,
                                "down",
                                list[1]["down"].indexOf(down),
                                list[0],
                                down
                              )}>{down}</span
                          >
                        </span>
                        <span
                          class="remove right"
                          on:click={handleRemoveClick(
                            "down",
                            list[1]["down"].indexOf(down),
                            list[0]
                          )}><i class="fa fa-trash" /></span
                        >
                      </li>
                    {/each}
                  </ul>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else}
  <MenuSurface static>
    <Group>
      <Subheader>{$_("pricealert.title").toUpperCase()}</Subheader>
      <Accordion class="alerts-list">
        {#each Object.entries($pricealertlist) as list}
          {#if Object.values(list[1]["up"]).length}
            <Panel>
              <Header>{list[0]}</Header>
              <Content>
                {#if Object.values(list[1]["up"]).length !== 1}
                  <List>
                    {#each list[1]["up"] as up}
                      <Item class="alert-up">
                        <Text>
                          <span class="alert-label"
                            >{$_("pricealert.alertUp")}</span
                          >
                          <Textfield bind:value={up} type="number">
                            <Icon class="material-icons" slot="leadingIcon">
                              trending_up
                            </Icon>
                            <Icon
                              class="material-icons"
                              slot="trailingIcon"
                              on:click={handleRemoveClick(
                                "up",
                                list[1]["up"].indexOf(up),
                                list[0]
                              )}
                            >
                              delete
                            </Icon>
                          </Textfield>
                        </Text>
                      </Item>
                    {/each}
                  </List>
                {/if}
                {#if Object.values(list[1]["down"]).length !== 1}
                  <Separator />
                  <List>
                    {#each list[1]["down"] as down}
                      <Item class="alert-down">
                        <Text>
                          <span class="alert-label"
                            >{$_("pricealert.alertDown")}</span
                          >
                          <Textfield bind:value={down} type="number">
                            <Icon class="material-icons" slot="leadingIcon">
                              trending_down
                            </Icon>
                            <Icon
                              class="material-icons"
                              slot="trailingIcon"
                              on:click={handleRemoveClick(
                                "down",
                                list[1]["down"].indexOf(down),
                                list[0]
                              )}
                            >
                              delete
                            </Icon>
                          </Textfield>
                        </Text>
                      </Item>
                    {/each}
                  </List>
                {/if}
              </Content>
            </Panel>
          {/if}
        {/each}
      </Accordion>
    </Group>
  </MenuSurface>
{/if}

<style>
  .pricealert-wrapper {
    position: fixed;
    z-index: 9;
    top: 60px;
    right: -275px;
    width: 275px;
    background-color: #242424;
    border: 1px solid #2c2c2c;
    transition: 1s;
  }
  .pricealert-wrapper h3 {
    background-color: #1b1b1b;
    margin: 0;
    padding: 10px;
    border-bottom: 1px solid #323232;
    color: brown;
    font-size: 1em;
  }
  .pricealert-wrapper .overflow {
    height: 600px;
    overflow: hidden;
  }
  .pricealert-button {
    height: 44px;
    text-align: center;
    vertical-align: middle;

    transition: 1s;
    cursor: pointer;
    color: brown;
    position: absolute;
    top: -1px;
    left: -25px;
    background: rgb(27, 27, 27);
    padding: 5px;
    border-left: 1px solid #282828;
    border-bottom: 1px solid #2c2c2c;
    border-top: 1px solid #2c2c2c;
    -webkit-border-top-left-radius: 5px;
    -webkit-border-bottom-left-radius: 5px;
    -moz-border-radius-topleft: 5px;
    -moz-border-radius-bottomleft: 5px;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }
  .pricealert-button i {
    margin-top: 7px;
  }
  .pricealert-container {
    padding: 0 0 40px 0;
    color: white;
    font-size: 0.8em;
    overflow-y: auto;
    height: 100%;
  }
  .pricealert-container .listpair {
    cursor: pointer;
    font-weight: bold;
    padding: 5px;
    background: #2e2e2e;
    display: inline-block;
    width: 100%;
    border-top: 1px dashed #333;
    border-left: 1px dashed #333;
    border-right: 1px dashed #333;
  }
  .pricealert-container .alert-up,
  .pricealert-container .alert-down {
    color: #919191;
  }
  .pricealert-container .alert-up li,
  .pricealert-container .alert-down li {
    padding: 5px;
    border-bottom: 1px dotted #3a3a3a;
    background-color: #282828;
    margin-bottom: 2px;
    transition: 1s;
  }
  .pricealert-container .alert-up li {
    background-color: #202a20;
  }
  .pricealert-container .alert-down li {
    background-color: #2a2020;
  }
  .pricealert-container .alert-up i {
    color: #50b300;
  }
  .pricealert-container .alert-down i {
    color: #b30000;
  }
  .pricealert-container .alert-up .remove i,
  .pricealert-container .alert-down .remove i {
    color: #505050;
    cursor: pointer;
  }
  .pricealert-container .alert-up .remove i:hover,
  .pricealert-container .alert-down .remove i:hover {
    color: #888888;
  }
  .pricealert-container .alert-up .alert-price,
  .pricealert-container .alert-down .alert-price {
    cursor: pointer;
    font-weight: bold;
  }
  .pricealert-container .alert-up .alert-price :global(input[type="number"]),
  .pricealert-container .alert-down .alert-price :global(input[type="number"]) {
    background-color: #252525;
    outline: none;
    border: 1px solid #323232;
    padding: 1px;
    width: 80%;
    color: #747474;
    -moz-appearance: textfield;
  }
  .pricealert-container hr {
    border: 1px dashed #383838;
  }
  :global(input::-webkit-outer-spin-button),
  :global(input::-webkit-inner-spin-button) {
    -webkit-appearance: none;
  }
  .pricealert-container .alert-up .alert-price .alert-price-input,
  .pricealert-container .alert-down .alert-price .alert-price-input {
    display: none;
  }
  .pricealert-container
    .alert-up
    .alert-price
    :global(input[type="number"]:hover),
  .pricealert-container
    .alert-down
    .alert-price
    :global(input[type="number"]:hover) {
    border: 1px solid #5f5f5f;
    background: #2b2b2b;
  }
  :global(.alerts-list) {
    max-width: 500px;
    min-width: 100px;
    border-right: 1px solid #ff0000;
  }
  :global(.alert-up) {
    color: #50b300;
  }
  :global(.alert-down) {
    color: #b30000;
  }
  :global(.smui-accordion .mdc-deprecated-list-item) {
    height: 30px !important;
  }
  :global(.smui-accordion .smui-paper__content) {
    padding: 0 !important;
  }
  :global(.smui-accordion .mdc-text-field__input) {
    min-width: 70px;
    max-width: 85px;
  }
  :global(.alert-label) {
    min-width: 150px;
    display: inline-block;
  }
</style>

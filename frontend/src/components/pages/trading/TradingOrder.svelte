<script>
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";
  import { online, assetpair, asymbole } from "store/store.js";
  import UserData from "classes/UserData.js";
  import SpreadBox from "components/pages/trading/SpreadBox.svelte";

  const ud = new UserData();
  let error = false;
  let balance = false;
  let limit = 0;
  let action;
  let type = "market";
  let leverage = "0";
  let buyorsell;
  let amount;
  let qty;
  let price;
  let total;
  let condclose = false;
  let postonly = false;
  let base = $asymbole.hasOwnProperty($assetpair.base)
    ? $asymbole[$assetpair.base].name
    : $assetpair.base;
  let quote = $asymbole.hasOwnProperty($assetpair.quote)
    ? $asymbole[$assetpair.quote].name
    : $assetpair.quote;
  let devise = "quote";
  let quote_balance;

  const GetBalance = async () => {
    try {
      if (!$online) {
        error = true;
        return false;
      }

      const res = await ud.getBalance();
      if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
        error = res.error;
        if (limit < 5) {
          GetBalance();
          limit++;
        }
      } else {
        balance = res;
        error = false;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const setActionWay = (way) => {
    action = way;
    let btnBuy = document.querySelector(".action-buy");
    let btnSell = document.querySelector(".action-sell");

    if (way === "buy") {
      btnBuy.classList.add("active");
      btnSell.classList.remove("active");
    }

    if (way === "sell") {
      btnSell.classList.add("active");
      btnBuy.classList.remove("active");
    }

    if (action === "buy") buyorsell = "base";
    if (action === "sell") buyorsell = "quote";
  };

  const setPercentAmount = (percent) => {
    let funds = "1500";
    percent = leverage > 0 ? funds * leverage * percent : funds * percent;
    amount = percent;
  };

  const resetForm = () => {
    action;
    type = "market";
    leverage = "0";
    amount = "";
    qty = "";
    price = "";
    total = "";
    condclose = false;
    postonly = false;
    devise = "quote";
  };

  const setAttr = (node, val) => {
    node.setAttribute("value", val);

    return {
      update: function (val) {
        node.setAttribute("value", val);
      },
    };
  };

  onMount(() => {
    GetBalance();
  });

  $: {
    quote_balance =
      buyorsell === "quote" && balance.hasOwnProperty($assetpair.quote)
        ? balance[$assetpair.quote]
        : buyorsell === "base" && balance.hasOwnProperty($assetpair.base)
        ? balance[$assetpair.base]
        : "";
  }

  const handleSubmit = () => {
    console.log("handleSubmit");
  };
</script>

<form id="placeorder" on:submit|preventDefault={handleSubmit}>
  <div id="trading-order">
    <div>
      <fieldset>
        <div class="item">
          <label for="trading-o-action">
            {$_("trading.order.action")}
          </label>
          <button
            type="button"
            class="action-buy"
            name="trading-o-action-buy"
            on:click={() => setActionWay("buy")}
          >
            {$_("trading.order.buy")}
          </button>
          <button
            type="button"
            class="action-sell"
            name="trading-o-action-sell"
            on:click={() => setActionWay("sell")}
          >
            {$_("trading.order.sell")}
          </button>
        </div>
        <hr />
        <div class="item">
          <label for="trading-o-type">{$_("trading.order.type")}:</label>
          <select name="trading-o-type" bind:value={type} use:setAttr={type}>
            <option value="market">
              {$_("trading.order.market")}
            </option>
            <option value="limit">
              {$_("trading.order.limit")}
            </option>
            <option value="settle-position">
              {$_("trading.order.setPosition")}
            </option>
            <option value="stop-loss">
              {$_("trading.order.stopLoss")}
            </option>
            <option value="take-profit">
              {$_("trading.order.takeProfit")}
            </option>
            <option value="stop-loss-limit">
              {$_("trading.order.stopLossLmt")}
            </option>
            <option value="take-profit-limit">
              {$_("trading.order.takeProfitLmt")}
            </option>
          </select>
        </div>
        <hr />
        <div class="item">
          <label for="trading-o-leverage">
            {$_("trading.order.margin")}:
          </label>
          <div class="stepper">
            <ul>
              <li>
                <label for="leverage-0">0</label>
                <input
                  type="radio"
                  id="leverage-0"
                  name="leverage"
                  value="0"
                  checked="checked"
                  bind:group={leverage}
                  use:setAttr={leverage}
                />
              </li>
              {#each $assetpair.leverage_buy as lev}
                <!-- // changer buy ou sell -->
                <li>
                  <label for="leverage-{lev}">{lev}x</label>
                  <input
                    type="radio"
                    id="leverage-{lev}"
                    name="leverage"
                    value={lev}
                    bind:group={leverage}
                    use:setAttr={leverage}
                  />
                </li>
              {/each}
            </ul>
          </div>
        </div>
        <hr />
        <div class="item">
          <div>
            <label for="trading-o-total">
              {$_("trading.order.funds")}:
            </label>
            <input
              type="number"
              name="trading-o-total"
              placeholder={quote_balance}
              bind:value={amount}
              use:setAttr={amount}
              autocomplete="off"
            />
          </div>
          <div class="action-percent-wrapper">
            <button
              type="button"
              class="action-percent"
              name="trading-o-total-percent"
              on:click={() => setPercentAmount("0.25")}
            >
              25%
            </button>
            <button
              type="button"
              class="action-percent"
              name="trading-o-total-percent"
              on:click={() => setPercentAmount("0.5")}
            >
              50%
            </button>
            <button
              type="button"
              class="action-percent"
              name="trading-o-total-percent"
              on:click={() => setPercentAmount("0.75")}
            >
              75%
            </button>
            <button
              type="button"
              class="action-percent"
              name="trading-o-total-percent"
              on:click={() => setPercentAmount("0.1")}
            >
              100%
            </button>
          </div>
        </div>
      </fieldset>
    </div>
    <div>
      <fieldset>
        <div class="separator">
          <label for="qty">
            {$_("trading.order.quantity")}
          </label>
          <input
            type="text"
            name="qty"
            bind:value={qty}
            use:setAttr={qty}
            autocomplete="off"
          />
          <span class="input-label">BTC</span>
        </div>
        <div class="separator">
          <label for="price">
            {$_("trading.order.price")}
          </label>
          <input
            type="text"
            name="price"
            bind:value={price}
            use:setAttr={price}
            autocomplete="off"
          />
          <span class="input-label">USDT</span>
        </div>
        <div class="separator">
          <label for="total">
            {$_("trading.order.total")}
          </label>
          <input
            type="text"
            name="total"
            bind:value={total}
            use:setAttr={total}
            autocomplete="off"
          />
          <span class="input-label">USDT</span>
        </div>
        <hr />
        <div>
          <input
            type="checkbox"
            name="postonly"
            bind:checked={postonly}
            use:setAttr={postonly}
          />
          <span class="label-checkbox">
            {$_("trading.order.postOnly")}
          </span>
          <input
            type="checkbox"
            name="condclose"
            bind:checked={condclose}
            use:setAttr={condclose}
          />
          <span class="label-checkbox">
            {$_("trading.order.closeCond")}
          </span>
          <div class="right">
            <span class="label-checkbox">
              {$_("trading.order.fees")} :
            </span>
            <input
              type="radio"
              name="devise"
              value="base"
              bind:group={devise}
              use:setAttr={devise}
            />
            <span class="label-checkbox">{base}</span>
            <input
              type="radio"
              name="devise"
              value="quote"
              bind:group={devise}
              use:setAttr={devise}
            />
            <span class="label-checkbox">{quote}</span>
          </div>
        </div>
        <hr />
        <div class="confirmation">
          <button type="button" class="reset" on:click={resetForm}>
            {$_("trading.order.reset")}
          </button>
          <button type="submit">
            {$_("trading.order.confirm")}
          </button>
        </div>
      </fieldset>
    </div>
  </div>

  {#if condclose}
    <div id="closed-conditionnaly">
      <h2>{$_("trading.order.closeCond")}</h2>
      <fieldset>
        <div class="item">
          <label for="trading-o-type">{$_("trading.order.type")}:</label>
          <select name="trading-o-type">
            <option value="limit">{$_("trading.order.limit")}</option>
            <option value="stop-loss">{$_("trading.order.stopLoss")}</option>
            <option value="take-profit">{$_("trading.order.takeProfit")}</option
            >
            <option value="stop-loss-limit"
              >{$_("trading.order.stopLossLmt")}</option
            >
            <option value="take-profit-limit"
              >{$_("trading.order.takeProfitLmt")}</option
            >
          </select>
        </div>
        <div class="separator">
          <label for="price">{$_("trading.order.price")}</label>
          <input type="text" name="price" />
          <span class="input-label">USDT</span>
        </div>
        <div class="separator">
          <label for="price">{$_("trading.order.total")}</label>
          <input type="text" name="price" />
          <span class="input-label">USDT</span>
        </div>
      </fieldset>
    </div>
  {/if}
</form>

<SpreadBox />

<style>
  #closed-conditionnaly {
    display: grid;
    grid-template-columns: repeat(auto-fit, 100%);
  }
  #trading-order {
    display: grid;
    grid-template-columns: repeat(auto-fit, 50%);

    font-size: 0.9rem;
  }
  fieldset {
    border: 1px solid #1c1c1c;
    padding: 10px;
  }
  label {
    color: #8b8b8b;
    font-weight: 500;
    width: 20%;
    display: inline-block;
    padding: 5px;
    border: none;
    margin-right: 35px;
  }
  hr {
    margin: 10px 0;
    background-color: #262626;
    border: none;
    height: 2px;
  }
  button {
    border: 1px solid #323232;
    padding: 5px;
    width: 35%;
    background: #1c1c1c;
    color: #747474;
    cursor: pointer;
    font-weight: bold;
  }
  button.action-buy,
  button.action-sell {
    border: 1px solid #323232;
    padding: 5px;
    width: 35%;
    background: #1c1c1c;
    color: #747474;
    cursor: pointer;
    font-weight: bold;
  }
  :global(button.active).action-buy {
    color: darkgreen;
    border: 1px solid #5f5f5f;
    background: #2b2b2b;
  }
  :global(button.active).action-sell {
    color: firebrick;
    border: 1px solid #5f5f5f;
    background: #2b2b2b;
  }
  button.action-percent {
    border: 1px solid #323232;
    padding: 5px;
    width: 24%;
    background: #1c1c1c;
    color: #747474;
    cursor: pointer;
    font-weight: bold;
  }
  button:hover {
    border: 1px solid #5f5f5f;
    background: #2b2b2b;
  }
  select {
    border: 1px solid #5f5f5f;
    background: #2b2b2b;
    color: #747474;
    outline: none;
    padding: 5px;
    width: 71%;
  }
  option {
    background-color: #252525;
    color: #747474;
  }
  input[type="text"],
  input[type="number"] {
    background-color: #252525;
    outline: none;
    border: 1px solid #323232;
    padding: 5px;
    width: 71%;
    color: #747474;
  }
  input[type="text"]:hover,
  input[type="text"]:focus,
  input[type="number"]:hover,
  input[type="number"]:focus {
    border: 1px solid #5f5f5f;
    background: #2b2b2b;
  }
  .action-percent-wrapper {
    padding: 10px 0 0 0;
  }
  div.separator {
    position: relative;
    margin-top: 10px;
  }
  span.input-label {
    position: absolute;
    top: 0;
    right: 5px;
    border: 1px solid #323232;
    width: 45px;
    height: 30px;
    padding: 5px 0 0 0px;
    color: #838383;
    font-weight: bold;
    font-size: 0.7em;
    background-color: #202020;
    display: inline-block;
    text-align: center;
    vertical-align: middle;
  }
  div.separator input[type="text"] {
    width: 67%;
  }
  div.confirmation {
    padding-top: 14px;
  }
  div.confirmation button {
    width: 49%;
  }
  button.reset {
    background-color: #281111;
  }
  .stepper {
    display: inline-block;
    width: 71%;
    position: relative;
  }
  .stepper ul {
    display: table;
    width: 100%;
    position: absolute;
    top: 0;
    white-space: pre-line;
    margin: 0;
  }
  .stepper li {
    display: table-cell;
    background-color: #343434;
    height: 2px;
    margin-top: 0px;
    position: relative;
    list-style: none;
  }
  .stepper li:first-child label {
    left: 0;
    width: 54px;
    text-align: left;
  }
  .stepper li:last-child label {
    left: -46px;
    width: 54px;
    text-align: right;
  }
  .stepper li:last-child {
    width: 10px;
    background: none;
  }
  .stepper li label {
    position: absolute;
    top: -25px;
    left: -33px;
    font-weight: bold;
    border: none;
    font-size: 0.7em;
    cursor: pointer;
    width: 70px;
    height: 40px;
    margin: 0;
    text-align: center;
    padding: 0;
    vertical-align: middle;
  }
  .stepper li input[type="radio"] {
    position: absolute;
    width: 12px;
    height: 12px;
    top: -5px;
    left: -3px;
    outline: none;
    cursor: pointer;
  }
  .stepper li input[type="radio"]:after {
    width: 12px;
    height: 12px;
    border-radius: 12px;
    top: -1px;
    left: -1px;
    position: relative;
    background-color: #343434;
    content: "";
    display: inline-block;
    visibility: visible;
    border: 1px solid #333;
  }
  .stepper li input[type="radio"]:checked:after {
    width: 12px;
    height: 12px;
    border-radius: 12px;
    top: -1px;
    left: -1px;
    position: relative;
    background-color: #1c1c1c;
    content: "";
    display: inline-block;
    visibility: visible;
    border: 1px solid #333;
  }
  input[type="radio"] {
    width: 12px;
    height: 12px;
    outline: none;
    cursor: pointer;
    outline: none;
  }
  input[type="radio"]:after {
    position: relative;
    width: 12px;
    height: 12px;
    border-radius: 12px;
    top: -1px;
    left: -1px;
    background-color: #343434;
    content: "";
    display: inline-block;
    visibility: visible;
    border: 1px solid #333;
  }
  input[type="radio"]:checked:after {
    position: relative;
    width: 12px;
    height: 12px;
    border-radius: 12px;
    top: -1px;
    left: -1px;
    background-color: #1c1c1c;
    content: "";
    display: inline-block;
    visibility: visible;
    border: 1px solid #333;
  }

  input[type="checkbox"] {
    width: 12px;
    height: 12px;
    top: -5px;
    left: -3px;
    outline: none;
    cursor: pointer;
    margin-right: 5px;
  }
  input[type="checkbox"]:after {
    width: 12px;
    height: 12px;
    top: -1px;
    left: -1px;
    background-color: #343434;
    content: "";
    display: inline-block;
    visibility: visible;
    border: 1px solid #333;
  }
  input[type="checkbox"]:checked:after {
    width: 12px;
    height: 12px;
    top: -1px;
    left: -1px;
    background-color: #1c1c1c;
    content: "";
    display: inline-block;
    visibility: visible;
    border: 1px solid #333;
  }
  span.label-checkbox {
    font-size: 0.9em;
    color: #747474;
    margin-right: 10px;
    text-align: center;
    vertical-align: top;
  }
</style>

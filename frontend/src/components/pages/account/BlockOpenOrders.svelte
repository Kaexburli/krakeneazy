<script>
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";
  import { openorders } from "store/wsstore.js";
  import {
    online,
    assetpair,
    assetpairs,
    openordersdata,
  } from "store/store.js";
  import UserData from "classes/UserData.js";
  import formatDate from "utils/formatDate.js";
  import { fade } from "svelte/transition";
  import { SyncLoader } from "svelte-loading-spinners";

  let error = false;

  /**
   * checkStatusDatas
   *********************/
  const checkStatusDatas = (datas) => {
    let openorders_tmp = $openordersdata;
    if (datas.length < 1 || typeof openorders_tmp.length === "undefined")
      return false;

    // parse le tableau datas
    datas.forEach((element, index) => {
      // récupère les clés du tableau (ID order)
      let order_id = Object.keys(element);

      if (typeof datas[index][order_id] === "undefined") return false;

      let status = datas[index][order_id]["status"];
      switch (status) {
        case "open":
          if (datas[index][order_id].hasOwnProperty("opentm")) {
            // Vérifie si le status de l'élément est 'open' et si il existe une propriété 'opentm'
            // Si les 2 conditions sont remplis on push l'élément dans la variable openorders_tmp
            // console.log("# Nouvelle ouverture d'ordre ou ordre existant");
            openorders_tmp.forEach((el, i) => {
              let oid = Object.keys(el);
              if (oid[0] === order_id[0]) {
                // console.log(`Odre déjà présent => suppression ${order_id[0]}`);
                openorders_tmp.splice(openorders_tmp.indexOf(el), 1);
              }
            });
            // Add data
            openorders_tmp.push(datas[index]);
            openordersdata.update((n) => openorders_tmp);
          } else {
            // Vérifie si le status est 'open' et qu'il existe pas une propriété opentm
            // Si les conditions sont remplies on passe le status à 'open' dans le tableau openorders_tmp
            // console.log("# Changement d'état d'attente à ouvert");
            openorders_tmp.forEach((el, i) => {
              let oid = Object.keys(el);
              if (oid[0] === order_id[0]) {
                openorders_tmp[i][oid].status = datas[index][order_id].status;
              }
            });
            openordersdata.update((n) => openorders_tmp);
          }
          break;

        case "canceled":
        case "closed":
          // Vérifie si le status de l'élément est 'canceled' ou 'closed'
          // Si la condition est remplie on parse le tableau openorders pour récupérer l'ID order
          // Ensuite on vérifie que l'ID order est le même que l'ID order de l'élément
          // On vérifie que la date de l'élément est supérieur a la date dans le tableau
          // On supprime l'élément dans le tableau openorders
          // console.log("# Ordre annulé ou fermé");
          openorders_tmp.forEach((el, i) => {
            let oid = Object.keys(el);
            if (
              oid[0] === order_id[0] &&
              datas[index][order_id].lastupdated > openorders_tmp[i][oid].opentm
            ) {
              openorders_tmp.splice(i, 1);
            }
          });
          openordersdata.update((n) => openorders_tmp);
          break;

        case "pending":
          // Vérifie si le status de l'élément est 'pending'
          // Si la condition est remplis on push l'élément dans la variable openorders
          // console.log("# Commande en attente");
          openorders_tmp.push(datas[index]);
          openordersdata.update((n) => openorders_tmp);
          break;

        default:
          if (!datas[index][order_id].hasOwnProperty("status")) {
            // Cas d'ordre exécuté
            // La valeur vol_exec est mis a jour sur l'id d'ordre
            // console.log("# Mise a jour du volume exécuté");
            openorders_tmp.forEach((el, i) => {
              let oid = Object.keys(el);
              if (oid[0] === order_id[0]) {
                openorders_tmp[i][oid].vol_exec =
                  datas[index][order_id].vol_exec;
                openorders_tmp[i][oid].cost = datas[index][order_id].cost;
                openorders_tmp[i][oid].fee = datas[index][order_id].fee;
                openorders_tmp[i][oid].avg_price =
                  datas[index][order_id].avg_price;
                openorders_tmp[i][oid].userref = datas[index][order_id].userref;
              }
            });
            openordersdata.update((n) => openorders_tmp);
          }
          break;
      }
    });
  };

  /**
   * onMount
   *********************/
  onMount(() => {
    openorders.subscribe((tick) => {
      if (!$online) {
        error = true;
        return false;
      } else if (
        typeof tick !== "undefined" &&
        tick.hasOwnProperty("errorMessage")
      ) {
        error = "[" + tick.subscription.name + "] " + tick.errorMessage;
      } else if (typeof tick !== "undefined" && Object.keys(tick).length >= 1) {
        if (tick.service === "OpenOrders" && tick.data) {
          checkStatusDatas(tick.data);
        }
      }
    });
  });

  /**
   * GetOpenOrders
   *********************/
  const GetOpenOrders = async () => {
    try {
      if (!$online) {
        error = true;
        return false;
      }

      if (typeof $assetpair.altname === "undefined") {
        error = $_("account.openOrders.getOpenOrders.error");
        return false;
      }

      const ud = new UserData();
      const res = await ud.getOpenOrders({ trade: true });
      if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
        error = res.error;
      } else {
        if (typeof res !== "undefined" && res.hasOwnProperty("open")) {
          let openorders_tmp = [];
          Object.keys(res.open).map((key) => {
            // Création d'un objet temporaire
            let o = new Object();
            o[key] = res.open[key];
            // Correction des décimales prix et coût
            if (
              typeof o[key]["descr"] !== "undefined" &&
              typeof $assetpairs[o[key]["descr"]["pair"]] !== "undefined"
            ) {
              let as = $assetpairs[o[key]["descr"]["pair"]];
              o[key]["descr"]["pair"] = as["wsname"];
              o[key]["descr"]["price"] = parseFloat(
                o[key]["descr"]["price"]
              ).toFixed(as["pair_decimals"]);
              o[key]["cost"] = parseFloat(o[key]["cost"]).toFixed(
                as["pair_decimals"]
              );
            }
            // Push dans un tableau
            openorders_tmp.push(o);
          });
          // Initialisation du store openordersdata
          openordersdata.set(openorders_tmp);
        }
        error = false;
      }
    } catch (error) {
      console.error("[ERROR]:", error);
    }
  };

  // Si aucune données n'existe on appel
  // l'api REST pour récupérer les datas
  $: if (!$openordersdata) {
    GetOpenOrders();
  }
</script>

<div class="block open-orders">
  <h4>{$_("account.openOrders.title")}</h4>
  <table class="flex-table flex-fixhead-table">
    <thead>
      <tr>
        <th>{$_("account.openOrders.type")}</th>
        <th>{$_("account.openOrders.date")}</th>
        <th>{$_("account.openOrders.pair")}</th>
        <th>{$_("account.openOrders.price")}</th>
        <th>{$_("account.openOrders.volume")}</th>
        <th>{$_("account.openOrders.cost")}</th>
        <th>{$_("account.openOrders.statut")}</th>
        <th>{$_("account.openOrders.action")}</th>
      </tr>
    </thead>
    <tbody>
      {#if error && typeof error !== "boolean"}
        <span class="error">{error}</span>
      {/if}
      {#if $openordersdata.length === 0 && !error}
        <SyncLoader size="30" color="#e8e8e8" unit="px" duration="1s" />
      {:else if typeof $openordersdata !== "undefined" && $openordersdata.length > 0 && $openordersdata}
        {#each $openordersdata as el, i}
          <tr id={Object.keys(el)} transition:fade>
            <td
              data-label={$_("account.openOrders.type")}
              class={el[Object.keys(el)]["descr"]["type"]}
            >
              {#if el[Object.keys(el)]["descr"]["type"] === "buy"}
                <span class="buy">{$_("account.openOrders.buy")}</span>
              {:else}
                <span class="sell">{$_("account.openOrders.sell")}</span>
              {/if}
            </td>
            <td data-label={$_("account.openOrders.date")}>
              <div class="Date">
                <div>{formatDate(el[Object.keys(el)]["opentm"], "D")}</div>
                <span class="hour">
                  ({formatDate(el[Object.keys(el)]["opentm"], "H")})
                </span>
              </div>
            </td>
            <td data-label={$_("account.openOrders.pair")}>
              <span class="currency"
                >{el[Object.keys(el)]["descr"]["pair"]}</span
              >
            </td>
            <td data-label={$_("account.openOrders.price")}>
              <span>
                {el[Object.keys(el)]["descr"]["price"]}
                <span class="currency"
                  >{el[Object.keys(el)]["descr"]["pair"].split("/")[1]}</span
                >
              </span>
            </td>
            <td data-label={$_("account.openOrders.volume")}>
              <div class="volume">
                <div>
                  <span class="price-little">
                    {el[Object.keys(el)]["vol"]}
                  </span>
                  <span class="price-little currency">
                    {el[Object.keys(el)]["descr"]["pair"].split("/")[0]}
                  </span>
                </div>
                <div>
                  {#if parseFloat(el[Object.keys(el)]["vol_exec"]) > 0 && parseFloat(el[Object.keys(el)]["vol_exec"]) < el[Object.keys(el)]["vol"]}
                    <span class="price-little red">
                      ({el[Object.keys(el)]["vol_exec"]})
                    </span>
                  {:else}
                    <span class="price-little">
                      ({el[Object.keys(el)]["vol_exec"]})
                    </span>
                  {/if}
                  <span class="price-little currency">
                    {el[Object.keys(el)]["descr"]["pair"].split("/")[0]}
                  </span>
                </div>
              </div>
            </td>
            <td data-label={$_("account.openOrders.cost")}>
              {el[Object.keys(el)]["cost"]}
            </td>
            <td data-label={$_("account.openOrders.statut")}>
              <span class="badge">
                {el[Object.keys(el)]["status"]}
              </span>
            </td>
            <td data-label={$_("account.openOrders.action")}>
              <span class="icon actions"><i class="fas fa-cog" /></span>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>

<style>
  .open-orders h4 {
    background-color: #3a3a3a;
    padding: 5px;
    border: 1px solid #222222;
    color: #c7c7c7;
    font-size: 0.9em;
    font-weight: inherit;
  }
  .open-orders .hour {
    font-size: 0.8em;
    color: #858585;
  }
  .open-orders td.buy {
    border-left: 3px solid rgb(83 104 50);
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid rgb(37 46 24);
    background: #242424;
    padding: 15px 0 15px 10px;
  }
  .open-orders td.sell {
    border-left: 3px solid #8d2525;
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid #3e2626;
    background: #242424;
    padding: 15px 0 15px 10px;
  }
  .open-orders .buy {
    color: rgb(83 104 50);
    text-transform: uppercase;
  }
  .open-orders .sell {
    color: #8d2525;
    text-transform: uppercase;
  }
  .open-orders .badge {
    padding: 7px 15px 0 15px;
    color: rgb(141, 199, 54);
    background-color: #283826;
    border: 1px dotted #1e1e1e;
    text-transform: capitalize;
  }
  .open-orders .actions {
    cursor: pointer;
  }
  .open-orders .price-little {
    font-size: 0.8em;
  }
  .open-orders .currency {
    color: #555555;
  }
  .open-orders .block {
    display: block;
  }
  .red {
    color: #f92828;
  }
</style>

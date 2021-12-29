<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  import {
    online,
    assetpair,
    assetpairs,
    openordersdata,
  } from "store/store.js";
  import formatDate from "utils/formatDate.js";
  import UserData from "classes/UserData.js";
  import { wsopenorders } from "store/wsopenorders.js";
  import { SyncLoader } from "svelte-loading-spinners";

  let error = false;
  let limit = 0;
  let openorders = false;
  let openorders_store = false;
  let openorders_tmp = [];

  const get__store = (store) => {
    let $val;
    store.subscribe(($) => ($val = $))();
    return $val;
  };

  const checkStatusDatas = (datas) => {
    if (datas.length < 1) return;

    // parse le tableau datas
    datas.forEach((element, index) => {
      // récupère les clés du tableau (ID order)
      let order_id = Object.keys(element);

      if (typeof datas[index][order_id] !== "undefined") {
        // Correction d'affichage pour le retour de l'api REST
        if (
          typeof datas[index][order_id]["descr"] !== "undefined" &&
          typeof $assetpairs[datas[index][order_id]["descr"]["pair"]] !==
            "undefined"
        ) {
          // console.log("Remaniment des datas fetch");
          let as = $assetpairs[datas[index][order_id]["descr"]["pair"]];
          datas[index][order_id]["descr"]["pair"] = as["wsname"];
          datas[index][order_id]["descr"]["price"] = parseFloat(
            datas[index][order_id]["descr"]["price"]
          ).toFixed(as["pair_decimals"]);
          datas[index][order_id]["cost"] = parseFloat(
            datas[index][order_id]["cost"]
          ).toFixed(as["pair_decimals"]);
        }

        // Vérifie si le status de l'élément est 'open' et si il existe une propriété 'opentm'
        // Si les 2 conditions sont remplis on push l'élément dans la variable openorders
        if (
          datas[index][order_id]["status"] === "open" &&
          datas[index][order_id].hasOwnProperty("opentm")
        ) {
          // console.log("Nouvelle ouverture d'ordre");
          openorders_tmp.forEach((el, i) => {
            let oid = Object.keys(el);
            if (oid[0] === order_id[0]) {
              // console.log(`Odre déjà présent => suppression ${order_id[0]}`);
              openorders_tmp.splice(openorders_tmp.indexOf(el), 1);
            }
          });
          // Add data
          openorders_tmp.push(datas[index]);
        }
        // Vérifie si le status de l'élément est 'canceled' ou 'closed'
        // Si la condition est remplie on parse le tableau openorders pour récupérer l'ID order
        // Ensuite on vérifie que l'ID order est le même que l'ID order de l'élément
        // On vérifie que la date de l'élément est supérieur a la date dans le tableau
        // On supprime l'élément dans le tableau openorders
        else if (
          datas[index][order_id]["status"] === "canceled" ||
          datas[index][order_id]["status"] === "closed"
        ) {
          // console.log("Ordre annulé ou fermé");
          openorders_tmp.forEach((el, i) => {
            let oid = Object.keys(el);
            if (
              oid[0] === order_id[0] &&
              datas[index][order_id].lastupdated > openorders_tmp[i][oid].opentm
            ) {
              openorders_tmp.splice(i, 1);
            }
          });
        }
        // Vérifie si le status de l'élément est 'pending'
        // Si la condition est remplis on push l'élément dans la variable openorders
        else if (datas[index][order_id]["status"] === "pending") {
          // console.log("Commande en attente");
          openorders_tmp.push(datas[index]);
        }
        // Vérifie si le status est 'open' et qu'il existe pas une propriété opentm
        // Si les conditions sont remplies on passe le status à 'open' dans le tableau openorders
        else if (
          datas[index][order_id]["status"] === "open" &&
          !datas[index][order_id].hasOwnProperty("opentm")
        ) {
          // console.log("Changement d'état d'attente à ouvert");
          if (openorders_tmp) {
            openorders_tmp.forEach((el, i) => {
              let oid = Object.keys(el);
              if (oid[0] === order_id[0]) {
                openorders_tmp[i][oid].status = datas[index][order_id].status;
              }
            });
          }
        }
        // Cas d'ordre exécuté
        // La valeur vol_exec est mis a jour sur l'id d'ordre
        else if (!datas[index][order_id].hasOwnProperty("status")) {
          // console.log("Mise a jour du volume exécuté");
          if (openorders_tmp) {
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
          }
        } else {
          console.log(
            "Cas non géré pour le moment merci de faire le necéssaire =>",
            datas
          );
        }
      }
    });

    return openorders_tmp;
  };

  const GetOpenOrders = async () => {
    try {
      if (!$online) {
        error = true;
        return false;
      }

      if (typeof $assetpair.altname === "undefined") {
        error = "Veuillez choisir une paire d'asset";
        return false;
      }

      if (error === 'ERROR: 500 ["EAPI:Rate limit exceeded"]') {
        error = true;
        return false;
      }

      const ud = new UserData();
      const res = await ud.getOpenOrders({ trade: true });
      if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
        error = res.error;
        if (limit < 5) {
          GetOpenOrders();
          limit++;
        }
      } else {
        if (typeof res !== "undefined" && res.hasOwnProperty("open")) {
          openorders = [];
          Object.keys(res.open).map((key) => {
            let o = new Object();
            o[key] = res.open[key];
            openorders.push(o);
          });
          // console.log("Fetch res:", openorders);
          openorders = checkStatusDatas(openorders);
          // console.log("Fetch:", openorders);
          openordersdata.update((n) => openorders);
        }
        error = false;
      }
    } catch (error) {
      console.log(error);
    }
  };

  onMount(() => {
    openorders_store = get__store(openordersdata);
    if (openorders_store) {
      return (openorders = openorders_store);
    }

    wsopenorders.subscribe((tick) => {
      if (typeof tick !== "undefined") {
        if (!$online) {
          error = true;
          return false;
        } else if (tick.hasOwnProperty("errorMessage")) {
          error = "[" + tick.subscription.name + "] " + tick.errorMessage;
          // console.error("ERROR", error);
        } else if (Object.keys(tick).length >= 1) {
          // console.log("WS tick:", tick);
          openorders = checkStatusDatas(tick);
          // console.log("WS openorders:", openorders);
          openordersdata.update((n) => openorders);
        }
      }
    });
  });

  $: {
    if (!$openordersdata) {
      // console.log("OPENORDERSDATA empty on appel GetOpenOrders");
      GetOpenOrders();
    }
  }
</script>

<div class="block open-orders">
  <h4>Ouverts</h4>
  <table class="flex-table flex-fixhead-table">
    <thead>
      <tr>
        <th>Type</th>
        <th>Date</th>
        <th>Paire</th>
        <th>Prix</th>
        <th>Volume</th>
        <th>Coût</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#if error && typeof error !== "boolean"}
        <span class="error">{error}</span>
      {/if}
      {#if !$openordersdata && !error}
        <SyncLoader size="30" color="#e8e8e8" unit="px" duration="1s" />
      {:else if $openordersdata}
        {#each $openordersdata as el, i}
          <tr id={Object.keys(el)} transition:fade>
            <td data-label="Type" class={el[Object.keys(el)]["descr"]["type"]}>
              {#if el[Object.keys(el)]["descr"]["type"] === "buy"}
                <span class="buy">Acheter</span>
              {:else}
                <span class="sell">Vendre</span>
              {/if}
            </td>
            <td data-label="open-time">
              <div class="Date">
                <div>{formatDate(el[Object.keys(el)]["opentm"], "D")}</div>
                <span class="hour">
                  ({formatDate(el[Object.keys(el)]["opentm"], "H")})
                </span>
              </div>
            </td>
            <td data-label="Asset">
              <span class="currency"
                >{el[Object.keys(el)]["descr"]["pair"]}</span
              >
            </td>
            <td data-label="Prix">
              <span>
                {el[Object.keys(el)]["descr"]["price"]}
                <span class="currency"
                  >{el[Object.keys(el)]["descr"]["pair"].split("/")[1]}</span
                >
              </span>
            </td>
            <td data-label="Volume">
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
            <td data-label="Coût">
              {el[Object.keys(el)]["cost"]}
            </td>
            <td data-label="Status">
              <span class="badge">
                {el[Object.keys(el)]["status"]}
              </span>
            </td>
            <td data-label="Actions">
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

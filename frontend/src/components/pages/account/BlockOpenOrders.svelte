<script>
  // ---------------------------------------------------------
  //  Imports
  // ---------------------------------------------------------
  import { _ } from "svelte-i18n";
  import { onDestroy, onMount } from "svelte";
  import { WSOpenOrders } from "store/wsstore.js";
  import {
    online,
    assetpair,
    assetpairs,
    openordersdata,
  } from "store/store.js";
  import UserData from "classes/UserData.js";
  import formatDate from "utils/formatDate.js";
  import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
  import LinearProgress from "@smui/linear-progress";
  import Paper, { Title, Content } from "@smui/paper";
  import SnackBar from "components/SnackBar.svelte";

  // ---------------------------------------------------------
  //  Props
  // ---------------------------------------------------------
  let error = false,
    isLoading = true,
    unsubscribe;

  let snackBarText = "",
    snackBarShow = false;

  // ---------------------------------------------------------
  //  Methods Declarations
  // ---------------------------------------------------------
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
          if (
            Object.prototype.hasOwnProperty.call(
              datas[index][order_id],
              "opentm"
            )
          ) {
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
          if (
            !Object.prototype.hasOwnProperty.call(
              datas[index][order_id],
              "status"
            )
          ) {
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
   * GetOpenOrders
   *********************/
  const GetOpenOrders = async () => {
    try {
      if (!$online) {
        error = true;
        isLoading = false;
        return false;
      }

      if (typeof $assetpair.altname === "undefined") {
        error = $_("account.openOrders.getOpenOrders.error");
        isLoading = false;
        return false;
      }

      const ud = new UserData();
      const res = await ud.getOpenOrders({ trade: true });
      if (
        typeof res !== "undefined" &&
        Object.prototype.hasOwnProperty.call(res, "error")
      ) {
        snackBarShow = true;
        snackBarText = `<strong>[KRAKEN API]</strong> ${res.endpoint}: ${res.message}`;

        error = res.error;
        setTimeout(() => {
          GetOpenOrders();
        }, res.timeout);
        isLoading = false;
      } else {
        if (
          typeof res !== "undefined" &&
          Object.prototype.hasOwnProperty.call(res, "open")
        ) {
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
        isLoading = false;
      }
    } catch (error) {
      console.error("[ERROR]:", error);
    }
  };

  /**
   * onDestroy
   *********************/
  onMount(() => {
    GetOpenOrders();
  });

  /**
   * onDestroy
   *********************/
  onMount(() => {
    unsubscribe;
  });

  /**
   * WSOpenOrders
   *********************/
  $: if ($WSOpenOrders) checkStatusDatas($WSOpenOrders);

  // Si aucune données n'existe on appel
  // l'api REST pour récupérer les datas
  $: isLoading = !!$openordersdata;
</script>

<SnackBar showSnackbar={snackBarShow} text={snackBarText} />
<div class="block open-orders">
  <!-- {#if error && typeof error !== "boolean"}
    <Paper color="primary" variant="outlined" class="mdc-theme--primary" square>
      <Content>
        {error}
      </Content>
    </Paper>
  {/if} -->
  <DataTable
    table$aria-label={$_("account.openOrders.dataLabel")}
    style="width: 100%;"
    class="open-orders"
  >
    <LinearProgress indeterminate bind:closed={isLoading} slot="progress" />
    <Head>
      <Row>
        <Cell>{$_("account.openOrders.type")}</Cell>
        <Cell>{$_("account.openOrders.date")}</Cell>
        <Cell>{$_("account.openOrders.pair")}</Cell>
        <Cell>{$_("account.openOrders.price")}</Cell>
        <Cell>{$_("account.openOrders.volume")}</Cell>
        <Cell>{$_("account.openOrders.cost")}</Cell>
        <Cell>{$_("account.openOrders.statut")}</Cell>
      </Row>
    </Head>
    <Body>
      {#if $openordersdata && $openordersdata.length > 0}
        {#each $openordersdata as el, i}
          <Row id={Object.keys(el)}>
            <Cell
              style="padding:0;width:13%;"
              data-label={$_("account.openOrders.type")}
            >
              <div class={el[Object.keys(el)]["descr"]["type"]}>
                {#if el[Object.keys(el)]["descr"]["type"] === "buy"}
                  {$_("account.openOrders.buy")}
                {:else}
                  {$_("account.openOrders.sell")}
                {/if}
              </div>
            </Cell>
            <Cell style="width:10%" data-label={$_("account.openOrders.date")}>
              <div>{formatDate(el[Object.keys(el)]["opentm"], "D")}</div>
              <span class="hour">
                ({formatDate(el[Object.keys(el)]["opentm"], "H")})
              </span>
            </Cell>
            <Cell data-label={$_("account.openOrders.pair")}>
              <span class="currency">
                {el[Object.keys(el)]["descr"]["pair"]}
              </span>
            </Cell>
            <Cell data-label={$_("account.openOrders.price")}>
              <span>
                {el[Object.keys(el)]["descr"]["price"]}
                <span class="currency">
                  {el[Object.keys(el)]["descr"]["pair"].split("/")[1]}
                </span>
              </span>
            </Cell>
            <Cell data-label={$_("account.openOrders.volume")}>
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
            </Cell>
            <Cell data-label={$_("account.openOrders.cost")}>
              {el[Object.keys(el)]["cost"]}
            </Cell>
            <Cell
              style="width:5%;padding-right: 0;"
              data-label={$_("account.openOrders.statut")}
            >
              <span class="badge">
                {el[Object.keys(el)]["status"]}
              </span>
            </Cell>
          </Row>
        {/each}
      {/if}
    </Body>
  </DataTable>
</div>

<style>
  .open-orders .hour {
    font-size: 0.8em;
    color: #858585;
  }
  .open-orders .buy {
    border-left: 3px solid rgb(83 104 50);
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid rgb(37 46 24);
    background: #242424;
    padding: 15px;
  }
  .open-orders .sell {
    border-left: 3px solid #8d2525;
    border-right: 1px solid #1c1c1c;
    border-bottom: 1px solid #3e2626;
    background: #242424;
    padding: 15px;
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
    padding: 15px;
    color: rgb(141, 199, 54);
    background-color: #283826;
    border: 1px dotted #1e1e1e;
    text-transform: capitalize;
    display: block;
    min-width: 100px;
    text-align: center;
  }
  .open-orders .actions {
    cursor: pointer;
    text-align: center;
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

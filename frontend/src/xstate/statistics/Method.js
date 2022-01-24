import { produce, original, current } from 'immer'
import { exportcsv } from "store/store.js";
import UserData from "classes/UserData.js";
const ud = new UserData();

/**
 * Method FetchExport
 * @description Lis le fichier export passé en paramètre
 * @param { Object } ctx Context
 * @param { Object } event Evenement
 * @returns Renvoie un objet contenant les données au format JSON
 */
export const FetchExport = async (ctx, event) => {

  try {
    let store;
    exportcsv.subscribe((ex) => store = ex)

    let read = []

    for (const type of Object.keys(store)) {

      let id = store[type]
      const res = await ud.readExport({ id, type });

      if (typeof res !== 'undefined')
        read[type] = res.reverse()
      else
        console.error(res)
    }

    return read
  } catch (error) {
    console.error(error);
  }
}

/**
 * Method formatChartData
 * Traitement des données pour l'affichage des charts
 * @param { Object } datas 
 * @returns Renvoie un objet contenant les données formatées
 */
const formatChartData = (datas) => {
  const backgroundColor = ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1", "#4D5360", "#AC64AD",];
  const hoverBackgroundColor = ["#FF5A5E", "#5AD3D1", "#FFC870", "#A8B3C5", "#616774", "#DA92DB",];
  let chartData = {}
  let dataSets = {
    labels: [],
    datasets: [{ data: [], backgroundColor, hoverBackgroundColor }]
  }

  datas.ledgers.map(val => {
    let type = Object.keys(val)[0]
    if (!chartData.hasOwnProperty(type))
      chartData[type] = dataSets
  })

  return produce(chartData, draft => {
    datas.ledgers.map(val => {
      let type = Object.keys(val)[0]
      draft[type]['labels'] = Object.keys(val[type]['amount'])

      if (type !== 'rollover')
        draft[type]['datasets']['0']['data'] = Object.values(val[type]['amount']).map(v => parseFloat(v))
      else
        draft[type]['datasets']['0']['data'] = Object.values(val[type]['fee']).map(v => parseFloat(v))
    })
  });
}

/**
 * Method ProcessingData
 * Traitement des données
 * @param { Object } ctx 
 * @param { Object } event 
 * @returns Renvoie un objet contenant les données 
 * @todo Voir le traitement et l'affichage des graphiques de trades
 * après traitement au format JSON
 */
export const ProcessingData = async (ctx, _event) => {

  let { ledgers, trades } = ctx;

  let type;

  let dataformat = {
    ledgers: [
      { deposit: { amount: [], fee: [] } },
      { rollover: { amount: [], fee: [] } },
      { staking: { amount: [], fee: [] } },
      { margin: { amount: [], fee: [] } },
      { receive: { amount: [], fee: [] } },
      { spend: { amount: [], fee: [] } },
      { trade: { amount: [], fee: [] } },
      { transfer: { amount: [], fee: [] } },
      { withdrawal: { amount: [], fee: [] } }
    ],
    trades: trades
  }

  try {

    for (const ledg of ledgers) {

      type = ledg.type
      dataformat.ledgers.findIndex((index, i) => {

        if (Object.keys(index)[0] === type) {

          if (!dataformat.ledgers[i][type]['amount'].hasOwnProperty(ledg.asset))
            dataformat.ledgers[i][type]['amount'][ledg.asset] = 0

          if (!dataformat.ledgers[i][type]['fee'].hasOwnProperty(ledg.asset))
            dataformat.ledgers[i][type]['fee'][ledg.asset] = 0

          if (ledg.txid !== '') {
            dataformat.ledgers[i][type]['amount'][ledg.asset] =
              !dataformat.ledgers[i][type]['amount'][ledg.asset]
                ? parseFloat(ledg.amount).toFixed(10)
                : parseFloat(
                  parseFloat(dataformat.ledgers[i][type]['amount'][ledg.asset]) +
                  parseFloat(ledg.amount)
                ).toFixed(10);

            dataformat.ledgers[i][type]['fee'][ledg.asset] =
              !dataformat.ledgers[i][type]['fee'][ledg.asset]
                ? parseFloat(ledg.fee).toFixed(10)
                : parseFloat(
                  parseFloat(dataformat.ledgers[i][type]['fee'][ledg.asset]) +
                  parseFloat(ledg.fee)
                ).toFixed(10);
          }
        }

      })

    } // End for

    let chartDatas = formatChartData(dataformat);

    return { dataformat, chartDatas }

  } catch (error) {
    console.error(error);
  }
}
import { produce } from 'immer' // produce, original, current
import { exportcsv } from 'store/store.js'
import { User } from 'store/userStore.js'
import UserData from 'classes/UserData.js'
const ud = new UserData()

let userId
User.subscribe((user) => (userId = user.id))

/**
 * Method FetchExport
 * @description Lis le fichier export passé en paramètre
 * @param { Object } ctx Context
 * @param { Object } event Evenement
 * @returns Renvoie un objet contenant les données au format JSON
 */
export const FetchExport = async (ctx, event) => {
  try {
    let store
    exportcsv.subscribe((ex) => (store = ex))

    const read = []

    for (const type of Object.keys(store)) {
      const id = store[type]
      const res = await ud.readExport({ id, type, userId })

      if (typeof res !== 'undefined' && res) read[type] = res.reverse()
      else return false
    }

    return read
  } catch (error) {
    console.error(error)
  }
}

/**
 * Method formatChartData
 * Traitement des données pour l'affichage des charts
 * @param { Object } datas
 * @returns Renvoie un objet contenant les données formatées
 */
const formatChartData = (datas) => {
  const backgroundColor = [
    '#F7464A',
    '#46BFBD',
    '#FDB45C',
    '#949FB1',
    '#4D5360',
    '#AC64AD'
  ]
  const hoverBackgroundColor = [
    '#FF5A5E',
    '#5AD3D1',
    '#FFC870',
    '#A8B3C5',
    '#616774',
    '#DA92DB'
  ]
  const chartData = {}
  const dataSets = {
    labels: [],
    datasets: [{ data: [], backgroundColor, hoverBackgroundColor }]
  }

  datas.ledgers.map((val) => {
    const type = Object.keys(val)[0]
    if (!Object.prototype.hasOwnProperty.call(chartData, type)) {
      chartData[type] = dataSets
    }

    return true
  })

  return produce(chartData, (draft) => {
    datas.ledgers.map((val) => {
      const type = Object.keys(val)[0]
      draft[type].labels = Object.keys(val[type].amount)

      if (type !== 'rollover') {
        draft[type].datasets['0'].data = Object.values(val[type].amount).map(
          (v) => parseFloat(v)
        )
      } else {
        draft[type].datasets['0'].data = Object.values(val[type].fee).map((v) =>
          parseFloat(v)
        )
      }

      return true
    })
  })
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
  const { ledgers, trades } = ctx

  if (!ledgers || !trades) return { dataformat: [], chartDatas: [] }

  let type

  const dataformat = {
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
          if (
            !Object.prototype.hasOwnProperty.call(
              dataformat.ledgers[i][type].amount,
              ledg.asset
            )
          ) {
            dataformat.ledgers[i][type].amount[ledg.asset] = 0
          }

          if (
            !Object.prototype.hasOwnProperty.call(
              dataformat.ledgers[i][type].fee,
              ledg.asset
            )
          ) {
            dataformat.ledgers[i][type].fee[ledg.asset] = 0
          }

          if (ledg.txid !== '') {
            dataformat.ledgers[i][type].amount[ledg.asset] = !dataformat
              .ledgers[i][type].amount[ledg.asset]
              ? parseFloat(ledg.amount).toFixed(10)
              : parseFloat(
                parseFloat(dataformat.ledgers[i][type].amount[ledg.asset]) +
                    parseFloat(ledg.amount)
              ).toFixed(10)

            dataformat.ledgers[i][type].fee[ledg.asset] = !dataformat.ledgers[
              i
            ][type].fee[ledg.asset]
              ? parseFloat(ledg.fee).toFixed(10)
              : parseFloat(
                parseFloat(dataformat.ledgers[i][type].fee[ledg.asset]) +
                    parseFloat(ledg.fee)
              ).toFixed(10)
          }
        }

        return true
      })
    } // End for

    const chartDatas = formatChartData(dataformat)

    return { dataformat, chartDatas }
  } catch (error) {
    console.error(error)
  }
}

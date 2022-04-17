import { maxratecount, maxratecountData } from 'store/store.js'

const rateBasic = {
  60: { max_counter: 15, decayrate: '0.33' },
  125: { max_counter: 20, decayrate: '0.5' },
  180: { max_counter: 20, decayrate: '1' }
}

const rateAccounts = {
  60: { decayrate: '1' },
  125: { decayrate: '2.34' },
  180: { decayrate: '3.75' }
}

const rateParams = {
  two: ['ledgers', 'trades', 'tradehistory'],
  CancelOrder: { 5: 8, 10: 6, 15: 5, 45: 4, 90: 2, 300: 1 }
}

const getRateInfo = () => {
  let maxRatecount, maxRatecountData
  maxratecount.subscribe((v) => (maxRatecount = v))
  maxratecountData.subscribe((v) => (maxRatecountData = v))
  const rateTimePerSec =
    maxRatecount / rateAccounts[maxRatecount].decayrate / maxRatecount
  return {
    maxRatecountData: maxRatecountData,
    maxRatecount: rateAccounts[maxRatecount],
    rateTimePerSec,
    params: rateParams
  }
}

const getRateInfoBasic = () => {
  let maxRatecount, maxRatecountData
  maxratecount.subscribe((v) => (maxRatecount = v))
  maxratecountData.subscribe((v) => (maxRatecountData = v))
  const decayratePerSec = rateBasic[maxRatecount].decayrate
  if (typeof maxRatecountData === 'string') {
    maxRatecountData = JSON.parse(maxRatecountData)
  }
  return {
    maxRatecountData: maxRatecountData,
    decayratePerSec,
    maxRatecount: rateBasic[maxRatecount].max_counter,
    params: rateParams
  }
}

const checkRateCount = (endpoint, now) => {
  now = typeof now === 'undefined' ? Date.now() : now
  let end = null
  let diffTimeEnd = null
  let rateMoreCount
  let countCurrent = 0
  // let rate_account = getRateInfo()
  const rateBasic = getRateInfoBasic()

  let maxRatecount
  maxratecount.subscribe((v) => (maxRatecount = v))

  const two = rateParams.two.includes(endpoint)

  if (rateBasic.maxRatecountData.rate_count.count >= 20) {
    console.error(
      `[${rateBasic.maxRatecountData.rate_count.count}] La limite d'appel autorisé est atteinte!`
    )
  }

  if (two) {
    rateBasic.maxRatecountData.rate_count.count =
      rateBasic.maxRatecountData.rate_count.count + 2
    countCurrent = 2
  } else {
    rateBasic.maxRatecountData.rate_count.count++
    countCurrent = 1
  }

  if (rateBasic.maxRatecountData.rate_count.ratecount_end !== null) {
    end = rateBasic.maxRatecountData.rate_count.ratecount_end
    if (end < now) {
      end = now
      rateBasic.maxRatecountData.rate_count.count = countCurrent
    } else {
      end = now + (now - end)
    }
    // end = (end < now) ? now : now + (now - end);
    end =
      parseInt((countCurrent / rateBasic.decayratePerSec) * 1000) + (now - end)
    end = parseInt(now + end)
    diffTimeEnd = end - now
  } else {
    end = parseInt((countCurrent / rateBasic.decayratePerSec) * 1000)
    end = parseInt(now + end)
    diffTimeEnd = end - now
  }

  rateMoreCount = (diffTimeEnd / 1000).toFixed(2)

  const setData = {
    rate_count: {
      count: rateBasic.maxRatecountData.rate_count.count,
      count_total: rateBasic.maxRatecountData.rate_count.count_total,
      timestamp: now,
      ratecount_end: end,
      max_counter: rateBasic.maxRatecount
    }
  }

  maxratecountData.set(setData)

  if (
    rateBasic.maxRatecountData.rate_count.count > rateBasic.maxRatecount &&
    diffTimeEnd > 0
  ) {
    // console.error(rateBasic.maxRatecountData.rate_count.count, 'Rate time limite excedeed !!! more : ' + rateMoreCount + "s")
    return false
  }

  // console.log(rateBasic.maxRatecountData.rate_count.count, 'No rate limite, more : ' + rateMoreCount + "s")

  return setData
}

// const checkRateCount = (endpoint) => {

//   console.log('checkRateCount', endpoint)
//   let now = Date.now()
//   let end = null;
//   let diffTimeEnd = null;
//   let rateMoreCount;
//   let rate = getRateInfo()

//   // console.log('End Point : ', this.endpoint)
//   // console.log('now:', now)
//   // console.log('end avant vérification du timestamp:', rate.maxRatecountData.ratecount_end)
//   if (rate.maxRatecountData.ratecount_end !== null) {
//     // console.log('ratecount_end est pas null')
//     end = rate.maxRatecountData.ratecount_end
//     end = (now > end) ? now : end;
//     end = parseInt(end + rate.rateTimePerSec * 1000)
//     diffTimeEnd = end - now;
//   }
//   else {
//     // console.log('ratecount_end est null')
//     end = parseInt(now + rate.rateTimePerSec * 1000)
//     diffTimeEnd = end - now;
//   }
//   // console.log('Temps diff:', end - now)
//   // console.log('end modifié', parseInt(end + rate.rateTimePerSec * 1000))

//   rateMoreCount = (diffTimeEnd / (rate.rateTimePerSec * 1000)).toFixed(1)
//   // console.log('Count restant', rateMoreCount)

//   if (typeof rate.maxRatecountData.rate_count !== 'undefined') {
//     if (rate.params.two.includes(endpoint)) {
//       // console.log('Coute 2 points', rate.params.two.includes(this.endpoint))
//       rate.maxRatecountData.rate_count.count = rate.maxRatecountData.rate_count.count + 2
//     }
//     else {
//       // console.log('Coute 1 points', rate.params.two.includes(this.endpoint))
//       rate.maxRatecountData.rate_count.count++
//     }

//     rate.maxRatecountData.rate_count.count = rateMoreCount - rate.maxRatecountData.rate_count.count
//     if (rate.maxRatecountData.rate_count.count <= 0)
//       rate.maxRatecountData.rate_count.count = 0

//     // console.log('Count:', rate.maxRatecountData.rate_count.count)

//     rate.maxRatecountData.rate_count.count_total++

//     maxratecountData.set({
//       rate_count: { count: rate.maxRatecountData.rate_count.count, count_total: rate.maxRatecountData.rate_count.count_total, timestamp: now },
//       ratecount_end: end
//     })

//     if (rate.maxRatecountData.rate_count.count > rate.maxRatecount)
//       return false;
//     return true
//   }

//   return false
// }

export default checkRateCount

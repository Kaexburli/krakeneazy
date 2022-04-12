import { maxratecount, maxratecount_data } from "store/store.js"

const rate_basic = {
  60: { max_counter: 15, decayrate: '0.33' },
  125: { max_counter: 20, decayrate: '0.5' },
  180: { max_counter: 20, decayrate: '1' }
};

const rate_accounts = {
  60: { decayrate: '1' },
  125: { decayrate: '2.34' },
  180: { decayrate: '3.75' }
};

const rate_params = {
  two: ['ledgers', 'trades', 'tradehistory'],
  CancelOrder: { '5': 8, '10': 6, '15': 5, '45': 4, '90': 2, '300': 1 }
};

const getRateInfo = () => {
  let max_ratecount, max_ratecount_data;
  maxratecount.subscribe((v) => max_ratecount = v);
  maxratecount_data.subscribe((v) => max_ratecount_data = v);
  let rate_time_per_sec = (max_ratecount / rate_accounts[max_ratecount].decayrate / max_ratecount);
  return {
    max_ratecount_data: max_ratecount_data,
    max_ratecount: rate_accounts[max_ratecount],
    rate_time_per_sec,
    max_ratecount,
    params: rate_params
  }
}

const getRateInfoBasic = () => {
  let max_ratecount, max_ratecount_data;
  maxratecount.subscribe((v) => max_ratecount = v);
  maxratecount_data.subscribe((v) => max_ratecount_data = v);
  let decayrate_per_sec = rate_basic[max_ratecount].decayrate;
  if (typeof max_ratecount_data === "string") max_ratecount_data = JSON.parse(max_ratecount_data)
  return {
    max_ratecount_data: max_ratecount_data,
    decayrate_per_sec,
    max_ratecount: rate_basic[max_ratecount].max_counter,
    params: rate_params
  }
}
let count = 0;
const checkRateCount = (endpoint, now) => {

  now = (typeof now === 'undefined') ? Date.now() : now
  let end = null;
  let diff_time_end = null;
  let rate_more_count;
  let count_current = 0;
  // let rate_account = getRateInfo()
  let rate_basic = getRateInfoBasic();

  let max_ratecount;
  maxratecount.subscribe((v) => max_ratecount = v);

  let two = rate_params.two.includes(endpoint);

  if (rate_basic.max_ratecount_data.rate_count.count >= 20)
    console.error(`[${rate_basic.max_ratecount_data.rate_count.count}] La limite d'appel autorisé est atteinte!`)

  if (two) {
    rate_basic.max_ratecount_data.rate_count.count = rate_basic.max_ratecount_data.rate_count.count + 2;
    count_current = 2
  } else {
    rate_basic.max_ratecount_data.rate_count.count++
    count_current = 1
  }

  if (rate_basic.max_ratecount_data.rate_count.ratecount_end !== null) {
    end = rate_basic.max_ratecount_data.rate_count.ratecount_end
    if (end < now) {
      end = now
      rate_basic.max_ratecount_data.rate_count.count = count_current
    }
    else {
      end = now + (now - end)
    }
    // end = (end < now) ? now : now + (now - end);
    end = parseInt(count_current / rate_basic.decayrate_per_sec * 1000) + (now - end)
    end = parseInt(now + end)
    diff_time_end = end - now;
  }
  else {
    end = parseInt(count_current / rate_basic.decayrate_per_sec * 1000)
    end = parseInt(now + end)
    diff_time_end = end - now;
  }

  rate_more_count = (diff_time_end / 1000).toFixed(2)

  const setData = {
    rate_count: {
      count: rate_basic.max_ratecount_data.rate_count.count,
      count_total: rate_basic.max_ratecount_data.rate_count.count_total,
      timestamp: now,
      ratecount_end: end,
      max_counter: rate_basic.max_ratecount
    }
  }

  maxratecount_data.set(setData)

  if (
    rate_basic.max_ratecount_data.rate_count.count > rate_basic.max_ratecount &&
    diff_time_end > 0
  ) {
    // console.error(rate_basic.max_ratecount_data.rate_count.count, 'Rate time limite excedeed !!! more : ' + rate_more_count + "s")
    return false
  }

  // console.log(rate_basic.max_ratecount_data.rate_count.count, 'No rate limite, more : ' + rate_more_count + "s")

  return setData
}

// const checkRateCount = (endpoint) => {

//   console.log('checkRateCount', endpoint)
//   let now = Date.now()
//   let end = null;
//   let diff_time_end = null;
//   let rate_more_count;
//   let rate = getRateInfo()

//   // console.log('End Point : ', this.endpoint)
//   // console.log('now:', now)
//   // console.log('end avant vérification du timestamp:', rate.max_ratecount_data.ratecount_end)
//   if (rate.max_ratecount_data.ratecount_end !== null) {
//     // console.log('ratecount_end est pas null')
//     end = rate.max_ratecount_data.ratecount_end
//     end = (now > end) ? now : end;
//     end = parseInt(end + rate.rate_time_per_sec * 1000)
//     diff_time_end = end - now;
//   }
//   else {
//     // console.log('ratecount_end est null')
//     end = parseInt(now + rate.rate_time_per_sec * 1000)
//     diff_time_end = end - now;
//   }
//   // console.log('Temps diff:', end - now)
//   // console.log('end modifié', parseInt(end + rate.rate_time_per_sec * 1000))

//   rate_more_count = (diff_time_end / (rate.rate_time_per_sec * 1000)).toFixed(1)
//   // console.log('Count restant', rate_more_count)

//   if (typeof rate.max_ratecount_data.rate_count !== 'undefined') {
//     if (rate.params.two.includes(endpoint)) {
//       // console.log('Coute 2 points', rate.params.two.includes(this.endpoint))
//       rate.max_ratecount_data.rate_count.count = rate.max_ratecount_data.rate_count.count + 2
//     }
//     else {
//       // console.log('Coute 1 points', rate.params.two.includes(this.endpoint))
//       rate.max_ratecount_data.rate_count.count++
//     }

//     rate.max_ratecount_data.rate_count.count = rate_more_count - rate.max_ratecount_data.rate_count.count
//     if (rate.max_ratecount_data.rate_count.count <= 0)
//       rate.max_ratecount_data.rate_count.count = 0

//     // console.log('Count:', rate.max_ratecount_data.rate_count.count)

//     rate.max_ratecount_data.rate_count.count_total++

//     maxratecount_data.set({
//       rate_count: { count: rate.max_ratecount_data.rate_count.count, count_total: rate.max_ratecount_data.rate_count.count_total, timestamp: now },
//       ratecount_end: end
//     })

//     if (rate.max_ratecount_data.rate_count.count > rate.max_ratecount)
//       return false;
//     return true
//   }

//   return false
// }

export default checkRateCount
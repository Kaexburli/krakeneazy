import { assetsFees } from "components/pages/trading/margin_fees_kraken.js";

const breakeven_percent_price = 0.2905

const tradeCalcul = async (p) => {
  if (p.type === 'buy')
    return buyTradeCal(p)
  else if (p.type === 'sell')
    return sellTradeCal(p)
  else
    return false
}

const buyTradeCal = (p) => {
  let response = {}

  const pairs = p.assetPair
  const decimal = pairs.pair_decimals
  response.decimal = decimal

  // Calcul du prix de revente LONG
  response.take_profit = {}
  response.breakeven = {}
  response.stoploss = {}
  response.take_profit.price = Number(Number(p.price) + Number(p.price * (p.profit_percent_price / 100))).toFixed(decimal)
  response.take_profit.price_total = Number(Number(response.take_profit.price) * Number(p.volume)).toFixed(decimal)
  response.breakeven.price = Number(Number(p.price) + Number(p.price * (breakeven_percent_price / 100))).toFixed(decimal)
  response.breakeven.price_total = Number(Number(response.breakeven.price) * Number(p.volume)).toFixed(decimal)
  response.stoploss.price = Number(Number(p.price) - Number(p.price * p.stoploss_percent_price)).toFixed(decimal)
  response.stoploss.price_total = Number(Number(response.stoploss.price) * Number(p.volume)).toFixed(decimal)

  // Calcul des frais LONG
  response.fees = {}
  response.fees.first = Number(p.total * ((p.leverage > 0) ? ((p.fees_maker + p.marge_fees) / 100) : p.fees_maker / 100)).toFixed(decimal)

  response.fees.tp = {}
  response.fees.tp.two = Number(response.take_profit.price_total * (p.fees_maker / 100)).toFixed(decimal)
  response.fees.tp.total = Number(Number(response.fees.first) + Number(response.fees.tp.two)).toFixed(decimal)
  response.fees.tp.plusval_percent = Number((Number(response.fees.tp.total) * 100) / p.total).toFixed(decimal)

  response.fees.be = {}
  response.fees.be.two = Number(response.breakeven.price_total * (p.fees_maker / 100)).toFixed(decimal)
  response.fees.be.total = Number(Number(response.fees.first) + Number(response.fees.be.two)).toFixed(decimal)
  response.fees.be.plusval_percent = Number((Number(response.fees.be.total) * 100) / p.total).toFixed(decimal)

  response.fees.sl = {}
  response.fees.sl.two = Number(response.stoploss.price_total * (p.fees_maker / 100)).toFixed(decimal)
  response.fees.sl.total = Number(Number(response.fees.first) + Number(response.fees.sl.two)).toFixed(decimal)
  response.fees.sl.plusval_percent = Number((Number(response.fees.sl.total) * 100) / p.total).toFixed(decimal)

  // Calcul des gains
  response.gain = {}
  response.gain.tp = {}
  response.gain.tp.total = Number(response.take_profit.price_total - p.total).toFixed(decimal)
  response.gain.tp.fees_total = Number(response.gain.tp.total - response.fees.tp.total).toFixed(decimal)
  response.gain.tp.fees_total_percent = ((response.fees.tp.total * 100) / response.gain.tp.total).toFixed(decimal)

  response.gain.be = {}
  response.gain.be.total = Number(response.breakeven.price_total - p.total).toFixed(decimal)
  response.gain.be.fees_total = Number(response.gain.be.total - response.fees.be.total).toFixed(decimal)
  response.gain.be.fees_total_percent = ((response.fees.be.total * 100) / response.gain.be.total).toFixed(decimal)

  response.gain.sl = {}
  response.gain.sl.total = Number(response.stoploss.price_total - p.total).toFixed(decimal)
  response.gain.sl.fees_total = Number(response.gain.sl.total - response.fees.sl.total).toFixed(decimal)
  response.gain.sl.fees_total_percent = ((response.fees.sl.total * 100) / response.gain.sl.total).toFixed(decimal)

  // Calcul des frais de rollover
  response.rollover = {}
  response.rollover.h4 = {}
  response.rollover.h4.cost = Number(p.total * p.marge_fees / 100).toFixed(decimal)
  response.rollover.h4.gain = Number(response.gain.tp.fees_total - response.rollover.h4.cost).toFixed(decimal)

  response.rollover.day = {}
  response.rollover.day.cost = Number(response.rollover.h4.cost * 6).toFixed(decimal)
  response.rollover.day.gain = Number(response.gain.tp.fees_total - response.rollover.day.cost).toFixed(decimal)

  response.rollover.week = {}
  response.rollover.week.cost = Number(response.rollover.day.cost * 7).toFixed(decimal)
  response.rollover.week.gain = Number(response.gain.tp.fees_total - response.rollover.week.cost).toFixed(decimal)

  response.rollover.month = {}
  response.rollover.month.cost = Number(response.rollover.day.cost * daysInMonth()).toFixed(decimal)
  response.rollover.month.gain = Number(response.gain.tp.fees_total - response.rollover.month.cost).toFixed(decimal)

  response.rollover.quarterly = {}
  response.rollover.quarterly.cost = Number(response.rollover.month.cost * 3).toFixed(decimal)
  response.rollover.quarterly.gain = Number(response.gain.tp.fees_total - response.rollover.quarterly.cost).toFixed(decimal)

  response.rollover.semiannual = {}
  response.rollover.semiannual.cost = Number(response.rollover.month.cost * 6).toFixed(decimal)
  response.rollover.semiannual.gain = Number(response.gain.tp.fees_total - response.rollover.semiannual.cost).toFixed(decimal)

  response.rollover.year = {}
  response.rollover.year.cost = Number(response.rollover.day.cost * 365).toFixed(decimal)
  response.rollover.year.gain = Number(response.gain.tp.fees_total - response.rollover.year.cost).toFixed(decimal)

  return response
}

const sellTradeCal = (p) => {
  let response = {}

  const pairs = p.assetPair
  const decimal = pairs.pair_decimals
  response.decimal = decimal

  // Calcul du prix de revente LONG
  response.take_profit = {}
  response.breakeven = {}
  response.stoploss = {}
  response.take_profit.price = Number(Number(p.price) - Number(p.price * (p.profit_percent_price / 100))).toFixed(decimal)
  response.take_profit.price_total = Number(Number(response.take_profit.price) * Number(p.volume)).toFixed(decimal)
  response.breakeven.price = Number(Number(p.price) - (p.price * (breakeven_percent_price / 100))).toFixed(decimal)
  response.breakeven.price_total = Number(Number(response.breakeven.price) * Number(p.volume)).toFixed(decimal)
  response.stoploss.price = Number(Number(p.price) + Number(p.price * p.stoploss_percent_price)).toFixed(decimal)
  response.stoploss.price_total = Number(Number(response.stoploss.price) * Number(p.volume)).toFixed(decimal)

  // Calcul des frais LONG
  response.fees = {}
  response.fees.first = Number(p.total * ((p.leverage > 0) ? ((p.fees_maker + p.marge_fees) / 100) : p.fees_maker / 100)).toFixed(decimal)

  response.fees.tp = {}
  response.fees.tp.two = Number(response.take_profit.price_total * (p.fees_maker / 100)).toFixed(decimal)
  response.fees.tp.total = Number(Number(response.fees.first) + Number(response.fees.tp.two)).toFixed(decimal)
  response.fees.tp.plusval_percent = Number((Number(response.fees.tp.total) * 100) / p.total).toFixed(decimal)

  response.fees.be = {}
  response.fees.be.two = Number(response.breakeven.price_total * (p.fees_maker / 100)).toFixed(decimal)
  response.fees.be.total = Number(Number(response.fees.first) + Number(response.fees.be.two)).toFixed(decimal)
  response.fees.be.plusval_percent = Number((Number(response.fees.be.total) * 100) / p.total).toFixed(decimal)

  response.fees.sl = {}
  response.fees.sl.two = Number(response.stoploss.price_total * (p.fees_maker / 100)).toFixed(decimal)
  response.fees.sl.total = Number(Number(response.fees.first) + Number(response.fees.sl.two)).toFixed(decimal)
  response.fees.sl.plusval_percent = Number((Number(response.fees.sl.total) * 100) / p.total).toFixed(decimal)

  // Calcul des gains
  response.gain = {}
  response.gain.tp = {}
  response.gain.tp.total = Number(p.total - response.take_profit.price_total).toFixed(decimal)
  response.gain.tp.fees_total = Number(response.gain.tp.total - response.fees.tp.total).toFixed(decimal)
  response.gain.tp.fees_total_percent = ((response.fees.tp.total * 100) / response.gain.tp.total).toFixed(decimal)

  response.gain.be = {}
  response.gain.be.total = Number(p.total - response.breakeven.price_total).toFixed(decimal)
  response.gain.be.fees_total = Number(response.gain.be.total - response.fees.be.total).toFixed(decimal)
  response.gain.be.fees_total_percent = ((response.fees.be.total * 100) / response.gain.be.total).toFixed(decimal)

  response.gain.sl = {}
  response.gain.sl.total = Number(p.total - response.stoploss.price_total).toFixed(decimal)
  response.gain.sl.fees_total = Number(response.gain.sl.total - response.fees.sl.total).toFixed(decimal)
  response.gain.sl.fees_total_percent = ((response.fees.sl.total * 100) / response.gain.sl.total).toFixed(decimal)

  // Calcul des frais de rollover
  response.rollover = {}
  response.rollover.h4 = {}
  response.rollover.h4.cost = Number(p.total * p.marge_fees / 100).toFixed(decimal)
  response.rollover.h4.gain = Number(response.gain.tp.fees_total - response.rollover.h4.cost).toFixed(decimal)

  response.rollover.day = {}
  response.rollover.day.cost = Number(response.rollover.h4.cost * 6).toFixed(decimal)
  response.rollover.day.gain = Number(response.gain.tp.fees_total - response.rollover.day.cost).toFixed(decimal)

  response.rollover.week = {}
  response.rollover.week.cost = Number(response.rollover.day.cost * 7).toFixed(decimal)
  response.rollover.week.gain = Number(response.gain.tp.fees_total - response.rollover.week.cost).toFixed(decimal)

  response.rollover.month = {}
  response.rollover.month.cost = Number(response.rollover.day.cost * daysInMonth()).toFixed(decimal)
  response.rollover.month.gain = Number(response.gain.tp.fees_total - response.rollover.month.cost).toFixed(decimal)

  response.rollover.quarterly = {}
  response.rollover.quarterly.cost = Number(response.rollover.month.cost * 3).toFixed(decimal)
  response.rollover.quarterly.gain = Number(response.gain.tp.fees_total - response.rollover.quarterly.cost).toFixed(decimal)

  response.rollover.semiannual = {}
  response.rollover.semiannual.cost = Number(response.rollover.month.cost * 6).toFixed(decimal)
  response.rollover.semiannual.gain = Number(response.gain.tp.fees_total - response.rollover.semiannual.cost).toFixed(decimal)

  response.rollover.year = {}
  response.rollover.year.cost = Number(response.rollover.day.cost * 365).toFixed(decimal)
  response.rollover.year.gain = Number(response.gain.tp.fees_total - response.rollover.year.cost).toFixed(decimal)

  return response
}

const daysInMonth = () => {
  const d = new Date();
  let month = d.getMonth();
  let year = d.getFullYear();;
  return new Date(year, month + 1, 0).getDate();
}

/**
 * getKrakenFees
 * Récupère le taux de frais pour la pair d'asset
 ************************/
const getKrakenFees = async (taker, maker, wsname, altname, ud) => {

  let taker_fees = 0
  let maker_fees = 0
  let marge_fees = 0;
  let rollover_fees = 0

  let pair = wsname.split('/');
  let base = pair[0];
  let quote = pair[1];
  pair = assetsFees.hasOwnProperty(base) ? assetsFees[base] : false;

  if (pair.hasOwnProperty('quote') && pair.quote.includes(quote)) {
    marge_fees = Number(pair.percent);
    rollover_fees = Number(pair.rollover);
  }

  try {

    const tradeVolume = await ud.getTradeVolume({ pair: altname })
    for (const [_k, v] of Object.entries(maker))
      if (tradeVolume.volume > v[0])
        maker_fees = v[1];

    for (const [_k, v] of Object.entries(taker))
      if (tradeVolume.volume > v[0])
        taker_fees = v[1];

    return {
      'taker_fees': taker_fees,
      'maker_fees': maker_fees,
      'marge_fees': marge_fees,
      'rollover_fees': rollover_fees
    }


  } catch (error) {
    console.error(error)
  }
}

/**
 * getFees
 ************************/
const getFees = async (pairs, ud) => {
  return await getKrakenFees(
    pairs.fees,
    pairs.fees_maker,
    pairs.wsname,
    pairs.altname,
    ud
  );
};

export const getSummuryInfos = async (calculator, ud) => {
  const f = await getFees(calculator.assetPair, ud);
  calculator.total = Number(calculator.volume * calculator.price).toFixed(
    calculator.assetPair.lot_decimals
  );
  calculator.taker_fees = f.taker_fees;
  calculator.fees_maker = f.maker_fees;
  calculator.marge_fees = f.marge_fees;
  calculator.rollover_fees = f.rollover_fees;
  const t = await tradeCalcul(calculator);
  calculator.trade = t;

  return calculator
}
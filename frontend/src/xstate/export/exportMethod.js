import UserData from "classes/UserData.js";
import { exportcsv } from "store/store.js";

/**
 * Method StatusExport
 */
export const StatusExport = async (type, id) => {
  try {
    const ud = new UserData();
    const res = await ud.statusExport({
      report: type,
    });

    if (typeof res === "undefined") {
      console.error('Le tableau est vide!')
    }

    if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
      console.error(res.error)
    }

    if (typeof id !== 'undefined') {
      return res.filter((v) => v.id === id)
    }

    return res;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Method AddExport
 */
export const AddExport = async (type, starttm) => {
  try {
    let report = typeof type !== undefined && ["ledgers", "trades"].includes(type) ? type : "ledgers";
    starttm = starttm === undefined ? "1325376000" /** 1er Janvier 2012 */ : starttm;

    const ud = new UserData();
    const res = await ud.addExport({
      report: report,
      description: "walltrade",
      starttm: starttm,
    });

    if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
      console.error(res.error);
      return false;
    }

    return { id: res.id };
  } catch (error) {
    console.error(error);
  }
};

/**
 * Method RetreiveExport
 */
export const RetreiveExport = async (id, type) => {
  try {
    const ud = new UserData();
    const res = await ud.retrieveExport({ id, type });
    if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
      console.error(res.error);
      return false;
    }
    exportcsv.update((v) => {
      v[type] = id;
      return v
    })
    return res;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Method RemoveExport
 */
export const RemoveExport = async (ids) => {
  try {
    const ud = new UserData();
    const res = await ud.removeOldFile(ids);
    return res;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Method CheckExportExistFolder
 */
const CheckExportExistFolder = async (id) => {
  try {
    const ud = new UserData();
    return await ud.checkExportExist(id);
  } catch (error) {
    console.error(error);
  }
};

/**
   * Method checkTimeExpired
   * Renvoie true si l'export est expiré
   */
const checkTimeExpired = (completedtm, id) => {
  const expire_time = 3600000; // 3600000 // A changer selon le compte
  const time_remaining = parseInt(Date.now() - parseInt(completedtm * 1000));
  const remaining = expire_time - time_remaining
  const check = (remaining <= 0)
  return check;
};

/**
 * Method getListExport
 */
export const getListExport = async (ctx, event) => {

  const ledgers = await StatusExport('ledgers')
  const trades = await StatusExport('trades')

  if (
    typeof ledgers === 'undefined' &&
    !ledgers.length &&
    typeof trades === 'undefined' &&
    !trades.length
  )
    return false

  // /** LEDGERS */
  const datasLedgers = ledgers.filter((ledg_v) => (
    ledg_v.report === 'ledgers' &&
    ledg_v.descr === 'walltrade'
  ));

  /** Gestion des export expiré|supprimé|annulé|en erreur| flags != 0 */
  let expiredLedgerIds = []
  const datasLedgersNoDeletedNoQueued = ledgers.filter((ledg_v) => (
    !ledg_v.hasOwnProperty('delete') &&
    ledg_v.status !== "Queued"
  ));
  for (const ledg_v of datasLedgersNoDeletedNoQueued) {
    const checkFolder = await CheckExportExistFolder(ledg_v.id);
    if (
      !checkFolder ||
      checkTimeExpired(ledg_v.completedtm, ledg_v.id) ||
      ledg_v.hasOwnProperty('cancel') ||
      ledg_v.flags !== '0'
    ) {
      if (!ctx.expired.includes(ledg_v.id))
        expiredLedgerIds.push(ledg_v.id)
    }
  }
  if (expiredLedgerIds.length !== 0) {
    return {
      callback: {
        type: "EXPIRED",
        data: { ids: expiredLedgerIds }
      }
    }
  }

  const datasLedgersQueued = datasLedgers.filter(ledg_v => (
    ledg_v.flags === '0' &&
    !ledg_v.hasOwnProperty('error') &&
    !ledg_v.hasOwnProperty('cancel') &&
    !ledg_v.hasOwnProperty('delete') &&
    ledg_v.status === "Queued"
  ))

  const datasLedgersProcessed = datasLedgers.filter(ledg_v => (
    ledg_v.flags === '0' &&
    ledg_v.status === "Processed" &&
    !ledg_v.hasOwnProperty('error') &&
    !ledg_v.hasOwnProperty('cancel') &&
    !ledg_v.hasOwnProperty('delete') &&
    !checkTimeExpired(ledg_v.completedtm, ledg_v.id)
  ))

  // Si queue existant on renvoie vers QUEUED
  if (datasLedgersQueued.length >= 1) {
    return {
      callback: {
        type: "QUEUED",
        data: {
          type: 'ledgers',
          id: datasLedgersQueued[0]['id']
        }
      }
    }
  }
  else {
    // Si un export valide existe update dans exportcsv ledgers
    if (datasLedgersProcessed.length === 1) {
      exportcsv.update((val) => {
        val.ledgers = datasLedgersProcessed[0]['id']
        return val
      })
    }
    else {
      // Update exportcsv ledgers à false
      exportcsv.update((val) => {
        val.ledgers = false;
        return val
      })
      // Si aucun export valide on ADD
      return {
        callback: {
          type: "ADD",
          data: { type: 'ledgers' }
        }
      }
    }
  }

  // /** TRADES */
  const datasTrades = trades.filter((trad_v) => (
    trad_v.report === 'trades' &&
    trad_v.descr === 'walltrade'
  ));

  /** Gestion des export expiré|supprimé|annulé|en erreur| flags != 0 */
  let expiredTradeIds = []
  const datasTradesNoDeletedNoQueued = ledgers.filter((trad_v) => (
    !trad_v.hasOwnProperty('delete') &&
    trad_v.status !== "Queued"
  ));
  for (const trad_v of datasTradesNoDeletedNoQueued) {
    const checkFolder = await CheckExportExistFolder(trad_v.id);
    if (
      !checkFolder ||
      checkTimeExpired(trad_v.completedtm, trad_v.id) ||
      trad_v.hasOwnProperty('cancel') ||
      trad_v.flags !== '0'
    ) {
      if (!ctx.expired.includes(trad_v.id))
        expiredTradeIds.push(trad_v.id)
    }
  }
  if (expiredTradeIds.length !== 0) {
    return {
      callback: {
        type: "EXPIRED",
        data: { ids: expiredTradeIds }
      }
    }
  }

  const datasTradesQueued = datasTrades.filter(trad_v => (
    trad_v.flags === '0' &&
    !trad_v.hasOwnProperty('error') &&
    !trad_v.hasOwnProperty('cancel') &&
    !trad_v.hasOwnProperty('delete') &&
    trad_v.status === "Queued"
  ))

  const datasTradesProcessed = datasTrades.filter(trad_v => (
    trad_v.flags === '0' &&
    trad_v.status === "Processed" &&
    !trad_v.hasOwnProperty('error') &&
    !trad_v.hasOwnProperty('cancel') &&
    !trad_v.hasOwnProperty('delete') &&
    !checkTimeExpired(trad_v.completedtm, trad_v.id)
  ))

  // Si queue existant on renvoie vers QUEUED
  if (datasTradesQueued.length >= 1) {
    return {
      callback: {
        type: "QUEUED",
        data: {
          type: 'trades',
          id: datasTradesQueued[0]['id']
        }
      }
    }
  }
  else {
    // Si un export valide existe update dans exportcsv trades
    if (datasTradesProcessed.length === 1) {
      exportcsv.update((val) => {
        val.trades = datasTradesProcessed[0]['id']
        return val
      })
    }
    else {
      // Update exportcsv trades à false
      exportcsv.update((val) => {
        val.trades = false;
        return val
      })
      // Si aucun export valide on ADD
      return {
        callback: {
          type: "ADD",
          data: { type: 'trades' }
        }
      }
    }
  }

  /** Retourne les exports valides */
  return [...datasLedgersProcessed, ...datasTradesProcessed];
};
import UserData from "classes/UserData.js";
import { exportcsv } from "store/store.js";

/**
 * Method StatusExport
 */
export const StatusExport = async (type, id) => {
  // console.log('StatusExport', type, id)
  try {
    const ud = new UserData();
    const res = await ud.statusExport({
      report: type,
    });

    if (typeof res === "undefined") {
      throw new Error('Le tableau est vide!')
    }

    if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
      throw new Error(res.error)
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
export const RemoveExport = async (id) => {
  try {
    const ud = new UserData();
    await ud.removeOldFile(id);
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
   * Method checkRemainingTime
   */
const checkRemainingTime = (completedtm, id) => {
  const expire_time = 3600000 * 2; // 3600000 // A changer selon le compte
  const time_remaining = Date.now() - parseInt(parseInt(parseInt(completedtm) * 1000) + expire_time);
  const remaining = expire_time - time_remaining
  const check = (remaining >= 0)

  if (!check) RemoveExport(id);

  return check;
};

/**
  * Method getListExport
  */
export const getListExport = async () => {

  const ledgers = await StatusExport('ledgers')
  const trades = await StatusExport('trades')

  if (typeof ledgers === 'undefined' && typeof trades === 'undefined')
    return false


  // const ledgersFolderExist = await CheckExportExistFolder(datasLedgers[0]['id'])
  // ledgersFolderExist RemoveExport(id);
  // const tradesFolderExist = await CheckExportExistFolder(datasTrades[0]['id'])
  // tradesFolderExist

  /** LEDGERS */
  // Filtre les exports ledgers en queue
  const datasLedgersQueued = ledgers.filter(ledg_v => (
    ledg_v.report === 'ledgers' &&
    ledg_v.descr === 'walltrade' &&
    ledg_v.flags === '0' &&
    ledg_v.status === "Queued"
  ))
  // Filtre les exports ledgers en processed
  const datasLedgers = ledgers.filter(ledg_v => (
    ledg_v.report === 'ledgers' &&
    ledg_v.descr === 'walltrade' &&
    ledg_v.flags === '0' &&
    ledg_v.status === "Processed" &&
    !ledg_v.hasOwnProperty('error') &&
    !ledg_v.hasOwnProperty('cancel') &&
    !ledg_v.hasOwnProperty('delete') &&
    checkRemainingTime(ledg_v.completedtm, ledg_v.id)
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
    if (datasLedgers.length === 1) {
      exportcsv.update((ledg_v) => {
        ledg_v.ledgers = datasLedgers[0]['id']
        return ledg_v
      })
    }
    else {
      // Update exportcsv ledgers à false
      exportcsv.update((ledg_v) => {
        ledg_v.ledgers = false;
        return ledg_v
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


  // TRADES
  // Filtre les exports trades en queue
  const datasTradesQueued = ledgers.filter(ledg_v => (
    ledg_v.report === 'trades' &&
    ledg_v.descr === 'walltrade' &&
    ledg_v.flags === '0' &&
    ledg_v.status === "Queued"
  ))
  // Filtre les exports trades en processed
  const datasTrades = trades.filter(trad_v => (
    trad_v.report === 'trades' &&
    trad_v.descr === 'walltrade' &&
    trad_v.flags === '0' &&
    trad_v.status === "Processed" &&
    !trad_v.hasOwnProperty('error') &&
    !trad_v.hasOwnProperty('cancel') &&
    !trad_v.hasOwnProperty('delete') &&
    checkRemainingTime(trad_v.completedtm, trad_v.id)
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
    if (datasTrades.length === 1) {
      exportcsv.update((trad_v) => {
        trad_v.trades = datasTrades[0]['id']
        return trad_v
      })
    }
    else {
      // Update exportcsv trades à false
      exportcsv.update((trad_v) => {
        trad_v.trades = false;
        return trad_v
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

  return [...datasLedgers, ...datasTrades];
};
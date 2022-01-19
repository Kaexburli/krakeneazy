import UserData from "classes/UserData.js";
import { exportcsv } from "store/store.js";

/**
 * Method StatusExport
 * Envoie une demande de liste des exports
 * @param { String } type 
 * @param { String } id 
 * @returns Renvoie un objet contenant la liste des export si la 
 * commande est bien executé et false ou un objet { error: res.error } en cas d'erreur
 */
export const StatusExport = async (type, id) => {
  try {
    const ud = new UserData();
    const res = await ud.statusExport({
      report: type,
    });

    // La requête à disfonctionné
    if (typeof res === "undefined") {
      return { error: "L'api Kraken ne répond pas correctement" };
    }
    // Affiche les erreurs
    else if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
      return { error: res.error };
    }
    // Retourne 1 élément du tableau
    else if (typeof res !== "undefined" && typeof id !== "undefined") {
      return res.filter((v) => v.id === id)
    }
    // Le tableau est vide
    else if (res.length === 0) {
      return res;
    }

    // Retourne le résultat
    return res.filter((val) => (
      val.report === type &&
      val.descr === 'walltrade'
    ));
  } catch (error) {
    return { error: error };
  }
};

/**
 * Method AddExport
 * Envoie une demande d'ajout d'export
 * @param { String } type 
 * @param { String } starttm 
 * @returns Renvoie un objet { id: res.id } si la 
 * commande est bien executé et false en cas d'erreur
 */
export const AddExport = async (type, starttm) => {
  try {
    let report = typeof type !== "undefined" && ["ledgers", "trades"].includes(type) ? type : "ledgers";
    starttm = (typeof starttm === "undefined") ? "1325376000" /** 1er Janvier 2012 */ : starttm;

    const ud = new UserData();
    const res = await ud.addExport({
      report: report,
      description: "walltrade",
      starttm: starttm,
    });

    if (typeof res === "undefined" || !res.hasOwnProperty('id')) {
      return { callback: { type: "ERROR", error: "La demande d'export n'a pas été effectué correctement!" } }
    }

    if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
      return { callback: { type: "ERROR", error: res.error } }
    }

    return { id: res.id };
  } catch (error) {
    return { callback: { type: "ERROR", error } }
  }
};

/**
 * Method RetreiveExport
 * Envoie une demande de telechargement de l'export
 * et met à jour le store avec l'id et le type
 * @param { String } id 
 * @param { String } type 
 * @returns Renvoie un true si la commande est bien executé
 */
export const RetreiveExport = async (id, type) => {
  try {
    const ud = new UserData();
    const res = await ud.retrieveExport({ id, type });
    if (typeof res !== "undefined" && res.hasOwnProperty("error")) {
      return { callback: { type: "ERROR", error: res.error } }
    }
    exportcsv.update((v) => {
      v[type] = id;
      return v
    })
    return res;
  } catch (error) {
    console.error('[RetreiveExport]', error);
  }
};

/**
 * Method RemoveExport
 * Envoie une demande de suppression de l'export 
 * et supprime le dossier associé
 * @param { Array } ids 
 * @returns Renvoie un objet { delete: true } si la commande est bien executé
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
 * Vérifie si le dossier de l'id existe coté serveur
 * @param { String } id 
 * @returns Renvoie true si le dossier existe
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
 * Vérifie si l'export est expiré (inférieur à expire_time)
 * @param { String } completedtm 
 * @param { String } id 
 * @returns Renvoie true si l'export est expiré
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
 * Récupère la liste des export et traitement des données
 * @param { Object } ctx 
 * @param { Object } event 
 * @returns Un tableau contenant les export ou un objet contenant la transition a effectuer
 */
export const getListExport = async (ctx, _event) => {

  let expiredIds = []

  const ledgers = await StatusExport('ledgers')
  const trades = await StatusExport('trades')

  // Affichage en cas d'erreur
  if (ledgers.hasOwnProperty('error')) {
    return { callback: { type: "ERROR", error: ledgers.error } }
  }
  if (trades.hasOwnProperty('error')) {
    return { callback: { type: "ERROR", error: trades.error } }
  }

  /**
   * GESTION DES EXPORT EXPIRÉS
   * Gestion des export expiré|supprimé|annulé|en erreur| flags != 0 */

  /** LEDGERS */
  const datasTradesNoDeletedNoQueued = trades.filter((trad_v) => (
    !trad_v.hasOwnProperty('delete') &&
    trad_v.status !== "Queued"
  ));
  /** TRADES */
  const datasLedgersNoDeletedNoQueued = ledgers.filter((ledg_v) => (
    !ledg_v.hasOwnProperty('delete') &&
    ledg_v.status !== "Queued"
  ));

  for (const ex of [...datasTradesNoDeletedNoQueued, ...datasLedgersNoDeletedNoQueued]) {
    const checkFolder = await CheckExportExistFolder(ex.id);
    if (
      !checkFolder ||
      checkTimeExpired(ex.completedtm, ex.id) ||
      ex.hasOwnProperty('cancel') ||
      ex.flags !== '0'
    ) {
      if (!ctx.expired.includes(ex.id))
        expiredIds.push(ex.id)
    }
  }

  if (expiredIds.length !== 0) {
    return {
      callback: {
        type: "EXPIRED",
        data: { ids: expiredIds }
      }
    }
  }


  /** LEDGERS ******************************************************************************  */
  /*****************************************************************************************  */
  const datasLedgersQueued = ledgers.filter(ledg_v => (
    ledg_v.flags === '0' &&
    !ledg_v.hasOwnProperty('error') &&
    !ledg_v.hasOwnProperty('cancel') &&
    !ledg_v.hasOwnProperty('delete') &&
    ledg_v.status === "Queued"
  ))

  const datasLedgersProcessed = ledgers.filter(ledg_v => (
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
    if (datasLedgersProcessed.length === 0 || !ledgers) {
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
    else if (datasLedgersProcessed.length === 1) {
      exportcsv.update((val) => {
        val.ledgers = datasLedgersProcessed[0]['id']
        return val
      })
    }
    else {
      console.log("[LEDGERS] une erreur inatendu c'est produite!")
    }
  }

  /** TRADES  ******************************************************************************  */
  /*****************************************************************************************  */
  const datasTradesQueued = trades.filter(trad_v => (
    trad_v.flags === '0' &&
    !trad_v.hasOwnProperty('error') &&
    !trad_v.hasOwnProperty('cancel') &&
    !trad_v.hasOwnProperty('delete') &&
    trad_v.status === "Queued"
  ))

  const datasTradesProcessed = trades.filter(trad_v => (
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
    if (datasTradesProcessed.length === 0 || !trades) {
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
    else if (datasTradesProcessed.length === 1) {
      exportcsv.update((val) => {
        val.trades = datasTradesProcessed[0]['id']
        return val
      })
    }
    else {
      console.log("[TRADES] une erreur inatendu c'est produite!")
    }
  }

  /** Retourne les exports valides */
  return [...datasLedgersProcessed, ...datasTradesProcessed];
};
import UserData from 'classes/UserData.js'
import { exportcsv } from 'store/store.js'

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
    const ud = new UserData()
    const res = await ud.statusExport({
      report: type
    })

    // La requête à disfonctionné
    if (typeof res === 'undefined' || !res) {
      return { error: 'apiError' }
    } else if (
      typeof res !== 'undefined' &&
      Object.prototype.hasOwnProperty.call(res, 'error')
    ) {
      // Affiche les erreurs
      return { error: res.error }
    } else if (
      typeof res !== 'undefined' &&
      typeof id !== 'undefined' &&
      typeof res.filter === 'function'
    ) {
      // Retourne 1 élément du tableau
      return res.filter((v) => v.id === id)
    } else if (res.length === 0) {
      // Le tableau est vide
      return res
    }

    // Retourne le résultat
    return res.filter(
      // eslint-disable-next-line no-undef
      (val) => val.report === type && val.descr === __env.SITE_NAME
    )
  } catch (error) {
    return { error: error }
  }
}

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
    const report =
      typeof type !== 'undefined' && ['ledgers', 'trades'].includes(type)
        ? type
        : 'ledgers'
    starttm =
      typeof starttm === 'undefined'
        ? '1325376000' /** 1er Janvier 2012 */
        : starttm

    const ud = new UserData()
    const res = await ud.addExport({
      report: report,
      // eslint-disable-next-line no-undef
      description: __env.SITE_NAME,
      starttm: starttm
    })

    if (
      typeof res === 'undefined' ||
      !Object.prototype.hasOwnProperty.call(res, 'id')
    ) {
      return { callback: { type: 'ERROR_TRAD', error: 'addError' } }
    }

    if (
      typeof res !== 'undefined' &&
      Object.prototype.hasOwnProperty.call(res, 'error')
    ) {
      return { callback: { type: 'ERROR', error: res.error } }
    }

    return { id: res.id }
  } catch (error) {
    return { callback: { type: 'ERROR', error } }
  }
}

/**
 * Method RetreiveExport
 * Envoie une demande de telechargement de l'export
 * et met à jour le store avec l'id et le type
 * @param { String } id
 * @param { String } type
 * @returns Renvoie un true si la commande est bien executé
 */
export const RetreiveExport = async (id, type, userId) => {
  try {
    const ud = new UserData()
    const res = await ud.retrieveExport({ id, type, userId })
    if (
      typeof res !== 'undefined' &&
      Object.prototype.hasOwnProperty.call(res, 'error')
    ) {
      return { callback: { type: 'ERROR', error: res.error } }
    }
    exportcsv.update((v) => {
      v[type] = id
      return v
    })
    return res
  } catch (error) {
    console.error('[RetreiveExport]', error)
  }
}

/**
 * Method RemoveExport
 * Envoie une demande de suppression de l'export
 * et supprime le dossier associé
 * @param { Array } ids
 * @returns Renvoie un objet { delete: true } si la commande est bien executé
 */
export const RemoveExport = async (id, userId) => {
  try {
    const ud = new UserData()
    const res = await ud.removeOldFile({ id, userId })
    return res
  } catch (error) {
    console.error(error)
  }
}

/**
 * Method CheckExportExistFolder
 * Vérifie si le dossier de l'id existe coté serveur
 * @param { String } id
 * @param { String } type
 * @returns Renvoie true si le dossier existe
 */
const CheckExportExistFolder = async (id, type, userId) => {
  try {
    const ud = new UserData()
    return await ud.checkExportExist({ id, type, userId })
  } catch (error) {
    console.error(error)
  }
}

/**
 * Method checkTimeExpired
 * Vérifie si l'export est expiré (inférieur à expireTime)
 * @param { String } completedtm
 * @param { String } id
 * @returns Renvoie true si l'export est expiré
 */
const checkTimeExpired = (completedtm, id) => {
  const expireTime = 12 * 60 * 60 * 1000 // 12h // A changer selon le compte #settings
  const timeRemaining = parseInt(Date.now() - parseInt(completedtm * 1000))
  const remaining = expireTime - timeRemaining
  const check = remaining <= 0
  return check
}

/**
 * Method getListExport
 * Récupère la liste des export et traitement des données
 * @param { Object } ctx
 * @param { Object } event
 * @returns Un tableau contenant les export ou un objet contenant la transition a effectuer
 */
export const getListExport = async (ctx, _event) => {
  const expiredIds = []
  const missingFolder = []

  const ledgers = await StatusExport('ledgers')
  const trades = await StatusExport('trades')

  // Affichage en cas d'erreur
  if (Object.prototype.hasOwnProperty.call(ledgers, 'error')) {
    return { callback: { type: 'ERROR', error: ledgers.error } }
  }
  if (Object.prototype.hasOwnProperty.call(trades, 'error')) {
    return { callback: { type: 'ERROR', error: trades.error } }
  }

  /**
   * GESTION DES EXPORT EXPIRÉS
   * Gestion des export expiré|supprimé|annulé|en erreur| flags != 0 */

  /** LEDGERS */
  const datasTradesNoDeletedNoQueued = trades.filter(
    (tradV) =>
      !Object.prototype.hasOwnProperty.call(tradV, 'delete') &&
      tradV.status !== 'Queued'
  )
  /** TRADES */
  const datasLedgersNoDeletedNoQueued = ledgers.filter(
    (ledgV) =>
      !Object.prototype.hasOwnProperty.call(ledgV, 'delete') &&
      ledgV.status !== 'Queued'
  )

  for (const ex of [
    ...datasTradesNoDeletedNoQueued,
    ...datasLedgersNoDeletedNoQueued
  ]) {
    const checkFolder = await CheckExportExistFolder(
      ex.id,
      ex.report,
      ctx.userId
    )
    if (
      !checkFolder ||
      checkTimeExpired(ex.completedtm, ex.id) ||
      Object.prototype.hasOwnProperty.call(ex, 'cancel') ||
      ex.flags !== '0'
    ) {
      if (!ctx.expired.includes(ex.id)) expiredIds.push(ex.id)
    }

    if (!checkFolder) missingFolder.push({ id: ex.id, type: ex.report })
  }

  if (expiredIds.length !== 0) {
    return {
      callback: {
        type: 'EXPIRED',
        data: { ids: expiredIds }
      }
    }
  }

  if (missingFolder.length !== 0) {
    let data = false
    missingFolder.map((d) => (data = d))
    if (data) {
      return {
        callback: {
          type: 'RETREIVE',
          data
        }
      }
    }
  }

  /** LEDGERS ******************************************************************************  */
  /** ***************************************************************************************  */
  const datasLedgersQueued = ledgers.filter(
    (ledgV) =>
      ledgV.flags === '0' &&
      ledgV.status === 'Queued' &&
      !Object.prototype.hasOwnProperty.call(ledgV, 'error') &&
      !Object.prototype.hasOwnProperty.call(ledgV, 'cancel') &&
      !Object.prototype.hasOwnProperty.call(ledgV, 'delete')
  )

  const datasLedgersProcessed = ledgers.filter(
    (ledgV) =>
      ledgV.flags === '0' &&
      ledgV.status === 'Processed' &&
      !Object.prototype.hasOwnProperty.call(ledgV, 'error') &&
      !Object.prototype.hasOwnProperty.call(ledgV, 'cancel') &&
      !Object.prototype.hasOwnProperty.call(ledgV, 'delete') &&
      !checkTimeExpired(ledgV.completedtm, ledgV.id)
  )

  // Si queue existant on renvoie vers QUEUED
  if (datasLedgersQueued.length >= 1) {
    return {
      callback: {
        type: 'QUEUED',
        data: {
          type: 'ledgers',
          id: datasLedgersQueued[0].id
        }
      }
    }
  } else {
    // Si un export valide existe update dans exportcsv ledgers
    if (datasLedgersProcessed.length === 0 || !ledgers) {
      // Update exportcsv ledgers à false
      exportcsv.update((val) => {
        val.ledgers = false
        return val
      })
      // Si aucun export valide on ADD
      return {
        callback: {
          type: 'ADD',
          data: { type: 'ledgers' }
        }
      }
    } else if (datasLedgersProcessed.length === 1) {
      exportcsv.update((val) => {
        val.ledgers = datasLedgersProcessed[0].id
        return val
      })
    } else {
      console.log('[LEDGERS] an unexpected error has occurred!')
    }
  }

  /** TRADES  ******************************************************************************  */
  /** ***************************************************************************************  */
  const datasTradesQueued = trades.filter(
    (tradV) =>
      tradV.flags === '0' &&
      tradV.status === 'Queued' &&
      !Object.prototype.hasOwnProperty.call(tradV, 'error') &&
      !Object.prototype.hasOwnProperty.call(tradV, 'cancel') &&
      !Object.prototype.hasOwnProperty.call(tradV, 'delete')
  )

  const datasTradesProcessed = trades.filter(
    (tradV) =>
      tradV.flags === '0' &&
      tradV.status === 'Processed' &&
      !Object.prototype.hasOwnProperty.call(tradV, 'error') &&
      !Object.prototype.hasOwnProperty.call(tradV, 'cancel') &&
      !Object.prototype.hasOwnProperty.call(tradV, 'delete') &&
      !checkTimeExpired(tradV.completedtm, tradV.id)
  )

  // Si queue existant on renvoie vers QUEUED
  if (datasTradesQueued.length >= 1) {
    return {
      callback: {
        type: 'QUEUED',
        data: {
          type: 'trades',
          id: datasTradesQueued[0].id
        }
      }
    }
  } else {
    // Si un export valide existe update dans exportcsv trades
    if (datasTradesProcessed.length === 0 || !trades) {
      // Update exportcsv trades à false
      exportcsv.update((val) => {
        val.trades = false
        return val
      })
      // Si aucun export valide on ADD
      return {
        callback: {
          type: 'ADD',
          data: { type: 'trades' }
        }
      }
    } else if (datasTradesProcessed.length === 1) {
      exportcsv.update((val) => {
        val.trades = datasTradesProcessed[0].id
        return val
      })
    } else {
      console.log('[TRADES] an unexpected error has occurred!')
    }
  }

  /** Retourne les exports valides */
  return [...datasLedgersProcessed, ...datasTradesProcessed]
}

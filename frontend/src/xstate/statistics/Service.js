/**
 * context
 * @returns Définie une variable context
 */
const context = {
  ledgers: [],
  trades: [],
  dataformat: {
    ledgers: [],
    trades: []
  }
}

/**
 * statisticsService
 * @returns Définie une variable statisticsService utilisé pour la stateMachine
 */
export const statisticsService = {
  id: "statisticsMachine",
  initial: "idle",
  context,
  states: {
    idle: {
      on: { FETCH: "loading" },
    },
    loading: {
      invoke: {
        src: "fetchExport",
        onDone: {
          target: "success",
          actions: "assignData"
        },
        onError: {
          target: "error",
          actions: "displayError",
        },
      },
    },
    processing: {
      invoke: {
        src: "processingData",
        onDone: {
          target: "displaying",
          actions: "assignDataDisplay"
        },
        onError: {
          target: "error",
          actions: "displayError",
        },
      },
    },
    success: {
      on: { NEXT: "processing" },
    },
    error: {
      on: { FETCH: "loading" },
    },
    displaying: {
      type: 'final'
    },
  },
}
const context = {
  type: 'ledgers',
  data: [],
  expired: [],
  count: 0
}
export const exportService = {
  id: 'exportMachine',
  initial: 'loading',
  context,
  states: {
    loading: {
      invoke: {
        id: 'loadData',
        src: 'initLoadData',
        onError: 'error'
      },
      on: {
        ADD: 'add',
        QUEUED: 'status',
        EXPIRED: {
          target: 'loading',
          actions: 'assignExpired'
        },
        PROCESSED: {
          target: 'processed',
          actions: 'assignData'
        },
      },
    },
    add: {
      invoke: {
        id: 'addExport',
        src: 'addExport',
      },
      on: {
        ADDED: 'status',
        ERROR: 'failure'
      },
    },
    status: {
      invoke: {
        id: 'statusExport',
        src: 'statusExport',
        onDone: 'loading',
        onError: 'error',
      },
      on: {
        PROCESSED: 'retreive',
        QUEUED: {
          target: 'status',
          actions: 'assignProgress'
        }
      }
    },
    retreive: {
      invoke: {
        id: 'retreiveExport',
        src: 'retreiveExport',
      },
      on: {
        DONE: 'loading',
        ERROR: 'failure'
      }
    },
    error: {
      invoke: {
        id: 'error',
        src: 'checkError',
      }
    },
    processed: { type: 'final' },
    failure: { type: 'final' },
  }
}
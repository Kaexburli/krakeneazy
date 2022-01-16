const context = {
  type: 'ledgers',
  data: [],
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
        REMOVE: 'remove',
        RETRY: 'loading',
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
        },
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
    remove: {
      invoke: {
        id: 'removeExport',
        src: 'RemoveExport',
      },
      on: {
        DONE: 'add',
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
const context = {
  type: 'ledgers',
  data: [],
  expired: [],
  userId: false,
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
        RETREIVE: {
          target: 'retreive',
        },
        PROCESSED: {
          target: 'processed',
          actions: 'assignData'
        },
        ERROR: 'failure'
      },
    },
    add: {
      invoke: {
        id: 'addExport',
        src: 'addExport',
        onError: 'error'
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
        onError: 'error'
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
    failure: {
      invoke: {
        id: 'error',
        src: 'checkError',
      },
      type: 'final'
    },
    processed: { type: 'final' },
  }
}
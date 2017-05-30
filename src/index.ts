import * as Nes from 'nes'

const SOCKET_CONNECTED = '@vue-nes/CONNECTED'
const SOCKET_DISCONNECTED = '@vue-nes/DISCONNECTED'
const SOCKET_MESSAGE = '@vue-nes/MESSAGE'

class Socket {
  private vuexStore
  private onUpdate: (update: Object) => {}
  private client

  constructor(vuexStore, obj) {
    this.vuexStore = vuexStore
    this.onUpdate = obj.onUpdate
  }

  request(id) {
    return new Promise((resolve, reject) => {
      this.client.request(id, (err, payload) => {
        if (err) {
          reject(err)
          return
        }
        resolve(payload)
      })
    })
  }

  subscribe(path, handler, callback) {
    this.client.subscribe(path, handler, callback)
  }

  unsubscribe(path, handler, callback) {
    this.client.unsubscribe(path, handler, callback)
  }

  connect(url: string) {
    if (this.client) { this.client.disconnect() }
    this.client = new Nes.Client(url)
    this.client.connect((/* err1 */) => {
      this.client.onUpdate = this.onUpdate

      this.client.onUpdate = (update) => {
        this.onUpdate(update)
      }
      console.log('[SOCKET] registered onUpdate handler')
    })

    this.client.onConnect = () => {
      this.vuexStore.commit(SOCKET_CONNECTED)
      console.log('[SOCKET] connected')
    }
    this.client.onDisconnect = () => {
      this.vuexStore.commit(SOCKET_DISCONNECTED)
      console.log('[SOCKET] disconnected')
    }
  }
}

const subscriptionHandlers = {}

export default {
  install(Vue, options) {
    const { wsUrl, store } = options

    Vue.mixin({
      beforeCreate() {
        if (!this.$options.nes) return
        if (typeof subscriptionHandlers[this._uid] === 'undefined') {
          subscriptionHandlers[this._uid] = []
        }
        // process callback
        const subscriptions = this.$options.nes.subscribe.map((s) => {
          return {
            path: s,
            handler(update) {
              update.__path = s
              store.commit(SOCKET_MESSAGE, {
                message: update,
              })
            },
            callback(err) {
            },
          }
        })
        subscriptionHandlers[this._uid].push(subscriptions)
        subscriptions.forEach((n) => {
          nesSocket.subscribe(n.path, n.handler, n.callback)
        })
      },
      destroyed() {
        if (this.$options.nes) {
          subscriptionHandlers[this._uid].forEach((n) => {
            n.forEach((s) => {
              nesSocket.unsubscribe(s.path, s.handler, s.callback)
            })
          })
          subscriptionHandlers[this._uid] = []
        }
      }
    });

    const nesSocket = new Socket(store, {
      onUpdate: (update) => {
        store.commit(SOCKET_MESSAGE, {
          message: update,
        })
      },
    })
    nesSocket.connect(wsUrl)
    Vue.prototype.$nes = () => {
    }
    Vue.prototype.$nes.request = id => nesSocket.request(id)
    Vue.prototype.$nes.subscribe = nesSocket.subscribe.bind(nesSocket)
  },
}

export const vuexModule = {
  state: {
    connected: false,
    message: {},
  },
  mutations: {
    [SOCKET_CONNECTED](state) {
      state.connected = true
    },
    [SOCKET_DISCONNECTED](state) {
      state.connected = false
    },
    [SOCKET_MESSAGE](state, payload) {
      state.message = payload.message
    },
  },
}

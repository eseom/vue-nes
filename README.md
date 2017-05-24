# vue-nes

> vue plugin support for hapi-nes

[![npm version][npm-badge]][npm-url]

You can use this plugin to add NES(websocket for hapijs) support to your vue application. The messages pass through the synced store, and you can get those messages at anywhere.

# requirements
- vuex

# Usage

Example:
```js
// vuejs boot file
import VueNes from 'vue-nes'

// usually websocket url is localhost:
const wsUrl = `ws${window.location.protocol === 'https:' ? 's' : ''}://${window.location.host}`
Vue.use(VueNes, { wsUrl, store } )



// store generator
import { vuexModule as socketVuexModule } from 'vue-nes'

const store = new Vuex.Store({
  actions,
  getters,
  modules: {
    .
    .
    nes: socketVuexModule,
    .
    .
  },
  strict: true,
})



// in components
// Register component scoped subscriptions
// We can get messages from store when we're in the component
<template>
  <div>
    {{message.code}}
  </div>
</template>

<script>
export default {
  .
  .
  nes: {
    subscribe: [
      '/item/6',  // you can receive from this subscription on this component, and all child components.
    ],
  },
  .
  .
  computed: {
    message() {
      this.$store.state.nes.message // you can get broadcast messages from server at here
    }
  },
}
</script>

```

# development
```
git clone https://github.com/eseom/vue-nes
cd vue-nes
yarn
yarn link
yarn watch

# (and open a new terminal)
cd /path/to/your_vue_project
yarn link vue-nes

# enjoy it
```

[npm-url]: https://www.npmjs.com/package/vue-nes
[npm-badge]: https://img.shields.io/npm/v/vue-nes.svg

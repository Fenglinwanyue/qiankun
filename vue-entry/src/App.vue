<template>
  <div id="app">
    <div class="jump-react--btn" @click="jumpReact">jump react</div>
    <div class="jump-react--btn" @click="jumpBase">jump base</div>
    <div @click="update">从vuex的global module的state： {{ JSON.stringify(user) }}</div>
    <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'App',
  data() {
      return {
      }
  },
  components: {
    HelloWorld: window.__POWERED_BY_QIANKUN__ ? window.commonComponent.HelloWorld : () => import('./components/HelloWorld.vue')
  },
  computed: {
    // 通过global获取user的信息
    ...mapState('global', {
      user: state => state.user
    })
  },
  methods: {
    ...mapActions('global', ['setGlobalState']),
    jumpBase() {
      history.pushState(null, 'main-entry', '/main-entry')
    },
    jumpReact() {
      history.pushState(null, 'react-entry', '/sub-react')
    },
    update() {
      this.setGlobalState({ user: { name: '贼帅' } })
    }
  }
}
</script>

<style scoped>
html {
  background-color: #ff2d55;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

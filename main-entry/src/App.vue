<template>
  <div id="main-entry-base-wrapper">
    <ul class="main-entry-nav-wrapper">
      <li class="main-entry-nav--btn" :class="{ active: item.activeRule === currentRoute }" v-for="item in microApps" :key="item.name" @click="goto(item)">{{ item.name }}</li>
    </ul>
    <div class="global-state">主应用的状态管理：{{ JSON.stringify(globalState) }}</div>
    <div id="subapp-viewport"></div>
  </div>
</template>

<script>
// import NProgress from 'nprogress'
import microApps from './micro-app'
export default {
  name: 'App',
  data() {
    return {
      isLoading: false,
      microApps,
      currentRoute: '/sub-vue',
      globalState: this.$globalState.getGlobalState()
    }
  },
  created() {
    console.log(this.$globalState)
    this.isLoading = true
    this.setCurrentRoute()
  },
  mounted() {
    this.listenRouterChange()
  },
  watch: {
    isLoading(val) {
      if (val) {
        console.log('isDone')
        // NProgress.start()
      } else {
        this.$nextTick(() => {
          //   NProgress.done()
        })
      }
    }
  },
  methods: {
    listenRouterChange() {
      // 虽然各种HTML5文档说 window.onpopstate 事件可以拦截 pushState 的消息，但在实际的测试中， onpopstate 根本没有任何作用，无法拦截 pushState 的消息。
      const proxyEvent = function(eventType) {
        const oriEvent = history[eventType]
        return function() {
          const oriDone = oriEvent.apply(this, arguments)
          const e = new Event(eventType)
          e.arguments = arguments
          window.dispatchEvent(e)
          return oriDone
        }
      }
      history.pushState = proxyEvent('pushState')
      history.replaceState = proxyEvent('replaceState')

      window.addEventListener('pushState', this.setCurrentRoute)
      window.addEventListener('replaceState', this.setCurrentRoute)
      window.addEventListener('popstate', this.setCurrentRoute)
      // 这段代码改写了 history 中原来的函数，然后自己激活一个事件
      // 这样就可以解决 pushState 无法激活事件的问题了
      // 另外记得最好将这段代码放在文档加载前执行
      this.$once('hook:beforeDestroy', () => {
        window.removeEventListener('pushState', this.setCurrentRoute)
        window.removeEventListener('popstate', this.setCurrentRoute)
      })
    },
    setCurrentRoute() {
      const path = window.location.pathname
      if (this.microApps.findIndex(item => item.activeRule === path) >= 0) {
        this.currentRoute = path
      }
    },
    goto(item) {
      console.log('jump route/url: ', item)
      history.pushState(null, item.activeRule, item.activeRule)
    },
    oriJump({ stateObj = null, tit = '', targetURL }) {
      // 存在跨域限制
      console.log('@状态对象', stateObj, '@页面标题', tit, 'url', targetURL)
      history.pushState(stateObj, tit, targetURL)
    }
  }
}
</script>

<style lang="css">
html,
body {
  margin: 0 !important;
  padding: 0;
}
.main-entry-nav-wrapper {
  height: 50px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  line-height: 50px;
  display: flex;
  list-style: none;
  margin: 0;
}
.main-entry-nav-wrapper li {
  list-style: none;
  display: inline-block;
  padding: 0 20px;
  cursor: pointer;
}
.main-entry-nav-wrapper li.active {
  color: #42b983;
  text-decoration: underline;
}
</style>

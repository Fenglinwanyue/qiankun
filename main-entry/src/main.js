import Vue from 'vue'
import Router from 'vue-router'
import App from './App.vue'
/**fetch 兼容iE11 */
// import 'whatwg-fetch';
// // import 'custom-event-polyfill'; // 如果还报错，需要引入这个
// import 'core-js/stable/promise';
// import 'core-js/stable/symbol';
/**fetch 兼容iE11 */
// import { registerMicroApps, setDefaultMountApp,start } from 'qiankun';
import { registerMicroApps, start } from 'qiankun'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import microApps from './micro-app'
import globalState from './store'

import HelloWorld from '@/components/HelloWorld.vue'
NProgress.start()
Vue.config.productionTip = false
// 提供全局组件供子应用使用
window.commonComponent = { HelloWorld };
Object.defineProperty(Vue.prototype, '$globalState', {
  value: globalState,
  configurable: false,
  enumerable: false
})
Vue.use(Router)
const router = new Router({
  mode: 'history', // 如果是hash则返回主应用时，router路由导航不会进入 /#
  routes: [
    {
      path: '/',
      redirect: '/main-entry'
    }
  ]
})
// 解决从子项目页面跳转到主项目自身的页面时，子项目被卸载的同时主项目页面的 css 被卸载的 bug
const oriAppendChild = HTMLHeadElement.prototype.appendChild
const oriAddEventListener = window.addEventListener

router.beforeEach((to, from, next) => {
  console.log('enter main-entry router', to, from)
  if (to.path === '/main-entry') {
    console.log('--------current app is main-entry--------')
    HTMLHeadElement.prototype.appendChild = oriAppendChild
    window.addEventListener = oriAddEventListener
  }
  next()
  // to and from are both route objects. must call `next`.
})
const instance = new Vue({
  router,
  render: h => h(App)
}).$mount('#single-spa-wrapper')
NProgress.done()

// 定义loader方法，loading改变时，将变量赋值给App.vue的data中的isLoading
function loader(loading) {
  if (instance && instance.$children) {
    // instance.$children[0] 是App.vue，此时直接改动App.vue的isLoading
    instance.$children[0].isLoading = loading
  }
}

// 给子应用配置加上loader方法
const apps = microApps.map(item => {
  return {
    ...item,
    loader
  }
})

/* eslint no-undef: "off" */
registerMicroApps(apps, {
  beforeLoad: app => {
    NProgress.start()
    console.log('before load app.name====>>>>>', app.name)
  },
  beforeMount: [
    app => {
      console.log('[LifeCycle] before mount %c%s', 'color: green;', app.name)
    }
  ],
  afterMount: [
    app => {
      NProgress.done()
      console.log('[LifeCycle] after mount %c%s', 'color: green;', app.name)
    }
  ],
  afterUnmount: [
    app => {
      console.log('[LifeCycle] after unmount %c%s', 'color: green;', app.name)
    }
  ]
})
// setDefaultMountApp('/sub-vue')
// set microApps publicPath 针对不同域名
start({
  prefetch: false, // fix: 当预加载其它子应用时，下面写法会报错TypeError: Failed to construct 'URL': Invalid base URL
  getPublicPath: entry => entry
})
// {sandbox :{strictStyleIsolation: true}} 配置后会导致react报错： SKIP_BECAUSE_BROKEN: Target container is not a DOM element.

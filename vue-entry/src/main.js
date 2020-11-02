import './public-path'
import Vue from 'vue'
import App from './App.vue'
import routes from './router'
import { store as globalStore } from 'common'
import store from './store'
import VueRouter from 'vue-router'
// import globalRegister from './store/global-register'
// 验证window挂载变量 qiankun无法获取子应用生命周期的bug https://github.com/umijs/qiankun/issues/777
// window.console = window.console || (() => {});
Vue.config.productionTip = false
let instance = null

function render(props = {}) {
  const { container, routerBase } = props
  const router = new VueRouter({
    base: window.__POWERED_BY_QIANKUN__ ? routerBase : process.env.BASE_URL,
    mode: 'history',
    routes
  })

  instance = new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app')
  // 遇到的问题: 开启沙箱模式,如果是 采用 render 模式会报错 ,固选择container 模式
}

if (!window.__POWERED_BY_QIANKUN__) {
  // 这里是子应用独立运行的环境，实现子应用的登录逻辑

  // 独立运行时，也注册一个名为global的store module
  globalStore.globalState(store) // 使用common
  //   globalRegister(store) // 使用本地
  // 模拟登录后，存储用户信息到global module
    const userInfo = { name: '独立运行时名字叫spa' } // 假设登录后取到的用户信息
    store.commit('global/setGlobalState', { user: userInfo })

  render()
}

export async function bootstrap(props) {
  console.log('[vue] vue app bootstraped', props)
}

export async function mount(props) {
  console.log('[vue] props from main framework', props)
  globalStore.globalState(store, props)
  //   globalRegister(store, props)
  render(props)
}

export async function unmount() {
  instance.$destroy()
  instance.$el.innerHTML = ''
  instance = null
}

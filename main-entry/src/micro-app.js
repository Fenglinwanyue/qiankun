import store from './store'

const microApps = [
    {
      name: 'react-entry', // app name registered
      entry: 'http://localhost:3000/',
    //   container: '#subapp-viewport', // 子应用挂载的div
      activeRule: '/sub-react',
      // props: {
      //   routerBase: '/sub-react' // 下发路由给子应用，子应用根据该值去定义qiankun环境下的路由
      // }
    },
    {
      name: 'vue-entry',
      entry: 'http://localhost:8082/',
    //   container: '#subapp-viewport',
      activeRule: '/sub-vue',
      // props: {
      //   routerBase: '/sub-vue' // 下发路由给子应用，子应用根据该值去定义qiankun环境下的路由
      // }
    }
  ]

  const apps = microApps.map(item => {
    return {
      ...item,
      container: '#subapp-viewport', // 子应用挂载的div
      props: {
        routerBase: item.activeRule, // 下发基础路由
        getGlobalState: store.getGlobalState, // 下发getGlobalState方法
        setGlobalState: store.setGlobalState
      }
    }
  })

  export default apps

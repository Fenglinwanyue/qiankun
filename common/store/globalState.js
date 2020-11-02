const registerGlobalModule = function(store, props = {}) {
  if (!store || !store.hasModule) return
  const initState = (props.getGlobalState && props.getGlobalState()) || props
  if (!store.hasModule('global')) {
    const globalModule = {
      namespaced: true,
      state: initState,
      actions: {
        setGlobalState({ commit }, payload) {
          commit('setGlobalState', payload)
          // 触发主应用修改state，同时同步子应用state到主应用
          //   commit('emitGlobalState')
        },
        // 初始化，只用于mount时同步父应用的数据
        // initGlobalState({ commit }, payload) {
        //   commit('setGlobalState', payload)
        // }
        initGlobalState({ commit }, payload) {
          commit('initGlobalState', payload)
        }
      },
      mutations: {
        initGlobalState(state, payload) {
          state = Object.assign(state, payload)
        },
        setGlobalState(state, payload) {
          state = Object.assign(state, payload)
          if (props.setGlobalState) {
            // 主应用state设置-语法
            props.setGlobalState(state)
          }
        }
        // 防止触发主应用时子应用state暂未更新
        // 触发主应用state设置
        // emitGlobalState(state) {
        //   if (props.setGlobalState) {
        //     // 主应用state设置-语法
        //     props.setGlobalState(state)
        //   }
        // }
      }
    }
    store.registerModule('global', globalModule)
  } else {
    // 应用于子应用先加载跳转主应用后返回的场景
    store.dispatch('global/initGlobalState', initState)
  }
  // 监听props-state变化
  props.onGlobalStateChange &&
    props.onGlobalStateChange((state, prev) => {
      // state: 变更后的状态; prev 变更前的状态
      console.log(state, prev)
      store.dispatch('global/initGlobalState', initState)
    })
}

export default registerGlobalModule

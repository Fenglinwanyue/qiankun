# vue 导入本文件报eslint错误

添加.eslintignore /

# 事件通讯

基于浏览器自带的CustomEvent实现通信
//主应用
window.dispathEvent(
    new CustomEvent('master:collapse-menu'),{detail: {collapsed:true} }
 )
//子应用
window.addEventLister('master:collapse-menu',
      event => console.log(event.detail.collapsed))

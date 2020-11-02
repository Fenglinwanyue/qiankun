# 微前端实战模版
本模版使用qiankun为微前端的架构模式，主项目为vue，子项目分别为vue、react
# 项目结构
common：公共依赖
main-entry：主应用
vue-entry：vue子应用
react-entry： react子应用

# 使用qiankun的状态管理做全局状态管理


#### 以下仅为记录
# process.env.VUE_APP_PORT
vue项目使用.env文件配置全局环境变量
https://blog.csdn.net/w405722907/article/details/94720868
# publicPath
Type: string
Default: '/'

部署应用包时的基本 URL。用法和 webpack 本身的 output.publicPath 一致，但是 Vue CLI 在一些其他地方也需要用到这个值，所以请始终使用 publicPath 而不要直接修改 webpack 的 output.publicPath。

默认情况下，Vue CLI 会假设你的应用是被部署在一个域名的根路径上，例如 https://www.my-app.com/。如果应用被部署在一个子路径上，你就需要用这个选项指定这个子路径。例如，如果你的应用被部署在 https://www.my-app.com/my-app/，则设置 publicPath 为 /my-app/。

这个值也可以被设置为空字符串 ('') 或是相对路径 ('./')，这样所有的资源都会被链接为相对路径，这样打出来的包可以被部署在任意路径

# 使用 webpack 静态 publicPath 配置
你需要将你的 webpack publicPath 配置设置成一个绝对地址的 url，比如在开发环境可能是：

{
  output: {
    publicPath: `//localhost:${port}`,
  }
}

# 手动加载子应用时，可配置样式隔离，但多次切换子应用失效
loadMicroApp(app, configuration?) =》configuration-》 sandbox - boolean | { strictStyleIsolation?: boolean, experimentalStyleIsolation?: boolean } - 可选，是否开启沙箱，默认为 true
当配置为 { strictStyleIsolation: true } 时表示开启严格的样式隔离模式。这种模式下 qiankun 会为每个微应用的容器包裹上一个 shadow dom 节点，从而确保微应用的样式不会对全局造成影响。

# experimentalStyleIsolation问题 不支持动态以link标签的方式插入样式
qiankun 还提供了一个实验性的样式隔离特性，当 experimentalStyleIsolation 被设置为 true 时，qiankun 会改写子应用所添加的样式为所有样式规则增加一个特殊的选择器规则来限定其影响范围

err: 子应用使用VUE时，开启experimentalStyleIsolation后，第一次加载子应用A正常，切换到另一个子应用B后再回到A，样式没有添加div[data-qiankun=vue]
# start()
//   start({
//       sandbox: true,
//       prefetch: false, // 是否开启预加载，默认为 true 配置为 true 则会在第一个微应用 mount 完成后开始预加载其他微应用的静态资源 配置为 'all' 则主应用 start 后即开始预加载所有微应用静态资源
//   })
# sandbox
sandbox - boolean | { strictStyleIsolation?: boolean, experimentalStyleIsolation?: boolean } - 可选，是否开启沙箱，默认为 true

# css 污染问题及加载 bug

qiankun 只能解决子项目之间的样式相互污染，不能解决子项目的样式污染主项目的样式

主项目要想不被子项目的样式污染，子项目是 vue 技术，样式可以写 css-scoped ，如果子项目是 jQuery 技术呢？所以主项目本身的 id/class 需要特殊一点，不能太简单，被子项目匹配到。

# 从子项目页面跳转到主项目自身的页面时，主项目页面的 css 未加载的 bug

产生这个问题的原因是：在子项目跳转到父项目时，子项目的卸载需要一点点的时间，在这段时间内，父项目加载了，插入了 css，但是被子项目的 css 沙箱记录了，然后被移除了。父项目的事件监听也是一样的，所以需要在子项目卸载完成之后再跳转。我原本想在路由钩子函数里面判断下，子项目是否卸载完成，卸载完成再跳转路由，然而路由不跳转，子项目根本不会卸载。
临时解决办法：先复制一下 HTMLHeadElement.prototype.appendChild 和 window.addEventListener ，路由钩子函数 beforeEach 中判断一下，如果当前路由是子项目，并且去的路由是父项目的，则还原这两个对象.
const childRoute = ['/app-vue-hash','/app-vue-history'];
const isChildRoute = path => childRoute.some(item => path.startsWith(item))
const rawAppendChild = HTMLHeadElement.prototype.appendChild;
const rawAddEventListener = window.addEventListener;
router.beforeEach((to, from, next) => {
  // 从子项目跳转到主项目
  if(isChildRoute(from.path) && !isChildRoute(to.path)){
    HTMLHeadElement.prototype.appendChild = rawAppendChild;
    window.addEventListener = rawAddEventListener;
  }
  next();
});

# 抽取公共代码
公共代码抽取后，其他的应用如何使用呢？ 可以让common发布为一个npm私包，npm私包有以下几种组织形式：

npm指向本地file地址：npm install file:../common。直接在根目录新建一个common目录，然后npm直接依赖文件路径。
npm指向私有git仓库: npm install git+ssh://xxx-common.git。
发布到npm私服。

由于common是不经过babel和pollfy的，所以引用者需要在webpack打包时显性指定该模块需要编译，如vue子应用的vue.config.js需要加上这句：

module.exports = {
  transpileDependencies: ['common'],
}
缺点： 每次common改变，子应用都需要重新安装common

### 记录
webpack 的 publicPath 值只能在入口文件修改，之所以单独写到一个文件并在入口文件最开始引入，是因为这样做可以让下面所有的代码都能使用这个。

所有的资源（图片/音视频等）都应该放到 src 目录，不要放在 public 或 者static
资源放 src 目录，会经过 webpack 处理，能统一注入 publicPath。否则在主项目中会404。

子项目加载时，容器未渲染好
检查容器 div 是否是写在了某个路由里面，路由没匹配到所有未加载。如果只在某个路由页面加载子项目，可以在页面的 mounted 周期里面注册子项目并启动。

路由跳转问题
在子项目里面如何跳转到另一个子项目/主项目页面呢，直接写 <router-link> 或者用 router.push/router.replace 是不行的，原因是这个 router 是子项目的路由，所有的跳转都会基于子项目的 base 。写 <a> 链接可以跳转过去，但是会刷新页面，用户体验不好。
解决办法也比较简单，在子项目注册时将主项目的路由实例对象传过去，子项目挂载到全局，用父项目的这个 router 跳转就可以了。

# bug
qiankun不支持动态link
项目中挂载到window上的变量会导致qiankuan拿不到子应用的生命周期

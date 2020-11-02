(() => {
  // qiankun 将会在微应用 bootstrap 之前注入一个运行时的 publicPath 变量，你需要做的是在微应用的 entry js 的顶部添加如下代码：
  // 主要解决的是微应用动态载入的 脚本、样式、图片 等地址不正确的问题。
  if (window.__POWERED_BY_QIANKUN__) {
    if (process.env.NODE_ENV === 'development') {
        console.log('process.env.VUE_APP_PORT',process.env.VUE_APP_PORT);
      // eslint-disable-next-line no-undef
      __webpack_public_path__ = `//localhost:${process.env.VUE_APP_PORT}/`;
      return;
    }
    console.log('window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__:  ', window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__)
    // eslint-disable-next-line no-undef
    __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__; // hint: 主应用和子应用不在同一个域名时需单独设置子应用域名
  }
})();

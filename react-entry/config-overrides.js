const { name } = require('./package.json');
console.log(name)

module.exports = {
  webpack: function override(config, env) {
    config.entry = config.entry.filter(
        // 解决子应用的热重载引得父应用服务挂掉的问题：https://github.com/umijs/qiankun/issues/340 关闭热重载
      (e) => !e.includes('webpackHotDevClient')
    );

    config.output.library = `${name}-[name]`;
    config.output.libraryTarget = 'umd';
    config.output.jsonpFunction = `webpackJsonp_${name}`;
    return config;
  },
  devServer: (configFunction) => {
    return function (proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      config.open = false;
      config.hot = false;
      config.headers = {
        'Access-Control-Allow-Origin': '*',
      };
      // Return your customised Webpack Development Server config.
      return config;
    };
  },
};

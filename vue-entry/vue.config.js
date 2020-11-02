// package.json的name需注意与主应用一致
const path = require('path')
const { name } = require('./package.json')

module.exports = {
//   assetsDir:'./static',//静态资源目录(js,css,img,fonts)这些文件都可以写里面
// publicPath:'/sub-vue',
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      jsonpFunction: `webpackJsonp_${name}`,
    }
  },
  devServer: {
    // contentBase: './dist',
    // port: process.env.VUE_APP_PORT, // 在.env中VUE_APP_PORT=7788，与父应用的配置一致
    headers: {
      'Access-Control-Allow-Origin': '*' // 主应用获取子应用时跨域响应头
    }
  }
}

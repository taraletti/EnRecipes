const webpack = require('@nativescript/webpack')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = (env) => {
  webpack.init(env)
  return webpack.resolveConfig()
}

const Dotenv = require('dotenv-webpack')
const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const DelWebpackPlugin = require('del-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const PACKAGE = require('./package.json')

// To show version to the script when it's built
const banner = `${PACKAGE.name} v${PACKAGE.version} | DPS Development Team <professional-services\@dailymotion.com> | Released under the ${PACKAGE.license} license`

const config = {
  entry: {
    "dm-vjs": "./src/Entries/loader.ts",
    "dm-vjs-player": "./src/Entries/playerLoader.ts"
  },
  externalsPresets: {
    node: true
  },
  optimization: {
    usedExports: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: { output: { ascii_only: true } },
        extractComments: false,
      })
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.((c|sa|sc)ss)$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext]' // Output to assets folder
        }
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      // Provide an alias for problematic paths or fallbacks
      'images': path.resolve(__dirname, 'public/assets'),
    }
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: banner,
    }),
  ]
}

module.exports = (env, options) => {
  const dotenv = new Dotenv()
  const isProd = options.mode === 'production'

  config.plugins.push(dotenv)
  config.output = {
    // TODO: change this next cycle to be ready to deploy to official CDN
    path: path.resolve(__dirname, 'public/dist'),
    filename: isProd ? '[name].min.js' : '[name].js',
    chunkFilename: isProd ? '[id].min.[chunkhash:8].js' : '[id].chunk.js',
    publicPath: '/dist/'
  }

  // For more option please visit https://webpack.js.org/configuration/devtool/
  switch (env.env) {
    case 'dev':
      config.devtool = 'inline-source-map'
      config.output.filename = '[name].js'
      break
    case 'staging':
      config.devtool = 'source-map'
      config.output.filename = '[name]-staging.min.js'
      break
    case 'prod':
      config.output.filename = '[name].min.js'
      break
  }

  if (env.env === 'dev' || env.env === 'staging') {

    config.plugins.push(
      new webpack.DefinePlugin({
        PRODUCTION: isProd ? JSON.stringify(true) : JSON.stringify(false),
        VERSION: JSON.stringify(require('./package.json').version),
      }),

      /** Example pages */
      new HtmlWebpackPlugin({
        title: 'Sample blog for show player - Dailymotion',
        template: 'src/Lab/index.html',
        filename: 'lab/index.html',
        chunks: []
      }),
      new HtmlWebpackPlugin({
        title: 'Sample blog for public video - Dailymotion',
        template: 'src/Lab/public-video.html',
        filename: 'lab/public-video.html',
        chunks: []
      }),
      new HtmlWebpackPlugin({
        title: 'Sample blog for private video - Dailymotion',
        template: 'src/Lab/private-video.html',
        filename: 'lab/private-video.html',
        chunks: []
      }),
      new HtmlWebpackPlugin({
        title: 'Sample blog for geo blocked video - Dailymotion',
        template: 'src/Lab/geo-blocked-video.html',
        filename: 'lab/geo-blocked-video.html',
        chunks: []
      }),
    )

  }

 if (env.env === 'prod') {
   config.plugins.push(
     new DelWebpackPlugin({
       include: ['**', '../dist/*'],
       exclude: ['*.LICENSE.*'],
       info: true,
       keepGeneratedAssets: true,
       allowExternal: true
     })
   )
 }

  config.plugins.push(
    new HtmlWebpackPlugin({
      title: 'Dailymotion Player',
      template: 'src/Player/dm-player.html',
      filename: 'dm-player.html',
      chunks: ['dm-vjs-player']
    })
  )

  return config
}

/**
 * 发布脚本
 */

// 静态资源打包位置
const STATIC_DIST = '/app/dist/static';
// html模板打包位置
const HTML_DIST = '/app/dist';
// html内引用静态资源的前缀
const STATIC_PREFIX = '/static/';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const styleLintPlugin = require('stylelint-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const {InjectManifest} = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

console.log('发布编译...');

module.exports = {
    entry: [
        path.join(process.cwd(), '/src/app.js')
    ],
    output: {
        path: path.join(process.cwd(), STATIC_DIST),
        filename: '[name].[hash:8].js',
        publicPath: STATIC_PREFIX,
        chunkFilename: '[name].[chunkhash:6].js'
    },
    devtool: false,
    cache: false,
    resolve: {
        extensions: ['.js', '.vue'],
    },
    plugins: [
        new CleanPlugin(path.join(process.cwd(), STATIC_DIST)),
        new CopyWebpackPlugin([
            {
                from: path.join(process.cwd(), '/src/static'),
                to: path.join(process.cwd(), STATIC_DIST),
                ignore: ['.*']
            }
        ]),
        new webpack.DefinePlugin({
            __SERVER__: false,
            __DEVELOPMENT__: false,
            __DEVTOOLS__: false,
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            },
        }),
        new styleLintPlugin({
            configFile: path.join(__dirname, '/.stylelintrc'),
            quiet: false
        }),
        new ExtractTextPlugin({
            filename: '[name].[hash:6].css',
            disable: false,
            allChunks: true
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: ({resource}) => (
                resource &&
                resource.indexOf('node_modules') >= 0 &&
                resource.match(/\.js$/)
            ),
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            chunks: ['vendor']
        }),
        new webpack.optimize.CommonsChunkPlugin({
            async: 'common',
            minChunks: (module, count) => (
                count >= 2
            ),
        }),
        new HtmlWebpackPlugin({
            filename: path.join(process.cwd(), HTML_DIST, '/index.html'),
            template: path.join(process.cwd(), '/src/template.html'),
            favicon: path.join(process.cwd(), '/src/static/favicon.ico'),
            inject: false,
            minify: {
                caseSensitive: true,
                collapseWhitespace: true,
                minifyJS: true,
                minifyCSS: true
            },
            alwaysWriteToDisk: true
        }),
        new webpack.optimize.MinChunkSizePlugin({
            name: 'main',
            minChunkSize: 5120
        }),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            comments: false,
            compress: {
                warnings: false,
                drop_console: true,
                collapse_vars: true,
                reduce_vars: true,
            }
        }),
        new InjectManifest({
            globDirectory: 'app/dist',
            globPatterns: ['**/*.{html,js,css,ico}'],
            swDest: path.join('../sw.js'),
            swSrc: path.join(process.cwd(), '/src/sw.js')
        }),
    ],
    module: {
        rules: [
            {
                test: /(\.vue|\.js)$/,
                enforce: 'pre',
                exclude: /node_modules/,
                include: path.join(process.cwd() + '/src'),
                loader: 'eslint-loader',
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                include: [
                    path.join(process.cwd() + '/src'),
                ]
            },
            {
                test: /\.vue$/i,
                loader: 'vue-loader',
                options: {
                    extractCSS: true
                }
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader']
                })
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader']
                })
            },
            {
                test: /\.(jpe?g|png|gif)$/i,
                loader: 'url-loader',
                options: {
                    limit: '10000',
                    name: 'images/[name].[ext]'
                }
            }
        ]
    },
};
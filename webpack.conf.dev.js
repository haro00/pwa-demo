/**
 * 开发脚本
 */

// 静态资源打包位置
const STATIC_DIST = '/app/dist';
// html模板打包位置
const HTML_DIST = '/app/dist';
// html内引用静态资源的前缀
const STATIC_PREFIX = 'http://localhost:3000/dist/';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const styleLintPlugin = require('stylelint-webpack-plugin');

console.log('开发...');
module.exports = {
    entry: [
        path.join(process.cwd(), '/src/app.js'),
    ],
    output: {
        path: path.join(process.cwd(), STATIC_DIST),
        filename: '[name].js',
        publicPath: STATIC_PREFIX,
        chunkFilename: '[name].js'
    },
    devServer: {
        inline: true,
        contentBase: path.join(process.cwd(), STATIC_DIST)
    },
    resolve: {
        extensions: ['.js', '.vue'],
    },
    devtool: '#module-source-map',
    cache: true,
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            __SERVER__: true,
            __DEVELOPMENT__: true,
            __DEVTOOLS__: true,
            'process.env': {
                NODE_ENV: JSON.stringify('development')
            },
        }),
        new styleLintPlugin({
            configFile: path.join(__dirname, '/.stylelintrc'),
            quiet: false
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
        new HtmlWebpackHarddiskPlugin(),
    ],
    module: {
        rules: [
            {
                test: /(\.vue|\.js)$/,
                enforce: 'pre',
                include: path.join(process.cwd() + '/src'),
                exclude: /node_modules/,
                loader: 'eslint-loader',
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [
                    path.join(process.cwd() + '/src'),
                ]
            },
            {
                test: /\.vue$/i,
                loader: 'vue-loader',
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
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
    }
};
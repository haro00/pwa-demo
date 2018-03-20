
const STATIC_DIST = '/app/dist/static';
const STATIC_PREFIX = '/static/';
const path = require('path');
const webpack = require('webpack');
const {InjectManifest} = require('workbox-webpack-plugin');

console.log('pwa...');

module.exports = {
    entry: {
        sw: path.join(process.cwd(), '/src/sw.js')
    },
    output: {
        path: path.join(process.cwd(), STATIC_DIST),
        publicPath: STATIC_PREFIX,
        filename: '[name].js',
    },
    devtool: false,
    cache: false,
    plugins: [
        new webpack.DefinePlugin({
            __SERVER__: false,
            __DEVELOPMENT__: false,
            __DEVTOOLS__: false,
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            },
        }),
        new InjectManifest({
            globDirectory: 'app/dist',
            globPatterns: ['**/*.{html,js,css,ico}'],
            swDest: path.join('../sw.js'),
            swSrc: path.join(process.cwd(), '/src/sw.js')
        }),
    ],
};
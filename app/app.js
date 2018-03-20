const Koa = require('koa');
const body = require('koa-body');
const serve = require('koa-static');
const Router = require('./router');
const app = new Koa();
const DEBUG = app.env === 'development';

if (DEBUG) {
    const {devMiddleware, hotMiddleware} = require('koa-webpack-middleware');
    const webpack = require('webpack');
    const webpackConfig = require('../webpack.conf.dev.js');
    webpackConfig.entry.push(
        'webpack-hot-middleware/client',
        'webpack/hot/dev-server'
    );
    const compiler = webpack(webpackConfig);
    app.use(devMiddleware(compiler, {
        noInfo: true,
        quiet: false,
        watchOptions: {
            aggregateTimeout: 300
        },
        publicPath: webpackConfig.output.publicPath,
        // headers: { "X-Custom-Header": "yes" },
        stats: {
            colors: true
        }
    })).use(hotMiddleware(compiler));
} else {
    app.use(serve(__dirname + '/dist', {
        maxage: 31536000000,
        cache: true
    }));
}

// body
app.use(body());

// router
app.use(Router.routes());

// start
app.listen(3000);


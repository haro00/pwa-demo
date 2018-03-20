'use strict';

const fs = require('fs');
const path = require('path');
const router = require('koa-router');
const Router = router();

Router
    .get('/', (ctx, next) => {
        ctx.set('Content-Type', 'text/html; charset=utf-8');
        ctx.body = fs.readFileSync(path.join(process.cwd(), 'app/dist/index.html'), 'utf8');
    });

module.exports = Router;
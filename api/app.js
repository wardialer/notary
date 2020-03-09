require('dotenv').config();

const development = process.env.NODE_ENV === 'development';

const Koa = require('koa');
const cors = require('@koa/cors');
const Router = require('koa-router');
const logger = require('koa-pino-logger');
const bodyParser = require('koa-body');

const app = new Koa();
app.use(cors());

app.use(bodyParser({
  formidable: { uploadDir: './uploads' },
  formLimit: '5MB',
  multipart: true,
  urlencoded: true,
  multiple: false,
}));

app.use(logger({
  prettyPrint: development,
}));

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
});

const router = new Router({
  prefix: '/document',
});
require('./routes/document')({ router });

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;

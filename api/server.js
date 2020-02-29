const port = process.env.PORT || 3000;
const development = process.env.NODE_ENV === 'development';

const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-pino-logger');
const bodyParser = require('koa-body');
const Pug = require('koa-pug');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const app = new Koa();

const pug = new Pug({
  viewPath: './views',
  basedir: './views',
});

pug.use(app);

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

const server = app.listen(port);
console.log(`The magic happens on port ${port}`);

module.exports = server;

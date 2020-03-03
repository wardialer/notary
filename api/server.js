const port = process.env.PORT || 3000;
const development = process.env.NODE_ENV === 'development';

const cron = require('cron');
const Koa = require('koa');
const cors = require('@koa/cors');
const Router = require('koa-router');
const logger = require('koa-pino-logger');
const bodyParser = require('koa-body');
const mongoose = require('mongoose');

const bitcoinLib = require('./libs/bitcoin');

mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

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

const server = app.listen(port);
console.log(`The magic happens on port ${port}`);

// processing the payment requests every 10 minutes
const job = cron.job('*/10 * * * *', () => bitcoinLib.processPayments().then(console.log).catch(console.log));
job.start();

module.exports = server;

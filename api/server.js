const cron = require('cron');
const app = require('./app');
const bitcoinLib = require('./libs/bitcoin');

const port = process.env.PORT || 3000;
const server = app.listen(port);
console.info(`the magic happens on http://localhost:${port} 🚀`);

// processing the payment requests every 10 minutes
const job = cron.job('*/10 * * * *', () => bitcoinLib.processPayments().then(console.log).catch(console.log));
job.start();

module.exports = server;

const cron = require('cron');
const mongoose = require('mongoose');
const app = require('./app');
const bitcoinLib = require('./libs/bitcoin');

const databaseHost = process.env.DB_HOST || 'localhost';
const databaseName = process.env.DB_NAME || 'bitcoin-notary';

mongoose.connect(`mongodb://${databaseHost}/${databaseName}`, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', (error) => { throw new Error(error); });

const port = process.env.PORT || 3000;
const server = app.listen(port);
console.info(`the magic happens on http://localhost:${port} 🚀`);

// processing the payment requests every 10 minutes
const job = cron.job('*/10 * * * *', () => bitcoinLib.processPayments()
  .then(console.info)
  .catch((error) => { throw new Error(error); }));
job.start();

module.exports = server;

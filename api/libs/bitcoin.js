const explorers = require('bitcore-explorers');
const bitcore = require('bitcore-explorers/node_modules/bitcore-lib');

const keyString = process.env.PRIVATE_KEY;
const defaultAmount = process.env.DEFAULT_AMOUNT || 25000;

const seed = require('./seed');
const Document = require('../model/document');

const insight = new explorers.Insight();
const { HDPrivateKey } = bitcore;
const hdPrivateKey = new HDPrivateKey(keyString);
const { privateKey } = hdPrivateKey.derive(0);

async function generateFunding() {
  const sequence = await seed.get();
  const derived = hdPrivateKey.derive(sequence);
  const { hdPublicKey } = derived;

  const receiver = hdPublicKey.publicKey.toAddress();

  return ({
    address: receiver,
    sequence,
    amount: defaultAmount, // in satoshis
  });
}

function getUtxos(address) {
  return new Promise((resolve, reject) => {
    insight.getUnspentUtxos(address, (error, utxos) => {
      if (error) {
        reject(error);
      } else {
        resolve(utxos);
      }
    });
  });
}

function broadcast(transaction) {
  return new Promise((resolve, reject) => {
    insight.broadcast(transaction, (error, transactionId) => {
      if (error) {
        reject(error);
      } else {
        resolve(transactionId);
      }
    });
  });
}

function managePayment(address) {
  const fee = 667;
  const promises = [];

  promises.push(Document.findOne({ address }));
  promises.push(getUtxos(address));

  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then((results) => {
        const document = results[0];
        const utxos = results[1];

        const derived = hdPrivateKey.derive(document.sequence);
        const total = utxos
          .map((element) => element.satoshis)
          .reduce((accumulator, element) => accumulator + element, 0);

        if (document.transactionId) {
          resolve(`Notarized in transaction ${document.transactionId}`);
        } else if (total >= document.amount) {
          const transaction = new bitcore.Transaction()
            .from(utxos)
            .to(privateKey.toAddress(), total - fee)
            .addData(`Notarized: ${document.hash}`)
            .fee(fee)
            .sign(derived.privateKey);

          try {
            transaction.serialize();
          } catch (error) {
            reject(error);
          }

          broadcast(transaction)
            .then((transactionId) => {
              Document.findOneAndUpdate({ address }, { transaction, transactionId })
                .then(() => resolve(`Notarized in transaction ${transactionId}`))
                .catch(reject);
            })
            .catch(reject);
        } else {
          resolve(`A payment of ${document.amount} satoshis to ${address} is required`);
        }
      })
      .catch(reject);
  });
}

function createUri(amount, address) {
  const uriString = new bitcore.URI({
    amount,
    address,
  });

  return uriString;
}

async function processPayments() {
  const documents = await Document.find({ transactionId: { $exists: false } });

  const promises = documents
    .map((document) => managePayment(document.address));

  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then(resolve)
      .catch(reject);
  });
}

module.exports = {
  generateFunding,
  managePayment,
  createUri,
  processPayments,
};

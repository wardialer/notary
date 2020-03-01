const explorers = require('bitcore-explorers');

const explorersMod = require.cache[require.resolve('bitcore-explorers')];
const bitcore = explorersMod.require('bitcore-lib');

const seed = require('./seed');
const Document = require('../model/document');

const insight = new explorers.Insight();
const { HDPrivateKey } = bitcore;
const hdPrivateKey = new HDPrivateKey('xprv9s21ZrQH143K3bydobdBf4fHAE4AWuJXd8miZfUfokcLSxSRSXuDrvyMmVsJXM7qdLcVuAM9kkirDwpaPteGJTrCFicA2auFLEc8teW6v6d');
const { privateKey } = hdPrivateKey.derive(0);

async function generateFunding() {
  const sequence = await seed.get();
  const derived = hdPrivateKey.derive(sequence);
  const { hdPublicKey } = derived;

  const receiver = hdPublicKey.publicKey.toAddress();

  return ({
    address: receiver,
    sequence,
    amount: 25000, // in satoshis
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
          resolve(`Please make a payment of ${document.amount} satoshis to ${address}`);
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

module.exports = {
  generateFunding,
  managePayment,
  createUri,
};

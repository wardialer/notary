const crypto = require('crypto');
const fs = require('fs');
const explorers = require('bitcore-explorers');

const explorersMod = require.cache[require.resolve('bitcore-explorers')];
const bitcore = explorersMod.require('bitcore-lib');

const { HDPrivateKey } = bitcore;

const Model = require('../model/document');
// const Address = require('../model/address');
const seed = require('../libs/seed');

const algo = 'sha256';
const hdPrivateKey = new HDPrivateKey('xprv9s21ZrQH143K3bydobdBf4fHAE4AWuJXd8miZfUfokcLSxSRSXuDrvyMmVsJXM7qdLcVuAM9kkirDwpaPteGJTrCFicA2auFLEc8teW6v6d');
const { privateKey } = hdPrivateKey.derive(0);
const insight = new explorers.Insight();

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

function managePayment(address) {
  const filter = { address };

  return new Promise((resolve, reject) => {
    Model.findOne(filter)
      .then((doc) => {
        const derived = hdPrivateKey.derive(doc.sequence);

        insight.getUnspentUtxos(address, (err, utxos) => {
          if (err) {
            reject(err);
          } else {
            const total = utxos
              .map((e) => e.satoshis)
              .reduce((a, c) => a + c, +0);

            // TODO: do not repeat the TX if already done!
            if (doc.transactionId) {
              resolve(`Notarized in transaction ${doc.transactionId}`);
            } else if (total >= doc.amount) {
              const tx = new bitcore.Transaction()
                .from(utxos)
                .to(privateKey.toAddress(), total - 700)
                .addData(`Notarized: ${doc.hash}`)
                .fee(700)
                .sign(derived.privateKey);

              console.log(tx.serialize());


              Model.findOneAndUpdate(filter, { transaction: tx })
                .then(() => {
                  insight.broadcast(tx, (e, t) => {
                    if (e) {
                      reject(e);
                    } else {
                      Model.findOneAndUpdate(filter, { transactionId: t })
                        .then(() => resolve(t))
                        .catch(resolve);
                    }
                  });
                })
                .catch(reject);
            } else {
              resolve('Still Waiting');
            }
          }
        });
      })
      .catch(reject);
  });
}
/*
function fileHandler(file) {
  const shasum = crypto.createHash(algo);
  const stream = fs.ReadStream(file.path);


  return new Promise((resolve, reject) => {
    stream.on('data', (data) => {
      shasum.update(data);
    });

    stream.on('end', async () => {
      const hash = shasum.digest('hex');

      try {
        const funding = await generateFunding();

        const doc = new Model({
          hash,
          fileName: file.name,
          sequence: funding.sequence,
          amount: funding.amount,
          address: funding.address,
        });

        doc.save((err, document) => {
          if (err) {
            reject(err);
          } else {
            resolve(document);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}
*/
function generateHash(file) {
  const shasum = crypto.createHash(algo);


  return new Promise((resolve, reject) => {
    try {
      const stream = fs.ReadStream(file.path);

      stream.on('data', (data) => {
        shasum.update(data);
      });

      stream.on('end', async () => {
        const hash = shasum.digest('hex');

        resolve(hash);
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function saveDocument(hash, file) {
  const funding = await generateFunding();

  return new Promise((resolve, reject) => {
    try {
      const doc = new Model({
        hash,
        fileName: file.name,
        sequence: funding.sequence,
        amount: funding.amount,
        address: funding.address,
      });

      doc.save((err, document) => {
        if (err) {
          reject(err);
        } else {
          resolve(document);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = ({ router }) => {
  router.get('/', async (ctx) => {
    await ctx.render('file_upload');
  });

  router.post('/', async (ctx) => {
    const { files } = ctx.request;
    const file = files.document;

    const hash = await generateHash(file);

    const document = await Model.findOne({ hash });

    if (document !== null) {
      ctx.body = document;
    } else {
      const result = await saveDocument(hash, file);

      fs.unlink(file.path);

      // https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl= 12kQMUkB9QJu9X5JP9H9M2qMUmrGtDakkV
      // ctx.body = JSON.stringify(`Transaction created. ${result.fundingTransaction}`);

      const uriString = new bitcore.URI({
        amount: result.amount,
        address: result.address,
      });

      await ctx.render('qr_code', { string: uriString.toString() });
    }
  });


  router.get('/:address', async (ctx) => {
    const { address } = ctx.params;

    try {
      const transaction = await managePayment(address);
      ctx.body = transaction;
    } catch (e) {
      ctx.body = e;
    }
  });
};

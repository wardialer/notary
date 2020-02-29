const crypto = require('crypto');
const fs = require('fs');
const explorers = require('bitcore-explorers');

const explorersMod = require.cache[require.resolve('bitcore-explorers')];
const bitcore = explorersMod.require('bitcore-lib');

const { HDPrivateKey } = bitcore;

// bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;

const Model = require('../model/document');
const Address = require('../model/address');
const seed = require('../libs/seed');

const algo = 'sha256';
const hdPrivateKey = new HDPrivateKey('xprv9s21ZrQH143K3bydobdBf4fHAE4AWuJXd8miZfUfokcLSxSRSXuDrvyMmVsJXM7qdLcVuAM9kkirDwpaPteGJTrCFicA2auFLEc8teW6v6d');
const { privateKey } = hdPrivateKey.derive(0);
const insight = new explorers.Insight();

async function generateTransaction(hash) {
  const address = privateKey.toAddress();

  const s = await seed.get();
  const receiver = hdPrivateKey.derive(1).derive(1).derive(s).privateKey.toAddress();

  const a = new Address({
    address: receiver,

  })


  return new Promise((resolve, reject) => {
    insight.getUnspentUtxos(address, (err, utxos) => {
      if (err || utxos.length === 0) {
        reject(err || 'insufficient funds');
      } else {
        console.log({
          utxos,
        });


        const totalAmount = utxos
          .map((utxo) => utxo.satoshis)
          .reduce((accumulator, current) => accumulator + current, +0);

        const amount = totalAmount - 667;

        const transaction = new bitcore.Transaction()
          .from(utxos)
          .change(address)
          .to(receiver, amount)
          .addData(hash)
          .sign(privateKey);

        try {
          transaction.serialize();
          resolve(transaction.toObject());
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}

async function generateFunding() {
  const s = await seed.get();
  const receiver = hdPrivateKey.derive(1).derive(1).derive(s).privateKey.toAddress();

  return ({
    address: receiver,
    amount: 25000, // in satoshis
  });
}

function fileHandler(file) {
  const shasum = crypto.createHash(algo);
  const stream = fs.ReadStream(file.path);


  return new Promise((resolve, reject) => {
    stream.on('data', (data) => { shasum.update(data); });

    stream.on('end', async () => {
      const hash = shasum.digest('hex');

      try {
        const transaction = await generateTransaction(hash);
        const funding = await generateFunding();

        const doc = new Model({
          hash,
          fileName: file.name,
          transaction,
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

module.exports = ({ router }) => {
  router.get('/', async (ctx) => {
    await ctx.render('file_upload');
  });

  router.post('/', async (ctx) => {
    const { files } = ctx.request;
    const file = files.document;

    const result = await fileHandler(file);
    fs.unlink(file.path);

    // https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl= 12kQMUkB9QJu9X5JP9H9M2qMUmrGtDakkV
    // ctx.body = JSON.stringify(`Transaction created. ${result.fundingTransaction}`);

    const uriString = new bitcore.URI({
      amount: result.amount,
      address: result.address,
    });

    await ctx.render('qr_code', { string: uriString.toString() });
  });


  router.get('/listener', async (ctx) => {
    const address = '1FADueLAsFmSi1s92SoTgh94u2H49bYagi';
    const doc = await Model.findOne({ address });


    async function managePayment(result) {
      insight.getUnspentUtxos(result.address, (err, utxos) => {
        if (err) {
          ctx.body = err;
          console.log(err);
        } else {
          const totalAmount = utxos
            .map((utxo) => utxo.satoshis)
            .reduce((accumulator, current) => accumulator + current, +0);

          if (totalAmount >= result.amount) {
            const transaction = new bitcore.Transaction(result.transaction);
            insight.broadcast(transaction, (err2, returnedTxId) => {
              if (err2) {
                ctx.body = err2;
                console.log(err2);
              } else {
                ctx.body = `Transaction ID: ${returnedTxId}`;
                console.log(`Transaction ID: ${returnedTxId}`);
              }
            });
          } else {
            ctx.body = 'waiting payment';
            console.log('waiting payment');
          }
        }
      });
    }

    await managePayment(doc);
    ctx.body = 'ok?';
  });
};

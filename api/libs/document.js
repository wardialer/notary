const bitcoinLib = require('./bitcoin');
const Document = require('../model/document');

async function save(hash, file) {
  const funding = await bitcoinLib.generateFunding();

  return new Promise((resolve, reject) => {
    try {
      const doc = new Document({
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

module.exports = {
  save,
};

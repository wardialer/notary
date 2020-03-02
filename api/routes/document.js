const fs = require('fs');

const Document = require('../model/document');
const hashLib = require('../libs/hash');
const documentLib = require('../libs/document');

module.exports = ({ router }) => {
  router.get('/', async (ctx) => {
    const results = await Document.find();

    ctx.body = results;
  });

  router.post('/', async (ctx) => {
    const { files } = ctx.request;
    const file = files.document;

    const hash = await hashLib.generateHash(file);
    const document = await Document.findOne({ hash });

    let result;

    if (document !== null) {
      result = document;
    } else {
      result = await documentLib.save(hash, file);

      /*
      const uriString = bitcoinLib.createUri(result.amount, result.address);
      await ctx.render('qr_code', { string: uriString.toString() });
      */
    }

    // console.log(bitcoinLib.createUri(result.amount, result.address));
    fs.unlink(file.path);
    ctx.body = result;
  });

  router.get('/:hash', async (ctx) => {
    const { hash } = ctx.params;
    const result = await Document.findOne({ hash });

    ctx.body = result;
  });
};

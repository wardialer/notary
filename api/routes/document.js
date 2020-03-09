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
    }

    fs.unlink(file.path, (err) => {
      if (err) {
        ctx.throw(500, 'FS problem', { err });
      }
    });

    ctx.body = result;
  });

  router.get('/:hash', async (ctx) => {
    const { hash } = ctx.params;
    const regex = /^[a-f0-9]{64}$/;
    if (regex.test(hash)) {
      const result = await Document.findOne({ hash });
      ctx.body = result;
    } else {
      ctx.throw(400, 'Invalid Hash');
    }
  });
};

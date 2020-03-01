const crypto = require('crypto');
const fs = require('fs');

const algorithm = 'sha256';

function generateHash(file) {
  const shasum = crypto.createHash(algorithm);

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

module.exports = {
  generateHash,
};

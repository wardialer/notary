const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  fileName: String,
  hash: String,
  address: String,
  amount: Number,
  transaction: Object,
  transactionId: String,
});

module.exports = mongoose.model('Document', documentSchema);

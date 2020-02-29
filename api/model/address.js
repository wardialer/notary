const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  address: String,
  seed: Number,
});

module.exports = mongoose.model('Address', addressSchema);

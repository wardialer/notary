const mongoose = require('mongoose');

const seedSchema = new mongoose.Schema({
  currentValue: { type: Number, default: 0 },
});

module.exports = mongoose.model('Seed', seedSchema);

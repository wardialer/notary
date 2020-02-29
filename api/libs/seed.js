const Seed = require('../model/seed');

async function get() {
  const seed = await Seed.findOne();

  if (seed === null) {
    const newSeed = new Seed({ currentValue: 1 });
    await newSeed.save();

    return newSeed.currentValue;
  }
  seed.currentValue += 1;

  await seed.save();

  return seed.currentValue;
}

module.exports = { get };

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const categories = [
  'Classic Chew',
  'Blueberry Chew',
  'Strawberry Chew',
  'Turmeric Chew',
];

async function seed() {
  await mongoose.connect(process.env.mongoConnectionString);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const col = db.collection('categories');

  // Drop the stale slug index if it exists
  try {
    await col.dropIndex('slug_1');
    console.log('Dropped stale slug_1 index');
  } catch (e) {
    console.log('No slug_1 index to drop (OK)');
  }

  // Insert categories (skip duplicates)
  for (const name of categories) {
    try {
      await col.updateOne(
        { name },
        { $setOnInsert: { name, isActive: true, createdAt: new Date(), updatedAt: new Date() } },
        { upsert: true }
      );
      console.log(`Upserted: ${name}`);
    } catch (e) {
      console.log(`Skipped ${name}: ${e.message}`);
    }
  }

  console.log('Done!');
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });

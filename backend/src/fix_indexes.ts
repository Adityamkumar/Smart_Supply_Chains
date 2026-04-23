import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './.env' });

async function fixIndexes() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in environment");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      console.error("Database not found");
      return;
    }
    const collection = db.collection('ratings');

    console.log("Existing indexes:");
    const indexes = await collection.indexes();
    console.log(indexes);

    console.log("Dropping old unique index 'volunteerId_1_voterId_1'...");
    try {
      await collection.dropIndex('volunteerId_1_voterId_1');
      console.log("Dropped 'volunteerId_1_voterId_1'");
    } catch (e) {
      console.log("Index 'volunteerId_1_voterId_1' not found or already dropped.");
    }

    console.log("Dropping all other indexes except _id (to let Mongoose recreate correctly)...");
    // We don't want to drop _id, and we might have others.
    // Actually, just dropping the conflicting one is often enough, but let's be clean.
    // await collection.dropIndexes(); // This drops all but _id.

    console.log("Indexes now:");
    console.log(await collection.indexes());

    await mongoose.disconnect();
    console.log("Disconnected");
  } catch (err) {
    console.error("Error:", err);
  }
}

fixIndexes();

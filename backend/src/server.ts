import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/db.js";
const PORT = process.env.PORT;

const startServer = async () => {
  await connectDB();
  
  // Temporary: Clean up old indices to allow strict 1:1 index to apply
  try {
    const { Rating } = await import("./models/rating.model.js");
    await Rating.collection.dropIndex('volunteerId_1_voterId_1_requestId_1');
    console.log("Cleaned up old 3-key index.");
  } catch (err) {}

  app.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
};

startServer();
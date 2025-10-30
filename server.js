const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://password-manager-usfv-7ybt3btoi-shantannus-projects.vercel.app"
  ],
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

const PORT = process.env.PORT || 5000
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

let db, collection;

// ✅ Connect to MongoDB Atlas
async function connectDB() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    collection = db.collection("passwords");

    console.log(`✅ MongoDB Connected to: ${dbName}`);

    const collections = await db.listCollections().toArray();
    console.log("📂 Existing collections:", collections.map(c => c.name));

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}
connectDB();


// ✅ GET all passwords
app.get("/", async (req, res) => {
  try {
    const passwords = await collection.find({}).toArray();
    res.json(passwords);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch passwords" });
  }
});


// ✅ POST a new password
app.post("/", async (req, res) => {
  const data = req.body;
    console.log("📥 Received data from frontend:", data); // ADD THIS LINE

  if (!data.site || !data.username || !data.password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const result = await collection.insertOne(data);
    res.json({ message: "Password saved", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Failed to insert password" });
  }
});


// ✅ DELETE a password by id
app.delete("/", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Missing id" });

  try {
    const result = await collection.deleteOne({ id });
    if (result.deletedCount > 0) {
      res.json({ message: "Password deleted" });
    } else {
      res.status(404).json({ error: "Password not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to delete password" });
  }
});


// ✅ Start the server
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);

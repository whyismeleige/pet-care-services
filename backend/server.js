require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5000;

let db;
const mongoClient = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
  try {
    await mongoClient.connect();
    db = mongoClient.db("petcare");
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
}

connectDB();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ==============================================
// AUTH ROUTES
// ==============================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const usersCollection = db.collection("users");
    const existing = await usersCollection.findOne({ email });

    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: { _id: result.insertedId, name, email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==============================================
// SERVICE ROUTES (CRUD)
// ==============================================

function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

app.get("/api/services", async (req, res) => {
  try {
    const servicesCollection = db.collection("services");
    const services = await servicesCollection.find({}).toArray();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/services/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const servicesCollection = db.collection("services");
    const service = await servicesCollection.findOne({ _id: new ObjectId(id) });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/services", verifyToken, async (req, res) => {
  try {
    const { name, description, price, duration, category } = req.body;

    if (!name || !description || !price || !duration || !category) {
      return res.status(400).json({ error: "All fields required" });
    }

    const servicesCollection = db.collection("services");

    const newService = {
      name,
      description,
      price: parseFloat(price),
      duration,
      category,
      userId: new ObjectId(req.userId),
      createdAt: new Date(),
    };

    const result = await servicesCollection.insertOne(newService);

    res.status(201).json({ _id: result.insertedId, ...newService });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/services/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, category } = req.body;

    const servicesCollection = db.collection("services");
    const service = await servicesCollection.findOne({ _id: new ObjectId(id) });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    if (service.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updates = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (price) updates.price = parseFloat(price);
    if (duration) updates.duration = duration;
    if (category) updates.category = category;

    await servicesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    const updated = await servicesCollection.findOne({ _id: new ObjectId(id) });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/services/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const servicesCollection = db.collection("services");
    const service = await servicesCollection.findOne({ _id: new ObjectId(id) });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    if (service.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    await servicesCollection.deleteOne({ _id: new ObjectId(id) });

    res.json({ message: "Service deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
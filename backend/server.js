require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 8080;

// MongoDB Client
let db;
const mongoClient = new MongoClient(process.env.MONGODB_URI);

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoClient.connect();
    db = mongoClient.db(process.env.DB_NAME || "travlog");
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
}

connectDB();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==============================================
// HELPER FUNCTIONS
// ==============================================

function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function getRandomAvatar() {
  const styles = ["adventurer", "big-smile", "fun-emoji", "lorelei", "micah"];
  const style = styles[Math.floor(Math.random() * styles.length)];
  const seed = Date.now() + Math.random();
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
}

// ==============================================
// AUTH ROUTES
// ==============================================

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const usersCollection = db.collection("users");
    
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const newUser = {
      name,
      email,
      password: hashedPassword,
      avatar: getRandomAvatar(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    const userId = result.insertedId;

    const token = createToken(userId);
    res.cookie("token", token, getCookieOptions());

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: userId,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = createToken(user._id);
    res.cookie("token", token, getCookieOptions());

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET PROFILE
app.get("/api/auth/profile", async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ _id: new ObjectId(payload.id) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGOUT
app.post("/api/auth/logout", async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==============================================
// TRAVEL LOG ROUTES (ALL REQUIRE AUTH)
// ==============================================

// Middleware to check auth for travel logs
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ _id: new ObjectId(payload.id) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.userId = user._id;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// CREATE TRAVEL LOG
app.post("/api/travel-logs", requireAuth, async (req, res) => {
  try {
    const { title, location, description, travelDate, imageUrl } = req.body;

    if (!title || !location || !description || !travelDate) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    const logsCollection = db.collection("travel-logs");

    const newLog = {
      user: req.userId,
      title,
      location,
      description,
      travelDate: new Date(travelDate),
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await logsCollection.insertOne(newLog);

    res.status(201).json({
      message: "Travel log created",
      data: { _id: result.insertedId, ...newLog },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ALL TRAVEL LOGS FOR USER
app.get("/api/travel-logs", requireAuth, async (req, res) => {
  try {
    const logsCollection = db.collection("travel-logs");

    const logs = await logsCollection
      .find({ user: req.userId })
      .sort({ travelDate: -1 })
      .toArray();

    res.status(200).json({
      message: "Travel logs retrieved",
      data: logs,
      count: logs.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET SINGLE TRAVEL LOG
app.get("/api/travel-logs/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const logsCollection = db.collection("travel-logs");
    const log = await logsCollection.findOne({ _id: new ObjectId(id) });

    if (!log) {
      return res.status(404).json({ error: "Travel log not found" });
    }

    if (log.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json({
      message: "Travel log retrieved",
      data: log,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE TRAVEL LOG
app.put("/api/travel-logs/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location, description, travelDate, imageUrl } = req.body;

    const logsCollection = db.collection("travel-logs");
    const log = await logsCollection.findOne({ _id: new ObjectId(id) });

    if (!log) {
      return res.status(404).json({ error: "Travel log not found" });
    }

    if (log.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updates = {
      updatedAt: new Date(),
    };

    if (title) updates.title = title;
    if (location) updates.location = location;
    if (description) updates.description = description;
    if (travelDate) updates.travelDate = new Date(travelDate);
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;

    await logsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    const updatedLog = await logsCollection.findOne({ _id: new ObjectId(id) });

    res.status(200).json({
      message: "Travel log updated",
      data: updatedLog,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE TRAVEL LOG
app.delete("/api/travel-logs/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const logsCollection = db.collection("travel-logs");
    const log = await logsCollection.findOne({ _id: new ObjectId(id) });

    if (!log) {
      return res.status(404).json({ error: "Travel log not found" });
    }

    if (log.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: "Access denied" });
    }

    await logsCollection.deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({
      message: "Travel log deleted",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==============================================
// HEALTH CHECK
// ==============================================

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Backend API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on PORT: ${PORT}`);
});
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
// MIDDLEWARE
// ==============================================

function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Helper to create a notification
async function createNotification(userId, type, title, message, relatedId = null) {
  try {
    await db.collection("notifications").insertOne({
      userId: new ObjectId(userId),
      type,
      title,
      message,
      relatedId,
      read: false,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error("Notification error:", e);
  }
}

// ==============================================
// AUTH ROUTES
// ==============================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields required" });

    const usersCollection = db.collection("users");
    const existing = await usersCollection.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await usersCollection.insertOne({
      name, email, password: hashedPassword, createdAt: new Date(),
    });

    const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { _id: result.insertedId, name, email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "All fields required" });

    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==============================================
// SERVICE ROUTES (CRUD)
// ==============================================

app.get("/api/services", async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sortBy } = req.query;
    const servicesCollection = db.collection("services");

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category && category !== "All") query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    let sort = { createdAt: -1 };
    if (sortBy === "price_asc") sort = { price: 1 };
    if (sortBy === "price_desc") sort = { price: -1 };
    if (sortBy === "rating") sort = { avgRating: -1 };

    const services = await servicesCollection.find(query).sort(sort).toArray();

    // Attach avg ratings
    const reviewsCollection = db.collection("reviews");
    const enriched = await Promise.all(
      services.map(async (s) => {
        const reviews = await reviewsCollection.find({ serviceId: s._id }).toArray();
        const avgRating = reviews.length
          ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
          : 0;
        return { ...s, avgRating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length };
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/services/user/my-services", verifyToken, async (req, res) => {
  try {
    const servicesCollection = db.collection("services");
    const services = await servicesCollection
      .find({ userId: new ObjectId(req.userId) })
      .toArray();
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
    if (!service) return res.status(404).json({ error: "Service not found" });

    const reviews = await db.collection("reviews").find({ serviceId: new ObjectId(id) }).toArray();
    const avgRating = reviews.length
      ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      : 0;

    res.json({ ...service, avgRating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/services", verifyToken, async (req, res) => {
  try {
    const { name, description, price, duration, category } = req.body;
    if (!name || !description || !price || !duration || !category)
      return res.status(400).json({ error: "All fields required" });

    const newService = {
      name, description,
      price: parseFloat(price),
      duration, category,
      userId: new ObjectId(req.userId),
      createdAt: new Date(),
    };

    const result = await db.collection("services").insertOne(newService);
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

    if (!service) return res.status(404).json({ error: "Service not found" });
    if (service.userId.toString() !== req.userId.toString())
      return res.status(403).json({ error: "Access denied" });

    const updates = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (price) updates.price = parseFloat(price);
    if (duration) updates.duration = duration;
    if (category) updates.category = category;

    await servicesCollection.updateOne({ _id: new ObjectId(id) }, { $set: updates });
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

    if (!service) return res.status(404).json({ error: "Service not found" });
    if (service.userId.toString() !== req.userId.toString())
      return res.status(403).json({ error: "Access denied" });

    await servicesCollection.deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Service deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==============================================
// BOOKING ROUTES
// ==============================================

// Create a booking
app.post("/api/bookings", verifyToken, async (req, res) => {
  try {
    const { serviceId, date, time, notes } = req.body;
    if (!serviceId || !date || !time)
      return res.status(400).json({ error: "Service, date and time are required" });

    const service = await db.collection("services").findOne({ _id: new ObjectId(serviceId) });
    if (!service) return res.status(404).json({ error: "Service not found" });

    if (service.userId.toString() === req.userId.toString())
      return res.status(400).json({ error: "You cannot book your own service" });

    // Lookup client name
    const client = await db.collection("users").findOne({ _id: new ObjectId(req.userId) });
    const provider = await db.collection("users").findOne({ _id: service.userId });

    const booking = {
      serviceId: new ObjectId(serviceId),
      serviceName: service.name,
      serviceCategory: service.category,
      clientId: new ObjectId(req.userId),
      clientName: client.name,
      providerId: service.userId,
      providerName: provider.name,
      price: service.price,
      duration: service.duration,
      date,
      time,
      notes: notes || "",
      status: "pending", // pending | confirmed | completed | cancelled
      createdAt: new Date(),
    };

    const result = await db.collection("bookings").insertOne(booking);

    // Notify provider
    await createNotification(
      service.userId.toString(),
      "booking_new",
      "New Booking Request",
      `${client.name} has requested to book "${service.name}" on ${date} at ${time}`,
      result.insertedId.toString()
    );

    res.status(201).json({ _id: result.insertedId, ...booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bookings I made (as client)
app.get("/api/bookings/my-bookings", verifyToken, async (req, res) => {
  try {
    const bookings = await db
      .collection("bookings")
      .find({ clientId: new ObjectId(req.userId) })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get incoming bookings for my services (as provider)
app.get("/api/bookings/provider-bookings", verifyToken, async (req, res) => {
  try {
    const bookings = await db
      .collection("bookings")
      .find({ providerId: new ObjectId(req.userId) })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking status
app.put("/api/bookings/:id/status", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: "Invalid status" });

    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(id) });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Only provider can confirm/complete; client can cancel
    const isProvider = booking.providerId.toString() === req.userId.toString();
    const isClient = booking.clientId.toString() === req.userId.toString();

    if (!isProvider && !isClient)
      return res.status(403).json({ error: "Access denied" });

    if ((status === "confirmed" || status === "completed") && !isProvider)
      return res.status(403).json({ error: "Only provider can confirm or complete" });

    await db.collection("bookings").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    // Send notifications
    const notifyUserId = isProvider ? booking.clientId.toString() : booking.providerId.toString();
    const statusMessages = {
      confirmed: `Your booking for "${booking.serviceName}" on ${booking.date} has been confirmed! 🎉`,
      completed: `Your booking for "${booking.serviceName}" has been marked as completed. Please leave a review!`,
      cancelled: `Your booking for "${booking.serviceName}" on ${booking.date} has been cancelled.`,
    };
    const statusTitles = {
      confirmed: "Booking Confirmed",
      completed: "Booking Completed",
      cancelled: "Booking Cancelled",
    };

    await createNotification(notifyUserId, `booking_${status}`, statusTitles[status], statusMessages[status], id);

    const updated = await db.collection("bookings").findOne({ _id: new ObjectId(id) });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==============================================
// REVIEWS ROUTES
// ==============================================

// Submit a review
app.post("/api/reviews", verifyToken, async (req, res) => {
  try {
    const { serviceId, rating, comment } = req.body;
    if (!serviceId || !rating)
      return res.status(400).json({ error: "Service and rating required" });
    if (rating < 1 || rating > 5)
      return res.status(400).json({ error: "Rating must be 1-5" });

    const service = await db.collection("services").findOne({ _id: new ObjectId(serviceId) });
    if (!service) return res.status(404).json({ error: "Service not found" });

    // Check if user already reviewed
    const existing = await db.collection("reviews").findOne({
      serviceId: new ObjectId(serviceId),
      userId: new ObjectId(req.userId),
    });
    if (existing)
      return res.status(400).json({ error: "You have already reviewed this service" });

    const reviewer = await db.collection("users").findOne({ _id: new ObjectId(req.userId) });

    const review = {
      serviceId: new ObjectId(serviceId),
      userId: new ObjectId(req.userId),
      reviewerName: reviewer.name,
      rating: parseInt(rating),
      comment: comment || "",
      createdAt: new Date(),
    };

    const result = await db.collection("reviews").insertOne(review);

    // Notify service owner
    await createNotification(
      service.userId.toString(),
      "review_new",
      "New Review Received",
      `${reviewer.name} left a ${rating}⭐ review on your service "${service.name}"`,
      serviceId
    );

    res.status(201).json({ _id: result.insertedId, ...review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reviews for a service
app.get("/api/reviews/:serviceId", async (req, res) => {
  try {
    const reviews = await db
      .collection("reviews")
      .find({ serviceId: new ObjectId(req.params.serviceId) })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==============================================
// MESSAGING ROUTES
// ==============================================

// Start or get existing conversation between two users about a service
app.post("/api/conversations", verifyToken, async (req, res) => {
  try {
    const { otherUserId, serviceId } = req.body;
    if (!otherUserId) return res.status(400).json({ error: "otherUserId required" });

    const myId = req.userId;
    const participants = [myId, otherUserId].sort();

    let conversation = await db.collection("conversations").findOne({
      participants: { $all: participants.map((p) => p.toString()) },
      ...(serviceId ? { serviceId: serviceId.toString() } : {}),
    });

    if (!conversation) {
      const otherUser = await db.collection("users").findOne({ _id: new ObjectId(otherUserId) });
      const me = await db.collection("users").findOne({ _id: new ObjectId(myId) });
      const service = serviceId
        ? await db.collection("services").findOne({ _id: new ObjectId(serviceId) })
        : null;

      const newConv = {
        participants: participants.map((p) => p.toString()),
        participantNames: {
          [myId]: me.name,
          [otherUserId]: otherUser.name,
        },
        serviceId: serviceId ? serviceId.toString() : null,
        serviceName: service ? service.name : null,
        lastMessage: null,
        lastMessageAt: new Date(),
        createdAt: new Date(),
      };
      const result = await db.collection("conversations").insertOne(newConv);
      conversation = { _id: result.insertedId, ...newConv };
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all my conversations
app.get("/api/conversations", verifyToken, async (req, res) => {
  try {
    const conversations = await db
      .collection("conversations")
      .find({ participants: req.userId.toString() })
      .sort({ lastMessageAt: -1 })
      .toArray();
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages in a conversation
app.get("/api/messages/:conversationId", verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conv = await db.collection("conversations").findOne({ _id: new ObjectId(conversationId) });
    if (!conv) return res.status(404).json({ error: "Conversation not found" });
    if (!conv.participants.includes(req.userId.toString()))
      return res.status(403).json({ error: "Access denied" });

    const messages = await db
      .collection("messages")
      .find({ conversationId: new ObjectId(conversationId) })
      .sort({ createdAt: 1 })
      .toArray();

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send a message
app.post("/api/messages", verifyToken, async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    if (!conversationId || !text)
      return res.status(400).json({ error: "conversationId and text required" });

    const conv = await db.collection("conversations").findOne({ _id: new ObjectId(conversationId) });
    if (!conv) return res.status(404).json({ error: "Conversation not found" });
    if (!conv.participants.includes(req.userId.toString()))
      return res.status(403).json({ error: "Access denied" });

    const sender = await db.collection("users").findOne({ _id: new ObjectId(req.userId) });

    const message = {
      conversationId: new ObjectId(conversationId),
      senderId: req.userId.toString(),
      senderName: sender.name,
      text,
      createdAt: new Date(),
    };

    await db.collection("messages").insertOne(message);

    // Update conversation's last message
    await db.collection("conversations").updateOne(
      { _id: new ObjectId(conversationId) },
      { $set: { lastMessage: text, lastMessageAt: new Date() } }
    );

    // Notify the other participant
    const otherUserId = conv.participants.find((p) => p !== req.userId.toString());
    if (otherUserId) {
      await createNotification(
        otherUserId,
        "message_new",
        "New Message",
        `${sender.name} sent you a message${conv.serviceName ? ` about "${conv.serviceName}"` : ""}`,
        conversationId
      );
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==============================================
// NOTIFICATION ROUTES
// ==============================================

// Get my notifications
app.get("/api/notifications", verifyToken, async (req, res) => {
  try {
    const notifications = await db
      .collection("notifications")
      .find({ userId: new ObjectId(req.userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark a single notification as read
app.put("/api/notifications/:id/read", verifyToken, async (req, res) => {
  try {
    await db.collection("notifications").updateOne(
      { _id: new ObjectId(req.params.id), userId: new ObjectId(req.userId) },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read
app.put("/api/notifications/read-all", verifyToken, async (req, res) => {
  try {
    await db.collection("notifications").updateMany(
      { userId: new ObjectId(req.userId), read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==============================================
// START SERVER
// ==============================================

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
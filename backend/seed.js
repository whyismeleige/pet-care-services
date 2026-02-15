require("dotenv").config();
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI in .env");
  process.exit(1);
}

// ==============================================
// SEED DATA
// ==============================================

const INDIAN_USERS = [
  ["Aarav Patel", "aarav.patel"],
  ["Vivaan Singh", "vivaan.singh"],
  ["Aditya Sharma", "aditya.sharma"],
  ["Vihaan Gupta", "vihaan.gupta"],
  ["Arjun Kumar", "arjun.kumar"],
  ["Sai Iyer", "sai.iyer"],
  ["Reyansh Reddy", "reyansh.reddy"],
  ["Krishna Menon", "krishna.menon"],
  ["Ishaan Nair", "ishaan.nair"],
  ["Shaurya Verma", "shaurya.verma"],
];

const PET_SERVICES = [
  {
    category: "Dog Walking",
    services: [
      {
        name: "Morning Dog Walk",
        description: "Start your dog's day right with a refreshing morning walk. Perfect for energetic dogs who need exercise before you head to work.",
        prices: [15, 20, 25],
        durations: ["30 minutes", "45 minutes", "1 hour"],
      },
      {
        name: "Evening Park Adventure",
        description: "Let your furry friend socialize and play at the local dog park. Includes playtime and exercise with other friendly dogs.",
        prices: [20, 25, 30],
        durations: ["45 minutes", "1 hour", "1.5 hours"],
      },
      {
        name: "Weekend Trail Hiking",
        description: "Take your adventurous pup on scenic trail hikes. Great for dogs who love exploring nature and need extra exercise.",
        prices: [35, 40, 50],
        durations: ["1 hour", "1.5 hours", "2 hours"],
      },
    ],
  },
  {
    category: "Pet Sitting",
    services: [
      {
        name: "Overnight Pet Care",
        description: "Your pet stays comfortable in their own home while you're away. Includes feeding, playtime, and lots of cuddles.",
        prices: [40, 50, 60],
        durations: ["per night", "per night", "per night"],
      },
      {
        name: "Day Care Services",
        description: "Drop off your pet for the day while you're at work. Full supervision, playtime, and meals included.",
        prices: [25, 30, 35],
        durations: ["per day", "per day", "per day"],
      },
      {
        name: "Weekend Boarding",
        description: "Weekend getaway? Your pet will be well taken care of with regular walks, meals, and attention.",
        prices: [80, 100, 120],
        durations: ["per weekend", "per weekend", "per weekend"],
      },
    ],
  },
  {
    category: "Grooming",
    services: [
      {
        name: "Basic Bath & Brush",
        description: "Complete bath with premium shampoo, blow dry, and thorough brushing. Your pet will smell amazing!",
        prices: [30, 40, 50],
        durations: ["1 hour", "1.5 hours", "2 hours"],
      },
      {
        name: "Full Grooming Package",
        description: "Bath, haircut, nail trim, ear cleaning, and teeth brushing. Everything your pet needs to look and feel their best.",
        prices: [60, 75, 90],
        durations: ["2 hours", "2.5 hours", "3 hours"],
      },
      {
        name: "Nail Trimming Service",
        description: "Quick and stress-free nail trimming for dogs and cats. Keep your pet's paws healthy and comfortable.",
        prices: [15, 20, 25],
        durations: ["15 minutes", "20 minutes", "30 minutes"],
      },
    ],
  },
  {
    category: "Training",
    services: [
      {
        name: "Puppy Basic Training",
        description: "Essential commands for puppies: sit, stay, come, and leash training. Build a strong foundation early.",
        prices: [50, 60, 75],
        durations: ["1 hour", "1 hour", "1.5 hours"],
      },
      {
        name: "Behavioral Correction",
        description: "Address issues like excessive barking, jumping, or aggression. Personalized training plans for your pet.",
        prices: [70, 85, 100],
        durations: ["1 hour", "1.5 hours", "2 hours"],
      },
      {
        name: "Advanced Obedience",
        description: "Take your dog's training to the next level with off-leash commands, recall training, and advanced tricks.",
        prices: [80, 95, 110],
        durations: ["1.5 hours", "2 hours", "2 hours"],
      },
    ],
  },
  {
    category: "Veterinary",
    services: [
      {
        name: "Health Check-up",
        description: "Comprehensive wellness exam including vitals check, weight monitoring, and general health assessment.",
        prices: [50, 60, 70],
        durations: ["30 minutes", "45 minutes", "1 hour"],
      },
      {
        name: "Vaccination Service",
        description: "Keep your pet protected with up-to-date vaccinations. Includes rabies, distemper, and other essential vaccines.",
        prices: [40, 50, 60],
        durations: ["20 minutes", "30 minutes", "30 minutes"],
      },
      {
        name: "Dental Cleaning",
        description: "Professional dental cleaning to prevent gum disease and keep your pet's teeth healthy and strong.",
        prices: [100, 120, 150],
        durations: ["1 hour", "1.5 hours", "2 hours"],
      },
    ],
  },
];

const SEED_PASSWORD = "password123";

// ==============================================
// HELPER FUNCTIONS
// ==============================================

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// ==============================================
// MAIN SEED FUNCTION
// ==============================================

async function seed() {
  const mongoClient = new MongoClient(MONGODB_URI);

  try {
    console.log("🌱 Starting seed process...\n");

    // 1. Connect to Database
    await mongoClient.connect();
    const db = mongoClient.db("petcare");
    console.log("✅ Connected to MongoDB");

    const usersCollection = db.collection("users");
    const servicesCollection = db.collection("services");

    // 2. Clear existing data
    await servicesCollection.deleteMany({});
    await usersCollection.deleteMany({});
    console.log("🗑️  Cleared existing users and services\n");

    // 3. Create Users
    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

    const userDocs = INDIAN_USERS.map(([name, prefix]) => ({
      name,
      email: `${prefix}@example.com`,
      password: hashedPassword,
      createdAt: new Date(),
    }));

    const usersResult = await usersCollection.insertMany(userDocs);
    const createdUserIds = Object.values(usersResult.insertedIds);
    console.log(`✅ Created ${createdUserIds.length} users`);

    // 4. Create Pet Services
    const serviceDocs = [];

    createdUserIds.forEach((userId) => {
      const numberOfServices = Math.floor(Math.random() * 4) + 2; // 2-5 services per user

      for (let i = 0; i < numberOfServices; i++) {
        const categoryData = pick(PET_SERVICES);
        const serviceTemplate = pick(categoryData.services);
        const priceIndex = Math.floor(Math.random() * serviceTemplate.prices.length);

        serviceDocs.push({
          name: serviceTemplate.name,
          description: serviceTemplate.description,
          price: serviceTemplate.prices[priceIndex],
          duration: serviceTemplate.durations[priceIndex],
          category: categoryData.category,
          userId: userId,
          createdAt: randomDate(new Date(2024, 0, 1), new Date()),
        });
      }
    });

    await servicesCollection.insertMany(serviceDocs);
    console.log(`✅ Created ${serviceDocs.length} pet care services\n`);

    // 5. Success Message
    console.log("═══════════════════════════════════════");
    console.log("🎉 SEED COMPLETED SUCCESSFULLY!");
    console.log("═══════════════════════════════════════");
    console.log(`\n📧 Sample Login Credentials:`);
    console.log(`   Email: ${INDIAN_USERS[0][1]}@example.com`);
    console.log(`   Password: ${SEED_PASSWORD}\n`);
    console.log(`👥 Total Users: ${createdUserIds.length}`);
    console.log(`🐾 Total Services: ${serviceDocs.length}`);
    console.log("═══════════════════════════════════════\n");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    // 6. Disconnect
    await mongoClient.close();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the seed
seed();
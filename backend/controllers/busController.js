const Bus = require("../models/Bus");

const DEFAULT_BUSES = [
  {
    busName: "K-Swift Premium AC Sleeper (2+1)",
    busNumber: "KL-15-A-1001",
    brand: "K-SWIFT",
    type: "AC Sleeper",
    source: "Trivandrum",
    destination: "Ernakulam",
    departureTime: "18:30",
    arrivalTime: "08:45",
    duration: "14h 15m",
    fare: 1450,
    rating: 4.8,
    totalSeats: 30,
    bookedSeats: ["A1", "C2"],
  },
  {
    busName: "Swift Deluxe Air Bus (2+2)",
    busNumber: "KL-15-B-2002",
    brand: "K-SWIFT",
    type: "AC Semi-Sleeper",
    source: "Ernakulam",
    destination: "Kozhikode",
    departureTime: "06:00",
    arrivalTime: "20:30",
    duration: "14h 30m",
    fare: 950,
    rating: 4.5,
    totalSeats: 30,
    bookedSeats: ["B1", "D4"],
  },
  {
    busName: "Minnal Express (Non-AC Sleeper)",
    busNumber: "KL-15-C-3003",
    brand: "KSRTC MINNAL",
    type: "Non-AC Sleeper",
    source: "Trivandrum",
    destination: "Munnar",
    departureTime: "20:00",
    arrivalTime: "09:15",
    duration: "13h 15m",
    fare: 880,
    rating: 4.2,
    totalSeats: 30,
    bookedSeats: [],
  },
  {
    busName: "KSRTC Super Fast (2+3)",
    busNumber: "KL-15-D-4004",
    brand: "KSRTC",
    type: "Non-AC Semi-Sleeper",
    source: "Kozhikode",
    destination: "Trivandrum",
    departureTime: "22:15",
    arrivalTime: "13:00",
    duration: "14h 45m",
    fare: 720,
    rating: 3.9,
    totalSeats: 30,
    bookedSeats: ["A1", "A2", "B1", "B2"],
  },
  {
    busName: "Gaja King Volvo Multi-Axle",
    busNumber: "KL-15-E-5005",
    brand: "K-SWIFT GAJA",
    type: "AC Sleeper",
    source: "Trivandrum",
    destination: "Bangalore",
    departureTime: "17:30",
    arrivalTime: "06:00",
    duration: "12h 30m",
    fare: 1850,
    rating: 4.9,
    totalSeats: 30,
    bookedSeats: ["C1", "C2", "D1"],
  },
];

// Seed buses if collection is empty
const autoSeedBuses = async () => {
  const count = await Bus.countDocuments();
  if (count === 0) {
    await Bus.insertMany(DEFAULT_BUSES);
    console.log("🌱 Auto-seeded initial KSRTC bus routes into MongoDB Atlas!");
  }
};

// @desc    Get all buses (with optional source, destination, filters & sorting)
// @route   GET /api/buses
// @access  Public
const getBuses = async (req, res) => {
  try {
    await autoSeedBuses();

    const { from, to, busTypes, sortBy } = req.query;
    let query = {};

    if (from) {
      query.source = { $regex: from, $options: "i" };
    }
    if (to) {
      query.destination = { $regex: to, $options: "i" };
    }

    if (busTypes) {
      const typesArr = busTypes.split(",");
      query.type = { $in: typesArr };
    }

    let sortObj = {};
    if (sortBy === "Price: Low to High") {
      sortObj.fare = 1;
    } else if (sortBy === "Rating: High to Low") {
      sortObj.rating = -1;
    } else if (sortBy === "Departure: Earliest First") {
      sortObj.departureTime = 1;
    } else {
      sortObj.createdAt = -1;
    }

    const buses = await Bus.find(query).sort(sortObj);
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching buses from MongoDB Atlas", error: error.message });
  }
};

// @desc    Get single bus by ID
// @route   GET /api/buses/:id
// @access  Public
const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: "Bus route not found in MongoDB Atlas" });
    }
    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bus details", error: error.message });
  }
};

// @desc    Force seed buses
// @route   POST /api/buses/seed
// @access  Public
const seedBuses = async (req, res) => {
  try {
    await Bus.deleteMany({});
    const createdBuses = await Bus.insertMany(DEFAULT_BUSES);
    res.status(201).json({ message: "MongoDB Atlas buses collection successfully seeded!", count: createdBuses.length, buses: createdBuses });
  } catch (error) {
    res.status(500).json({ message: "Failed to seed buses collection", error: error.message });
  }
};

module.exports = {
  getBuses,
  getBusById,
  seedBuses,
};

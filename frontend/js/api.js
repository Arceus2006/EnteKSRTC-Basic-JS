/* ============================================================
   api.js (MOCK VERSION)
   Mocks backend API calls using localStorage.
   ============================================================ */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const USERS_KEY = "mock_db_users";
const BOOKINGS_KEY = "mock_db_bookings";

const CITIES = [
  'Bangalore', 'Trivandrum', 'Kochi', 'Calicut', 'Thrissur', 
  'Tirunelveli', 'Chennai', 'Madurai', 'Kochi City Ride', 
  'Kodakara (401)', 'Kodenchery', 'Kodungallur (73)', 
  'Kollam (2)', 'Kollengode', 'Kollur', 'Ernakulam', 'Munnar', 'Kozhikode'
];

const filterCities = (query) => {
  if (!query) return CITIES;
  return CITIES.filter(city => city.toLowerCase().includes(query.toLowerCase()));
};

const MOCK_BUSES = [
  {
    _id: "bus1", busName: "K-Swift Premium AC Sleeper (2+1)", busNumber: "KL-15-A-1001", 
    brand: "K-SWIFT", type: "AC Sleeper",
    source: "Trivandrum", destination: "Ernakulam",
    departureTime: "18:30", arrivalTime: "08:45", duration: "14h 15m", fare: 1450, rating: 4.8,
    totalSeats: 30, bookedSeats: ["A1", "C2"]
  },
  {
    _id: "bus2", busName: "Swift Deluxe Air Bus (2+2)", busNumber: "KL-15-B-2002", 
    brand: "K-SWIFT", type: "AC Semi-Sleeper",
    source: "Ernakulam", destination: "Kozhikode",
    departureTime: "06:00", arrivalTime: "20:30", duration: "14h 30m", fare: 950, rating: 4.5,
    totalSeats: 30, bookedSeats: ["B1", "D4"]
  },
  {
    _id: "bus3", busName: "Minnal Express (Non-AC Sleeper)", busNumber: "KL-15-C-3003", 
    brand: "KSRTC MINNAL", type: "Non-AC Sleeper",
    source: "Trivandrum", destination: "Munnar",
    departureTime: "20:00", arrivalTime: "09:15", duration: "13h 15m", fare: 880, rating: 4.2,
    totalSeats: 30, bookedSeats: []
  },
  {
    _id: "bus4", busName: "KSRTC Super Fast (2+3)", busNumber: "KL-15-D-4004", 
    brand: "KSRTC", type: "Non-AC Semi-Sleeper",
    source: "Kozhikode", destination: "Trivandrum",
    departureTime: "22:15", arrivalTime: "13:00", duration: "14h 45m", fare: 720, rating: 3.9,
    totalSeats: 30, bookedSeats: ["A1", "A2", "B1", "B2"]
  }
];

function getDB(key, defaultVal) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultVal;
}
function setDB(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// ------------------------------------------------------------
// AUTH ENDPOINTS
// ------------------------------------------------------------
async function register(name, email, password) {
  await delay(500);
  const users = getDB(USERS_KEY, []);
  if (users.find(u => u.email === email)) {
    throw new Error("User with this email already exists.");
  }
  const newUser = { id: generateId(), name, email, password };
  users.push(newUser);
  setDB(USERS_KEY, users);
  return { message: "User registered successfully", user: { id: newUser.id, name, email } };
}

async function loginRequest(email, password) {
  await delay(500);
  const users = getDB(USERS_KEY, []);
  let user = users.find(u => u.email === email && u.password === password);
  
  // For seamless UI testing, if user isn't found, auto-register them!
  if (!user) {
    user = { id: generateId(), name: email.split('@')[0], email, password };
    users.push(user);
    setDB(USERS_KEY, users);
  }
  
  return {
    token: `mock_jwt_${user.id}`,
    user: { id: user.id, name: user.name, email: user.email }
  };
}

// ------------------------------------------------------------
// BUS ENDPOINTS
// ------------------------------------------------------------
async function getBuses(from, to, date, selectedBusTypes = [], selectedDepTimes = [], sortBy = 'Relevance') {
  await delay(500);
  let results = [...MOCK_BUSES];
  
  if (from) {
    results = results.filter(b => b.source.toLowerCase().includes(from.toLowerCase()));
  }
  if (to) {
    results = results.filter(b => b.destination.toLowerCase().includes(to.toLowerCase()));
  }

  if (selectedBusTypes.length > 0) {
    results = results.filter(bus => {
      if (selectedBusTypes.includes('AC Sleeper') && bus.type === 'AC Sleeper') return true;
      if (selectedBusTypes.includes('Non-AC Sleeper') && bus.type === 'Non-AC Sleeper') return true;
      if (selectedBusTypes.includes('AC Semi-Sleeper') && bus.type === 'AC Semi-Sleeper') return true;
      if (selectedBusTypes.includes('Seater') && bus.type === 'Non-AC Semi-Sleeper') return true;
      return false;
    });
  }

  if (selectedDepTimes.length > 0) {
    results = results.filter(bus => {
      const hour = parseInt(bus.departureTime.split(':')[0], 10);
      if (selectedDepTimes.includes('Before 6 AM') && hour < 6) return true;
      if (selectedDepTimes.includes('6 AM to 12 PM') && hour >= 6 && hour < 12) return true;
      if (selectedDepTimes.includes('12 PM to 6 PM') && hour >= 12 && hour < 18) return true;
      if (selectedDepTimes.includes('After 6 PM') && hour >= 18) return true;
      return false;
    });
  }

  if (sortBy === 'Price: Low to High') {
    results.sort((a, b) => a.fare - b.fare);
  } else if (sortBy === 'Departure: Earliest First') {
    results.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  } else if (sortBy === 'Rating: High to Low') {
    results.sort((a, b) => b.rating - a.rating);
  }

  return results;
}

async function getBusById(busId) {
  await delay(300);
  const bus = MOCK_BUSES.find(b => b._id === busId);
  if (!bus) throw new Error("Bus not found");
  
  const bookings = getDB(BOOKINGS_KEY, []);
  const activeBookings = bookings.filter(bk => bk.busId === busId && bk.status !== "Cancelled");
  
  const mergedBus = { ...bus };
  mergedBus.bookedSeats = [...new Set([...bus.bookedSeats, ...activeBookings.map(bk => bk.seat)])];
  return mergedBus;
}

function generateSeatLayoutData() {
  const rows = 6;
  const cols = 5;
  const grid = [];

  for (let r = 0; r < rows; r++) {
    const rowSeats = [];
    for (let c = 0; c < cols; c++) {
      if (c === 2) {
        rowSeats.push({ isAisle: true, key: `aisle-${r}` });
        continue;
      }
      const seatId = `${r}-${c}`;
      const seatLabel = `${String.fromCharCode(65 + r)}${c + 1}`;
      rowSeats.push({
        isAisle: false,
        seatId,
        seatLabel
      });
    }
    grid.push({ rowId: `row-${r}`, seats: rowSeats });
  }
  return grid;
}

// ------------------------------------------------------------
// BOOKING ENDPOINTS
// ------------------------------------------------------------
async function createBooking(bookingData) {
  await delay(500);
  const token = localStorage.getItem("entekstc_token");
  if (!token) throw new Error("Unauthorized");
  const userId = token.replace("mock_jwt_", "");

  const bus = await getBusById(bookingData.busId);
  if (bus.bookedSeats.includes(bookingData.seat)) {
    throw new Error("This seat is already booked.");
  }

  const bookings = getDB(BOOKINGS_KEY, []);
  const newBooking = {
    _id: "bk_" + generateId(),
    userId,
    busId: bookingData.busId,
    seat: bookingData.seat,
    passengerName: bookingData.passengerName,
    journeyDate: bookingData.journeyDate,
    fare: bus.fare,
    status: "Confirmed",
    bus: { busName: bus.busName, source: bus.source, destination: bus.destination, departureTime: bus.departureTime }
  };
  
  bookings.push(newBooking);
  setDB(BOOKINGS_KEY, bookings);
  
  return { message: "Ticket booked successfully", booking: newBooking };
}

async function getMyBookings() {
  await delay(500);
  const token = localStorage.getItem("entekstc_token");
  if (!token) throw new Error("Unauthorized");
  const userId = token.replace("mock_jwt_", "");
  
  const bookings = getDB(BOOKINGS_KEY, []);
  return bookings.filter(bk => bk.userId === userId);
}

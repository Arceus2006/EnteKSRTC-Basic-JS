/* ============================================================
   api.js
   Central place for ALL communication with the backend.
   Every other JS file calls functions from here instead of
   writing its own fetch() calls. This keeps endpoints in one
   place so they are easy to change later.
   ============================================================ */

// Base URL of the backend REST API.
// Change this one line if the backend ever runs on a different
// host/port (e.g. after deployment).
const API_BASE_URL = "http://localhost:5000/api";

/**
 * apiRequest()
 * A single reusable function that every other API call goes
 * through. It takes care of:
 *   - building the full URL
 *   - attaching JSON headers
 *   - attaching the JWT (if the user is logged in)
 *   - parsing the JSON response
 *   - throwing a readable error on failure
 *
 * @param {string} endpoint - e.g. "/auth/login"
 * @param {object} options  - fetch options (method, body, etc.)
 * @returns {Promise<any>}  - the parsed JSON response
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Default headers. We always send/accept JSON.
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // If a token exists in localStorage, attach it automatically
  // so every authenticated request doesn't need to repeat this.
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkError) {
    // fetch() itself throws when the network is down / backend
    // is unreachable / CORS blocks the request, etc.
    console.error("Network error calling", url, networkError);
    throw new Error(
      "Could not reach the server. Please check your connection and try again."
    );
  }

  // Try to parse JSON even on error responses, since the backend
  // is expected to send { message: "..." } style error bodies.
  let data = null;
  try {
    data = await response.json();
  } catch (parseError) {
    // Response had no JSON body (e.g. 204 No Content) - that's fine.
    data = null;
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

/* ============================================================
   AUTH ENDPOINTS
   BACKEND ENDPOINT REQUIRED: these routes are expected but may
   not exist on the backend yet. Update the paths below once the
   real authController/authRoutes are implemented.
   ============================================================ */

/**
 * register(name, email, password)
 * BACKEND ENDPOINT REQUIRED: POST /api/auth/register
 * Expected request body:  { name, email, password }
 * Expected response body: { message, user? }
 */
async function register(name, email, password) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

/**
 * loginRequest(email, password)
 * BACKEND ENDPOINT REQUIRED: POST /api/auth/login
 * Expected request body:  { email, password }
 * Expected response body: { token, user: { id, name, email } }
 */
async function loginRequest(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/* ============================================================
   BUS ENDPOINTS
   ============================================================ */

/**
 * getBuses(from, to, date)
 * BACKEND ENDPOINT REQUIRED: GET /api/buses?from=..&to=..&date=..
 * Expected response body: an array of bus objects, e.g.
 * [
 *   {
 *     _id, busName, busNumber, source, destination,
 *     departureTime, arrivalTime, fare, availableSeats
 *   }
 * ]
 */
async function getBuses(from, to, date) {
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  if (date) params.append("date", date);

  return apiRequest(`/buses?${params.toString()}`, {
    method: "GET",
  });
}

/**
 * getBusById(busId)
 * BACKEND ENDPOINT REQUIRED: GET /api/buses/:id
 * Used on the booking page to show details of the chosen bus,
 * and (ideally) which seats are already booked.
 * Expected response body:
 * {
 *   _id, busName, busNumber, source, destination,
 *   departureTime, arrivalTime, fare,
 *   totalSeats, bookedSeats: ["A1", "B2", ...]
 * }
 */
async function getBusById(busId) {
  return apiRequest(`/buses/${busId}`, {
    method: "GET",
  });
}

/* ============================================================
   BOOKING ENDPOINTS
   ============================================================ */

/**
 * createBooking(bookingData)
 * BACKEND ENDPOINT REQUIRED: POST /api/bookings
 * Requires Authorization header (attached automatically by
 * apiRequest when a token is present).
 * Expected request body:
 * {
 *   busId, seat, passengerName, journeyDate
 * }
 * Expected response body: { message, booking }
 */
async function createBooking(bookingData) {
  return apiRequest("/bookings", {
    method: "POST",
    body: JSON.stringify(bookingData),
  });
}

/**
 * getMyBookings()
 * BACKEND ENDPOINT REQUIRED: GET /api/bookings/my
 * Requires Authorization header.
 * Expected response body: an array of booking objects, e.g.
 * [
 *   {
 *     _id, bus: { busName, source, destination },
 *     journeyDate, seat, passengerName, fare, status
 *   }
 * ]
 */
async function getMyBookings() {
  return apiRequest("/bookings/my", {
    method: "GET",
  });
}

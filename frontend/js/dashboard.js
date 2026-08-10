/* ============================================================
   dashboard.js
   Builds the "My Dashboard" summary page. Deliberately reuses
   the existing GET /api/bookings/my endpoint (see api.js) and
   computes stats on the client, instead of requiring a brand
   new backend summary endpoint. Keeps the backend surface small.
   ============================================================ */

function isFutureDate(dateString) {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const journeyDate = new Date(dateString);
  return journeyDate >= today;
}

function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return `₹${value.toLocaleString("en-IN")}`;
}

function renderGreeting() {
  const greetingEl = document.getElementById("dashboardGreeting");
  if (!greetingEl) return;
  const user = getCurrentUser();
  const name = user && user.name ? user.name : "Traveller";
  greetingEl.textContent = `Welcome back, ${name}`;
}

function renderStats(bookings) {
  const totalBookings = bookings.length;

  // Array method (filter) to find upcoming trips.
  const upcoming = bookings.filter(function (booking) {
    return isFutureDate(booking.journeyDate);
  });

  // Array method (reduce) to total up fares.
  const totalSpent = bookings.reduce(function (sum, booking) {
    return sum + (Number(booking.fare) || 0);
  }, 0);

  document.getElementById("statTotalBookings").textContent = totalBookings;
  document.getElementById("statUpcomingCount").textContent = upcoming.length;
  document.getElementById("statTotalSpent").textContent = formatCurrency(totalSpent);

  return upcoming;
}

function renderNextTrip(upcomingBookings) {
  const card = document.getElementById("nextTripCard");
  if (!card) return;

  if (upcomingBookings.length === 0) {
    card.innerHTML = `<p>No upcoming trips booked yet. <a href="buses.html">Search for a bus</a> to plan your next journey.</p>`;
    return;
  }

  // Sort a copy by date ascending, then take the soonest one.
  const sorted = [...upcomingBookings].sort(function (a, b) {
    return new Date(a.journeyDate) - new Date(b.journeyDate);
  });
  const next = sorted[0];
  const bus = next.bus || {};

  card.innerHTML = `
    <p><strong>${bus.busName || "Bus"}</strong></p>
    <p>${bus.source || "?"} &rarr; ${bus.destination || "?"}</p>
    <p>Date: ${next.journeyDate || "-"} &nbsp;|&nbsp; Seat: ${next.seat || "-"}</p>
    <p>Passenger: ${next.passengerName || "-"}</p>
  `;
}

async function loadDashboard() {
  const statusEl = document.getElementById("dashboardStatus");
  const statsEl = document.getElementById("dashboardStats");

  statusEl.textContent = "Loading your dashboard...";
  statusEl.className = "status-message status-loading";
  statsEl.classList.add("hidden");

  try {
    const bookings = await getMyBookings();
    const list = Array.isArray(bookings) ? bookings : [];

    statusEl.textContent = "";
    statusEl.className = "";
    statsEl.classList.remove("hidden");

    const upcoming = renderStats(list);
    renderNextTrip(upcoming);
  } catch (error) {
    statusEl.textContent = `Could not load dashboard: ${error.message}`;
    statusEl.className = "status-message status-error";
    document.getElementById("nextTripCard").innerHTML =
      "<p>Unable to load trip details right now.</p>";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  requireLogin(); // Dashboard is only for logged-in users.
  renderGreeting();
  loadDashboard();
});

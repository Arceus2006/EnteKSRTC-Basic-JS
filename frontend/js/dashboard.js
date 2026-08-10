/* ============================================================
   dashboard.js (Updated Dashboard Renderer)
   ============================================================ */

function isFutureDate(dateString) {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateString) >= today;
}

function renderGreeting() {
  const user = getCurrentUser();
  const name = user && user.name ? user.name : "Traveler";
  
  const greetingEl = document.getElementById("dashboardGreeting");
  if (greetingEl) greetingEl.textContent = `Welcome, ${name}`;

  const welcomeLarge = document.getElementById("dashboardWelcomeLarge");
  if (welcomeLarge) {
    welcomeLarge.innerHTML = `Welcome back,<br><span>${name}</span>`;
  }
}

function renderDashboardStats(bookings) {
  const totalBookings = bookings.length;
  const upcoming = bookings.filter(b => isFutureDate(b.journeyDate));

  const statTotalEl = document.getElementById("statTotalBookings");
  if (statTotalEl) statTotalEl.textContent = totalBookings;

  const statLoyaltyEl = document.getElementById("statLoyaltyPoints");
  if (statLoyaltyEl) statLoyaltyEl.textContent = (totalBookings * 50 + 200).toLocaleString();

  return upcoming;
}

function renderNextTrip(upcomingBookings) {
  const card = document.getElementById("nextTripCard");
  if (!card) return;

  if (upcomingBookings.length === 0) {
    card.innerHTML = `
      <div style="padding: 12px; color: var(--gray);">
        <p>No upcoming journeys scheduled.</p>
        <a href="buses.html" style="color: var(--primary); font-weight: 700;">Explore Routes &rarr;</a>
      </div>
    `;
    return;
  }

  const sorted = [...upcomingBookings].sort((a, b) => new Date(a.journeyDate) - new Date(b.journeyDate));
  const next = sorted[0];
  const bus = next.bus || {};

  card.innerHTML = `
    <div class="ticket-left">
      <div class="ticket-icon">
        <span class="material-symbols-outlined">directions_bus</span>
      </div>
      <div class="ticket-details">
        <h3 style="margin: 0; font-size: 1.1rem;">${bus.busName || "KSRTC Bus"}</h3>
        <p style="margin: 0; font-size: 0.85rem; color: var(--gray);">${bus.source || "?"} &rarr; ${bus.destination || "?"} (${next.journeyDate || "-"})</p>
      </div>
    </div>
    <div class="ticket-seat">
      <span>SEAT</span>
      <strong>${next.seat || "-"}</strong>
    </div>
  `;
}

async function loadDashboard() {
  const statusEl = document.getElementById("dashboardStatus");
  if (statusEl) statusEl.className = "hidden";

  try {
    const bookings = await getMyBookings();
    const list = Array.isArray(bookings) ? bookings : [];
    const upcoming = renderDashboardStats(list);
    renderNextTrip(upcoming);
  } catch (error) {
    if (statusEl) {
      statusEl.textContent = `Could not load trip data: ${error.message}`;
      statusEl.className = "status-message status-error";
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  requireLogin();
  renderGreeting();
  loadDashboard();
});
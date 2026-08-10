/* ============================================================
   bookings.js
   Loads and displays the logged-in user's bookings on
   bookings.html. Kept as its own small file (separate from
   booking.js, which handles creating a NEW booking) so each
   file has one clear job.
   ============================================================ */

function renderBookingCard(booking) {
  const card = document.createElement("div");
  card.className = "booking-card";

  // The backend is expected to populate "bus" with route info,
  // but we guard against it being missing so the page doesn't break.
  const bus = booking.bus || {};

  card.innerHTML = `
    <div class="booking-card-header">
      <span class="booking-id">Booking #${booking._id ? booking._id.slice(-6) : "-"}</span>
      <span class="booking-status booking-status-${(booking.status || "confirmed").toLowerCase()}">
        ${booking.status || "Confirmed"}
      </span>
    </div>
    <p><strong>${bus.busName || "Bus"}</strong></p>
    <p>${bus.source || "?"} &rarr; ${bus.destination || "?"}</p>
    <p>Date: ${booking.journeyDate || "-"} &nbsp;|&nbsp; Seat: ${booking.seat || "-"}</p>
    <p>Passenger: ${booking.passengerName || "-"}</p>
    <p class="booking-fare">Fare: ₹${booking.fare ?? "-"}</p>
  `;

  return card;
}

async function loadMyBookings() {
  const container = document.getElementById("bookingsList");
  const statusEl = document.getElementById("bookingsStatus");
  if (!container) return; // Not on this page.

  container.innerHTML = "";
  statusEl.textContent = "Loading your bookings...";
  statusEl.className = "status-message status-loading";

  try {
    const bookings = await getMyBookings();

    if (!Array.isArray(bookings) || bookings.length === 0) {
      statusEl.textContent = "You have no bookings yet. Go search for a bus!";
      statusEl.className = "status-message status-info";
      return;
    }

    statusEl.textContent = "";
    statusEl.className = "";

    bookings.forEach(function (booking) {
      container.appendChild(renderBookingCard(booking));
    });
  } catch (error) {
    statusEl.textContent = `Could not load bookings: ${error.message}`;
    statusEl.className = "status-message status-error";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  requireLogin(); // Must be logged in to view bookings.
  loadMyBookings();
});

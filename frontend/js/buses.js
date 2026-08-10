/* ============================================================
   buses.js
   Handles:
   1. The search form on index.html (redirects to buses.html
      with query parameters).
   2. Reading those query parameters and fetching + rendering
      bus results on buses.html.
   ============================================================ */

/* ---------- Search form on index.html ---------- */

function initSearchForm() {
  const form = document.getElementById("searchForm");
  if (!form) return; // Not on this page.

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const from = document.getElementById("searchFrom").value.trim();
    const to = document.getElementById("searchTo").value.trim();
    const date = document.getElementById("searchDate").value;

    if (!from || !to || !date) {
      alert("Please fill in From, To and Journey Date to search buses.");
      return;
    }

    if (from.toLowerCase() === to.toLowerCase()) {
      alert("From and To locations cannot be the same.");
      return;
    }

    // Pass the search criteria to buses.html using URL query
    // parameters, so that page can read them and call the API.
    const params = new URLSearchParams({ from, to, date });
    window.location.href = `buses.html?${params.toString()}`;
  });
}

/* ---------- Results list on buses.html ---------- */

function renderBusCard(bus) {
  // createElement + classList + textContent: plain DOM
  // manipulation, no innerHTML string-building for the whole card
  // so it stays easy to read and safe from injected HTML.
  const card = document.createElement("div");
  card.className = "bus-card";

  const info = document.createElement("div");
  info.className = "bus-card-info";
  info.innerHTML = `
    <h3>${bus.busName || "Unnamed Bus"}</h3>
    <p class="bus-number">${bus.busNumber ? "Bus No: " + bus.busNumber : ""}</p>
    <p><strong>${bus.source}</strong> &rarr; <strong>${bus.destination}</strong></p>
    <p>Departure: ${bus.departureTime || "N/A"} &nbsp;|&nbsp; Arrival: ${bus.arrivalTime || "N/A"}</p>
    <p>Available seats: ${bus.availableSeats ?? "N/A"}</p>
  `;

  const action = document.createElement("div");
  action.className = "bus-card-action";

  const fare = document.createElement("p");
  fare.className = "bus-fare";
  fare.textContent = `₹${bus.fare ?? "-"}`;

  const bookBtn = document.createElement("button");
  bookBtn.className = "btn btn-primary";
  bookBtn.textContent = "Book";
  bookBtn.addEventListener("click", function () {
    if (!isLoggedIn()) {
      alert("Please login to book a ticket.");
      window.location.href = "login.html";
      return;
    }
    // Pass the bus id and fare forward to the booking page.
    const params = new URLSearchParams({
      busId: bus._id,
      fare: bus.fare ?? "",
    });
    window.location.href = `booking.html?${params.toString()}`;
  });

  action.appendChild(fare);
  action.appendChild(bookBtn);

  card.appendChild(info);
  card.appendChild(action);

  return card;
}

async function loadBusResults() {
  const resultsContainer = document.getElementById("busResults");
  const statusEl = document.getElementById("busSearchStatus");
  const summaryEl = document.getElementById("busSearchSummary");
  if (!resultsContainer) return; // Not on this page.

  const urlParams = new URLSearchParams(window.location.search);
  const from = urlParams.get("from");
  const to = urlParams.get("to");
  const date = urlParams.get("date");

  if (summaryEl && from && to && date) {
    summaryEl.textContent = `${from} → ${to} on ${date}`;
  }

  // Loading state
  resultsContainer.innerHTML = "";
  statusEl.textContent = "Searching for buses...";
  statusEl.className = "status-message status-loading";

  try {
    const buses = await getBuses(from, to, date);

    if (!Array.isArray(buses) || buses.length === 0) {
      statusEl.textContent = "No buses found for this route and date.";
      statusEl.className = "status-message status-info";
      return;
    }

    statusEl.textContent = "";
    statusEl.className = "";

    // Array method (forEach) used here to build the result list.
    buses.forEach(function (bus) {
      resultsContainer.appendChild(renderBusCard(bus));
    });
  } catch (error) {
    statusEl.textContent = `Could not load buses: ${error.message}`;
    statusEl.className = "status-message status-error";
  }
}

document.addEventListener("DOMContentLoaded", initSearchForm);
document.addEventListener("DOMContentLoaded", loadBusResults);

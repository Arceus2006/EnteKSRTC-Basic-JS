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

    if (!from || !to) {
      alert("Please fill in From and To locations to search buses.");
      return;
    }

    if (from.toLowerCase() === to.toLowerCase()) {
      alert("From and To locations cannot be the same.");
      return;
    }

    // Pass the search criteria to buses.html using URL query
    // parameters, so that page can read them and call the API.
    const params = new URLSearchParams({ from, to });
    if (date) params.append("date", date);
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
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
      <h3 style="margin: 0;">${bus.busName || "Unnamed Bus"}</h3>
      <span style="background: var(--primary-light); color: var(--primary); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">${bus.rating || "New"} <span class="material-symbols-outlined" style="font-size: 0.9rem; vertical-align: middle;">star</span></span>
    </div>
    <p class="bus-number" style="margin-bottom: 12px; color: var(--gray); font-size: 0.85rem;">
      <span style="font-weight: 600;">${bus.brand || "KSRTC"}</span> &bull; ${bus.type || "Standard"} &bull; ${bus.busNumber ? "No: " + bus.busNumber : ""}
    </p>
    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
      <div style="text-align: center;">
        <p style="font-size: 1.2rem; font-weight: 800; color: var(--dark); margin: 0;">${bus.departureTime || "N/A"}</p>
        <p style="font-size: 0.8rem; color: var(--gray); margin: 0;">${bus.source}</p>
      </div>
      <div style="flex: 1; text-align: center; border-bottom: 2px dashed var(--gray-light); position: relative; height: 2px;">
        <span style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: white; padding: 0 8px; font-size: 0.75rem; color: var(--gray);">${bus.duration || "-"}</span>
      </div>
      <div style="text-align: center;">
        <p style="font-size: 1.2rem; font-weight: 800; color: var(--dark); margin: 0;">${bus.arrivalTime || "N/A"}</p>
        <p style="font-size: 0.8rem; color: var(--gray); margin: 0;">${bus.destination}</p>
      </div>
    </div>
    <p style="font-size: 0.85rem; color: var(--primary); font-weight: 600;">Available seats: ${bus.availableSeats ?? "N/A"}</p>
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

  // Read filters
  const sortSelect = document.getElementById("sortSelect");
  const sortBy = sortSelect ? sortSelect.value : "Relevance";
  
  const selectedBusTypes = Array.from(document.querySelectorAll(".bus-type-cb:checked")).map(cb => cb.value);
  const selectedDepTimes = Array.from(document.querySelectorAll(".dep-time-cb:checked")).map(cb => cb.value);

  if (summaryEl) {
    if (from && to) {
      summaryEl.innerHTML = `Showing buses from <strong class="text-primary">${from}</strong> to <strong class="text-primary">${to}</strong> ${date ? 'on <strong>' + date + '</strong>' : ''}`;
    } else {
      summaryEl.textContent = "Showing all buses.";
    }
  }

  // Loading state
  resultsContainer.innerHTML = `
    <div class="bus-card skeleton" style="height: 160px;"></div>
    <div class="bus-card skeleton" style="height: 160px;"></div>
    <div class="bus-card skeleton" style="height: 160px;"></div>
  `;
  statusEl.className = "hidden";

  try {
    const buses = await getBuses(from, to, date, selectedBusTypes, selectedDepTimes, sortBy);

    if (!Array.isArray(buses) || buses.length === 0) {
      resultsContainer.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-outlined">directions_off</span>
          <h3>No buses found</h3>
          <p>We couldn't find any buses for this route and date. Please try another search.</p>
        </div>
      `;
      return;
    }

    statusEl.className = "hidden";
    resultsContainer.innerHTML = "";

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
document.addEventListener("DOMContentLoaded", () => {
  loadBusResults();

  // Hook up filter listeners
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", loadBusResults);
    document.querySelectorAll(".bus-type-cb").forEach(cb => cb.addEventListener("change", loadBusResults));
    document.querySelectorAll(".dep-time-cb").forEach(cb => cb.addEventListener("change", loadBusResults));
  }
});

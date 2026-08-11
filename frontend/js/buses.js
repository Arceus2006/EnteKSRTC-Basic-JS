/* ============================================================
   buses.js (Updated for Google Switch Controls)
   ============================================================ */

function initSearchForm() {
  const form = document.getElementById("searchForm");
  const dateInput = document.getElementById("searchDate");

  // Dynamically set minimum travel date to today (YYYY-MM-DD)
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }

  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const from = document.getElementById("searchFrom").value.trim();
    const to = document.getElementById("searchTo").value.trim();
    const date = dateInput ? dateInput.value : "";

    if (!from || !to) {
      showFormMessage("searchMessage", "Please fill in both From and To locations.", "error");
      return;
    }

    if (from.toLowerCase() === to.toLowerCase()) {
      showFormMessage("searchMessage", "Source and Destination cities cannot be identical.", "error");
      form.classList.add("shake-invalid");
      setTimeout(() => form.classList.remove("shake-invalid"), 500);
      return;
    }

    if (date) {
      const selectedDate = new Date(date);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      if (selectedDate < todayDate) {
        showFormMessage("searchMessage", "Journey date cannot be in the past.", "error");
        return;
      }
    }

    const params = new URLSearchParams({ from, to });
    if (date) params.append("date", date);
    window.location.href = `buses.html?${params.toString()}`;
  });
}

function renderBusCard(bus) {
  const card = document.createElement("div");
  card.className = "bus-card modern-card m3-card";

  card.innerHTML = `
    <div class="bus-card-info" style="flex: 1;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
        <h3 style="margin: 0; font-size: 1.25rem;">${bus.busName || "Unnamed Bus"}</h3>
        <span style="background: var(--primary-light); color: var(--primary); padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 700;">
          ${bus.rating || "4.5"} ★
        </span>
      </div>
      <p style="margin-bottom: 12px; color: var(--gray); font-size: 0.88rem;">
        <strong>${bus.brand || "KSRTC"}</strong> &bull; ${bus.type || "Standard"} &bull; ${bus.busNumber || ""}
      </p>
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px; max-width: 400px;">
        <div style="text-align: center;">
          <p style="font-size: 1.2rem; font-weight: 800; color: var(--dark); margin: 0;">${bus.departureTime || "N/A"}</p>
          <p style="font-size: 0.8rem; color: var(--gray); margin: 0;">${bus.source}</p>
        </div>
        <div style="flex: 1; text-align: center; border-bottom: 2px dashed var(--gray-border); position: relative; height: 2px;">
          <span style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: var(--white); padding: 0 8px; font-size: 0.75rem; color: var(--gray); font-weight: 600;">${bus.duration || "-"}</span>
        </div>
        <div style="text-align: center;">
          <p style="font-size: 1.2rem; font-weight: 800; color: var(--dark); margin: 0;">${bus.arrivalTime || "N/A"}</p>
          <p style="font-size: 0.8rem; color: var(--gray); margin: 0;">${bus.destination}</p>
        </div>
      </div>
    </div>
    <div class="bus-card-action" style="display: flex; flex-direction: column; align-items: flex-end; gap: 12px;">
      <span class="bus-fare" style="font-size: 1.6rem; font-weight: 800; color: var(--primary);">₹${bus.fare ?? "-"}</span>
      <button class="m3-btn-filled btn-book-bus">Book Seat</button>
    </div>
  `;

  const bookBtn = card.querySelector(".btn-book-bus");
  bookBtn.addEventListener("click", function () {
    if (!isLoggedIn()) {
      alert("Please login to book a ticket.");
      window.location.href = "login.html";
      return;
    }
    const params = new URLSearchParams({
      busId: bus._id,
      fare: bus.fare ?? "",
    });
    window.location.href = `booking.html?${params.toString()}`;
  });

  return card;
}

async function loadBusResults() {
  const resultsContainer = document.getElementById("busResults");
  const statusEl = document.getElementById("busSearchStatus");
  const summaryEl = document.getElementById("busSearchSummary");
  if (!resultsContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const from = urlParams.get("from");
  const to = urlParams.get("to");
  const date = urlParams.get("date");

  const sortSelect = document.getElementById("sortSelect");
  const sortBy = sortSelect ? sortSelect.value : "Relevance";

  // Capture checked Google Switches
  const selectedBusTypes = Array.from(document.querySelectorAll(".bus-type-cb:checked")).map(cb => cb.value);
  const selectedDepTimes = Array.from(document.querySelectorAll(".dep-time-cb:checked")).map(cb => cb.value);

  if (summaryEl) {
    if (from && to) {
      summaryEl.innerHTML = `Showing buses from <strong style="color:var(--primary);">${from}</strong> to <strong style="color:var(--primary);">${to}</strong> ${date ? 'on <strong>' + date + '</strong>' : ''}`;
    } else {
      summaryEl.textContent = "Showing all routes across Kerala.";
    }
  }

  // Skeleton UI state
  resultsContainer.innerHTML = `
    <div class="modern-card skeleton" style="height: 140px; margin-bottom: 16px;"></div>
    <div class="modern-card skeleton" style="height: 140px; margin-bottom: 16px;"></div>
  `;
  if (statusEl) statusEl.className = "hidden";

  try {
    const buses = await getBuses(from, to, date, selectedBusTypes, selectedDepTimes, sortBy);

    if (!Array.isArray(buses) || buses.length === 0) {
      resultsContainer.innerHTML = `
        <div class="empty-state">
          <span class="material-symbols-outlined" style="font-size: 3rem;">directions_off</span>
          <h3>No buses found</h3>
          <p>Try toggling different switch filters or choosing another date.</p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = "";
    buses.forEach(bus => {
      resultsContainer.appendChild(renderBusCard(bus));
    });
  } catch (error) {
    if (statusEl) {
      statusEl.textContent = `Error loading routes: ${error.message}`;
      statusEl.className = "status-message status-error";
    }
  }
}

document.addEventListener("DOMContentLoaded", initSearchForm);
document.addEventListener("DOMContentLoaded", () => {
  loadBusResults();

  // Attach instant switch change listeners
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) sortSelect.addEventListener("change", loadBusResults);

  document.querySelectorAll(".bus-type-cb, .dep-time-cb").forEach(sw => {
    sw.addEventListener("change", loadBusResults);
  });
});
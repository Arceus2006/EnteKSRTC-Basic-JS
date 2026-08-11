/* ============================================================
   booking.js
   Renders a simple seat map, handles seat selection, collects
   passenger details, and submits the booking via the API.
   ============================================================ */

// Simple fixed seat layout for the basic version: 4 rows x 4 seats.
const SEAT_ROWS = ["A", "B", "C", "D"];
const SEAT_COLS = [1, 2, 3, 4];

let selectedSeat = null; // Tracks the one seat the user picked.
let currentBusId = null;
let currentFare = "";
let bookedSeats = []; // Seats already taken, loaded from the API if available.

function renderSeatMap() {
  const seatMap = document.getElementById("seatMap");
  if (!seatMap) return;

  seatMap.innerHTML = ""; // Clear before rebuilding.

  const layoutData = typeof generateSeatLayoutData === "function" 
    ? generateSeatLayoutData() 
    : []; // Fallback if missing

  layoutData.forEach(function (rowObj) {
    const rowEl = document.createElement("div");
    rowEl.className = "seat-row";

    rowObj.seats.forEach(function (seatInfo) {
      if (seatInfo.isAisle) {
        const aisle = document.createElement("div");
        aisle.className = "seat-aisle";
        rowEl.appendChild(aisle);
      } else {
        const seatBtn = document.createElement("button");
        seatBtn.type = "button";
        seatBtn.className = "seat";
        seatBtn.textContent = seatInfo.seatLabel;
        seatBtn.setAttribute("data-seat-id", seatInfo.seatLabel);

        if (bookedSeats.includes(seatInfo.seatLabel)) {
          seatBtn.classList.add("seat-booked");
          seatBtn.disabled = true;
        } else {
          seatBtn.addEventListener("click", function () {
            selectSeat(seatInfo.seatLabel, seatBtn);
          });
        }
        rowEl.appendChild(seatBtn);
      }
    });

    seatMap.appendChild(rowEl);
  });
}

function selectSeat(seatId, seatBtn) {
  // Remove the "selected" class from any previously selected seat.
  const previouslySelected = document.querySelector(".seat.seat-selected");
  if (previouslySelected) {
    previouslySelected.classList.remove("seat-selected");
  }

  seatBtn.classList.add("seat-selected");
  selectedSeat = seatId;

  const selectedSeatLabel = document.getElementById("selectedSeatLabel");
  if (selectedSeatLabel) {
    selectedSeatLabel.textContent = seatId;
  }

  const confirmBtn = document.getElementById("confirmBookingBtn");
  if (confirmBtn) {
    confirmBtn.disabled = false;
  }
}

async function loadBusForBooking() {
  const urlParams = new URLSearchParams(window.location.search);
  currentBusId = urlParams.get("busId");
  currentFare = urlParams.get("fare") || "";

  const busSummaryEl = document.getElementById("bookingBusSummary");
  const fareEl = document.getElementById("bookingFare");

  if (fareEl) {
    fareEl.textContent = currentFare ? `₹${currentFare}` : "-";
  }

  if (!currentBusId) {
    if (busSummaryEl) {
      busSummaryEl.textContent =
        "No bus selected. Please go back and choose a bus from the search results.";
    }
    return;
  }

  // Try to fetch bus + already-booked-seat details. This endpoint
  // is optional for the basic version - if it isn't implemented
  // yet, we simply show a generic seat map with nothing booked.
  try {
    const bus = await getBusById(currentBusId);
    if (busSummaryEl && bus) {
      busSummaryEl.textContent = `${bus.busName || "Bus"} — ${bus.source} → ${bus.destination}`;
    }
    if (bus && Array.isArray(bus.bookedSeats)) {
      bookedSeats = bus.bookedSeats;
    }
  } catch (error) {
    console.warn("Could not load bus details (endpoint may not be ready yet):", error.message);
    if (busSummaryEl) {
      busSummaryEl.textContent = "Bus details unavailable right now — you can still select a seat.";
    }
  }

  renderSeatMap();
}

function initBookingForm() {
  const form = document.getElementById("bookingForm");
  const dateInput = document.getElementById("bookingJourneyDate");
  const nameInput = document.getElementById("passengerName");

  // Dynamically set minimum travel date to today (YYYY-MM-DD)
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }

  if (nameInput) {
    nameInput.addEventListener("blur", () => {
      const val = nameInput.value.trim();
      if (!val || !/^[a-zA-Z\s'.]{2,50}$/.test(val)) {
        showFieldError(nameInput, "Please enter a valid passenger full name (at least 2 letters).");
      } else {
        clearFieldError(nameInput);
      }
    });
  }

  if (!form) return; // Not on this page.

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    let hasError = false;

    if (!selectedSeat) {
      showFormMessage("bookingMessage", "Please select an available seat from the map above before proceeding.", "error");
      form.classList.add("shake-invalid");
      setTimeout(() => form.classList.remove("shake-invalid"), 500);
      hasError = true;
    }

    const passengerName = nameInput ? nameInput.value.trim() : "";
    const journeyDate = dateInput ? dateInput.value : "";

    if (!passengerName || !/^[a-zA-Z\s'.]{2,50}$/.test(passengerName)) {
      showFieldError(nameInput, "Please enter a valid passenger full name.");
      hasError = true;
    }

    if (!journeyDate) {
      showFieldError(dateInput, "Please select a journey date.");
      hasError = true;
    } else {
      const selectedDate = new Date(journeyDate);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      if (selectedDate < todayDate) {
        showFieldError(dateInput, "Journey date cannot be in the past.");
        hasError = true;
      }
    }

    if (hasError) {
      form.classList.add("shake-invalid");
      setTimeout(() => form.classList.remove("shake-invalid"), 500);
      return;
    }

    const confirmBtn = document.getElementById("confirmBookingBtn");
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<span>Booking...</span> <span class="material-symbols-outlined">sync</span>`;
    }

    try {
      const bookingData = {
        busId: currentBusId,
        seat: selectedSeat,
        passengerName: passengerName,
        journeyDate: journeyDate,
      };

      await createBooking(bookingData);

      showFormMessage(
        "bookingMessage",
        "Ticket booked successfully! Redirecting to My Bookings...",
        "success"
      );
      setTimeout(function () {
        window.location.href = "bookings.html";
      }, 1200);
    } catch (error) {
      showFormMessage("bookingMessage", error.message, "error");
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `<span>Confirm Booking</span> <span class="material-symbols-outlined">check_circle</span>`;
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  requireLogin(); // Booking requires being logged in.
  loadBusForBooking();
  initBookingForm();
});

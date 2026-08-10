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
  if (!form) return; // Not on this page.

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!selectedSeat) {
      showFormMessage("bookingMessage", "Please select a seat first.", "error");
      return;
    }

    const passengerName = document.getElementById("passengerName").value.trim();
    const journeyDate = document.getElementById("bookingJourneyDate").value;

    if (!passengerName || !journeyDate) {
      showFormMessage("bookingMessage", "Please fill in passenger name and journey date.", "error");
      return;
    }

    const confirmBtn = document.getElementById("confirmBookingBtn");
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Booking...";

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
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Confirm Booking";
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  requireLogin(); // Booking requires being logged in.
  loadBusForBooking();
  initBookingForm();
});

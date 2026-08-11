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

async function loadDashboard() {
  const statusEl = document.getElementById("dashboardStatus");
  if (statusEl) statusEl.className = "hidden";

  try {
    const token = getToken();
    if (token) {
      const profile = await getUserProfile(token);
      if (profile) {
        // Re-render greeting with real data
        const name = profile.name || "Traveler";
        const greetingEl = document.getElementById("dashboardGreeting");
        if (greetingEl) greetingEl.textContent = `Welcome, ${name}`;

        const welcomeLarge = document.getElementById("dashboardWelcomeLarge");
        if (welcomeLarge) {
          welcomeLarge.innerHTML = `Welcome back,<br><span>${name}</span>`;
        }

        const statLoyaltyEl = document.getElementById("statLoyaltyPoints");
        if (statLoyaltyEl) statLoyaltyEl.textContent = (profile.loyaltyPoints || 0).toLocaleString();
        
        // Save back to local storage
        saveSession(token, profile);
      }
    }
  } catch (error) {
    if (statusEl) {
      statusEl.textContent = `Could not load dashboard data: ${error.message}`;
      statusEl.className = "status-message status-error";
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  requireLogin();
  renderGreeting(); // Shows cached name instantly
  loadDashboard(); // Fetches real data and updates UI
});
/* ============================================================
   auth.js
   Everything related to the logged-in state of the user:
   storing/reading the JWT, checking login status, logging out,
   and updating the shared navbar. Also wires up the
   register.html and login.html forms.
   ============================================================ */

const TOKEN_KEY = "entekstc_token";
const USER_KEY = "entekstc_user";

/* ---------- Basic token/user helpers (used everywhere) ---------- */

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function isLoggedIn() {
  return !!getToken();
}

function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function saveSession(token, user) {
  // We only ever store the token and basic (non-sensitive) user
  // info - never the password.
  localStorage.setItem(TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = "index.html";
}

/**
 * requireLogin()
 * Call this at the top of pages that need an authenticated user
 * (e.g. booking.html, bookings.html). Redirects to login.html if
 * no token is present.
 */
function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
}

/* ---------- Shared navbar login state ---------- */

/**
 * updateNavForAuth()
 * Every page's navbar has a placeholder link with
 * id="navAuthLink". This swaps it between "Login / Register"
 * and "Logout (Name)" depending on session state.
 */
function updateNavForAuth() {
  const navAuthLink = document.getElementById("navAuthLink");
  
  // Mobile Nav Toggle setup
  const navbar = document.getElementById("navbar");
  const navContainer = document.querySelector(".navbar-container");
  if (navbar && navContainer && !document.querySelector(".nav-toggle")) {
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "nav-toggle";
    toggleBtn.innerHTML = '<span class="material-symbols-outlined">menu</span>';
    toggleBtn.addEventListener("click", () => {
      navbar.classList.toggle("nav-open");
      toggleBtn.innerHTML = navbar.classList.contains("nav-open") 
        ? '<span class="material-symbols-outlined">close</span>' 
        : '<span class="material-symbols-outlined">menu</span>';
    });
    // Insert after brand
    navContainer.insertBefore(toggleBtn, navContainer.children[1]);
  }

  if (!navAuthLink) return;

  // Dynamically render relevant nav links
  const navLinksContainer = document.querySelector(".nav-links");
  if (navLinksContainer) {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    
    // Always show Home, Contact, Kerala Tourism
    let linksHTML = `
      <a href="index.html" class="nav-item ${currentPath === 'index.html' ? 'active' : ''}">Home</a>
      <a href="#" class="nav-item">Contact</a>
      <a href="#" class="nav-item">Kerala Tourism</a>
    `;

    // Only inject Dashboard and Bookings if logged in
    if (isLoggedIn()) {
      linksHTML = `
        <a href="index.html" class="nav-item ${currentPath === 'index.html' ? 'active' : ''}">Home</a>
        <a href="dashboard.html" class="nav-item ${currentPath === 'dashboard.html' ? 'active' : ''}">Dashboard</a>
        <a href="bookings.html" class="nav-item ${currentPath === 'bookings.html' ? 'active' : ''}">Bookings</a>
        <a href="buses.html" class="nav-item ${currentPath === 'buses.html' ? 'active' : ''}">Routes</a>
      `;
    }
    
    // We only update if the container doesn't already have exactly what we want,
    // to avoid flickering or breaking existing event listeners if not needed.
    // For a simple app, re-rendering is fine.
    navLinksContainer.innerHTML = linksHTML;
  }

  if (isLoggedIn()) {
    const user = getCurrentUser();
    navAuthLink.textContent = `Logout (${user ? user.name : "User"})`;
    navAuthLink.onclick = (e) => {
      e.preventDefault();
      logout();
    };
  } else {
    navAuthLink.textContent = "Login / Register";
    navAuthLink.onclick = (e) => {
      e.preventDefault();
      window.location.href = "login.html";
    };
  }
}

// Call on every page load
document.addEventListener("DOMContentLoaded", updateNavForAuth);

/* ---------- Generic form message helper ---------- */

function showFormMessage(elementId, message, type) {
  const toast = document.getElementById(elementId);
  if (!toast) return;

  toast.textContent = message;
  toast.className = "form-message"; // Reset
  toast.classList.add(type); // 'success' or 'error'
  toast.classList.remove("hidden");
  
  // Also add 'show' for the animation if using standard toast styles
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ---------- register.html form handling ---------- */

function initRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return; // Not on this page.

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;

    // ----- Client-side validation -----
    if (!name || !email || !password) {
      showFormMessage("regMessage", "Please fill in all mandatory fields.", "error");
      return;
    }

    if (!isValidEmail(email)) {
      showFormMessage("regMessage", "Please enter a valid email address.", "error");
      return;
    }

    if (password.length < 6) {
      showFormMessage("regMessage", "Password must be at least 6 characters.", "error");
      return;
    }

    const submitBtn = document.getElementById("regSubmitBtn");
    if (submitBtn) {
      submitBtn.disabled = true;
      const spanEl = submitBtn.querySelector('span');
      if (spanEl) spanEl.textContent = "Creating...";
    }

    try {
      await register(name, email, password);
      showFormMessage(
        "regMessage",
        "Account created successfully! Redirecting to login...",
        "success"
      );
      setTimeout(function () {
        window.location.href = "login.html";
      }, 1200);
    } catch (error) {
      showFormMessage("regMessage", error.message, "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        const spanEl = submitBtn.querySelector('span');
        if (spanEl) spanEl.textContent = "Create Account";
      }
    }
  });
}

/* ---------- login.html form handling ---------- */

function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return; // Not on this page.

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      showFormMessage("loginMessage", "Please enter both email and password.", "error");
      return;
    }

    const submitBtn = document.getElementById("loginSubmitBtn");
    if (submitBtn) {
      submitBtn.disabled = true;
      const spanEl = submitBtn.querySelector('span');
      if (spanEl) spanEl.textContent = "Logging in...";
    }

    try {
      const data = await loginRequest(email, password);

      // Expected shape: { token, user: { id, name, email } }
      if (!data || !data.token) {
        throw new Error("Login response did not include a token.");
      }

      saveSession(data.token, data.user);
      showFormMessage("loginMessage", "Login successful! Redirecting...", "success");
      setTimeout(function () {
        window.location.href = "dashboard.html"; // Fixed redirect
      }, 800);
    } catch (error) {
      showFormMessage("loginMessage", error.message, "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        const spanEl = submitBtn.querySelector('span');
        if (spanEl) spanEl.textContent = "Sign In";
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", initRegisterForm);
document.addEventListener("DOMContentLoaded", initLoginForm);

function populateDateSelect(dayId, monthId, yearId, minYear = 1930) {
  const dayEl = document.getElementById(dayId);
  const monthEl = document.getElementById(monthId);
  const yearEl = document.getElementById(yearId);
  if (!dayEl || !monthEl || !yearEl) return;
  for (let d = 1; d <= 31; d++) dayEl.add(new Option(String(d).padStart(2, '0'), d));
  ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    .forEach((m, i) => monthEl.add(new Option(m, i + 1)));
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= minYear; y--) yearEl.add(new Option(y, y));
}

function wirePasswordToggles() {
  document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', () => {
      const input = document.getElementById(icon.dataset.target);
      if (!input) return;
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      icon.textContent = showing ? 'visibility' : 'visibility_off';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  populateDateSelect('dobDay', 'dobMonth', 'dobYear');
  populateDateSelect('annivDay', 'annivMonth', 'annivYear');
  wirePasswordToggles();
});

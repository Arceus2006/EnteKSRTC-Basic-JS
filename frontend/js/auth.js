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
  if (!navAuthLink) return;

  if (isLoggedIn()) {
    const user = getCurrentUser();
    const displayName = user && user.name ? user.name : "Account";
    navAuthLink.textContent = `Logout (${displayName})`;
    navAuthLink.setAttribute("href", "#");
    navAuthLink.addEventListener("click", function (event) {
      event.preventDefault();
      logout();
    });
  } else {
    navAuthLink.textContent = "Login / Register";
    navAuthLink.setAttribute("href", "login.html");
  }
}

// Run on every page load.
document.addEventListener("DOMContentLoaded", updateNavForAuth);

/* ---------- Simple validation helpers ---------- */

function isValidEmail(email) {
  // Simple, readable email pattern - good enough for client-side
  // validation (the backend should still validate again).
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function showFormMessage(elementId, message, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.classList.remove("form-message-success", "form-message-error");
  el.classList.add(
    type === "success" ? "form-message-success" : "form-message-error"
  );
  el.classList.remove("hidden");
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
    const confirmPassword = document.getElementById("regConfirmPassword").value;

    // ----- Client-side validation -----
    if (!name || !email || !password || !confirmPassword) {
      showFormMessage("registerMessage", "Please fill in all fields.", "error");
      return;
    }

    if (!isValidEmail(email)) {
      showFormMessage("registerMessage", "Please enter a valid email address.", "error");
      return;
    }

    if (password.length < 6) {
      showFormMessage("registerMessage", "Password must be at least 6 characters.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showFormMessage("registerMessage", "Passwords do not match.", "error");
      return;
    }

    const submitBtn = document.getElementById("registerSubmitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    try {
      await register(name, email, password);
      showFormMessage(
        "registerMessage",
        "Account created successfully! Redirecting to login...",
        "success"
      );
      setTimeout(function () {
        window.location.href = "login.html";
      }, 1200);
    } catch (error) {
      showFormMessage("registerMessage", error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Register";
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
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      const data = await loginRequest(email, password);

      // Expected shape: { token, user: { id, name, email } }
      if (!data || !data.token) {
        throw new Error("Login response did not include a token.");
      }

      saveSession(data.token, data.user);
      showFormMessage("loginMessage", "Login successful! Redirecting...", "success");
      setTimeout(function () {
        window.location.href = "index.html";
      }, 800);
    } catch (error) {
      showFormMessage("loginMessage", error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
    }
  });
}

document.addEventListener("DOMContentLoaded", initRegisterForm);
document.addEventListener("DOMContentLoaded", initLoginForm);

/* ============================================================
   auth.js (Updated with Theme Switch & Session Logic)
   ============================================================ */

const TOKEN_KEY = "entekstc_token";
const USER_KEY = "entekstc_user";
const THEME_KEY = "entekstc_theme";

/* ---------- Basic token/user helpers ---------- */

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

function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
}

/* ---------- Theme Switch Logic ---------- */

function applyTheme(isDark) {
  if (isDark) {
    document.body.classList.add("dark-theme");
    document.documentElement.classList.add("dark-theme");
    localStorage.setItem(THEME_KEY, "dark");
  } else {
    document.body.classList.remove("dark-theme");
    document.documentElement.classList.remove("dark-theme");
    localStorage.setItem(THEME_KEY, "light");
  }

  const switches = document.querySelectorAll("#themeToggleSwitch, .md-switch");
  switches.forEach((sw) => {
    sw.checked = isDark;
  });
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);

  applyTheme(isDark);
}

// Global event delegation for theme toggle switches
document.addEventListener("change", (e) => {
  if (e.target && (e.target.id === "themeToggleSwitch" || e.target.classList.contains("md-switch"))) {
    applyTheme(e.target.checked);
  }
});

/* ---------- Shared Navbar Login & Theme State ---------- */

function updateNavForAuth() {
  const navAuthLink = document.getElementById("navAuthLink");
  
  // Mobile Nav Toggle setup
  const navbar = document.getElementById("navbar");
  const navContainer = document.querySelector(".navbar-container");
  
  if (navbar && navContainer && !document.querySelector(".nav-toggle")) {
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "nav-toggle";
    toggleBtn.setAttribute("aria-label", "Toggle navigation");
    toggleBtn.innerHTML = '<span class="material-symbols-outlined">menu</span>';
    toggleBtn.addEventListener("click", () => {
      navbar.classList.toggle("nav-open");
      toggleBtn.innerHTML = navbar.classList.contains("nav-open") 
        ? '<span class="material-symbols-outlined">close</span>' 
        : '<span class="material-symbols-outlined">menu</span>';
    });
    navContainer.insertBefore(toggleBtn, navContainer.children[1]);
  }

  // Inject Theme Switch inside navbar/topbar actions if missing
  const actionsContainer = document.querySelector(".nav-actions") || document.querySelector(".topbar-actions");
  if (actionsContainer && !document.getElementById("themeToggleSwitch")) {
    const switchWrapper = document.createElement("label");
    switchWrapper.className = "md-switch-label";
    switchWrapper.title = "Toggle Dark Mode";
    switchWrapper.innerHTML = `
      <span class="material-symbols-outlined" style="font-size: 18px; color: var(--gray);">dark_mode</span>
      <input type="checkbox" id="themeToggleSwitch" class="md-switch">
    `;
    actionsContainer.insertBefore(switchWrapper, actionsContainer.firstChild);
  }

  // Dynamically render relevant nav links
  const navLinksContainer = document.querySelector(".nav-links");
  if (navLinksContainer) {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    
    let linksHTML = `
      <a href="index.html" class="nav-item ${currentPath === 'index.html' ? 'active' : ''}">Home</a>
      <a href="buses.html" class="nav-item ${currentPath === 'buses.html' ? 'active' : ''}">Routes</a>
      <a href="#" class="nav-item">Kerala Tourism</a>
    `;

    if (isLoggedIn()) {
      linksHTML = `
        <a href="index.html" class="nav-item ${currentPath === 'index.html' ? 'active' : ''}">Home</a>
        <a href="dashboard.html" class="nav-item ${currentPath === 'dashboard.html' ? 'active' : ''}">Dashboard</a>
        <a href="bookings.html" class="nav-item ${currentPath === 'bookings.html' ? 'active' : ''}">Bookings</a>
        <a href="buses.html" class="nav-item ${currentPath === 'buses.html' ? 'active' : ''}">Routes</a>
      `;
    }
    navLinksContainer.innerHTML = linksHTML;
  }

  if (navAuthLink) {
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

  // Initialize theme state
  initTheme();
}

if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", updateNavForAuth);
} else {
  updateNavForAuth();
}

/* ---------- Generic Toast Message Helper ---------- */

function showFormMessage(elementId, message, type) {
  const toast = document.getElementById(elementId);
  if (!toast) return;

  toast.textContent = message;
  toast.className = "form-message";
  toast.classList.add(type === "success" ? "form-message-success" : "form-message-error");
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3500);
}

/* ---------- Form Event Listeners ---------- */

function initRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const age = document.getElementById("regAge").value;
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const gender = document.getElementById("regGender").value;
    const gstCompany = document.getElementById("regGstCompany") ? document.getElementById("regGstCompany").value.trim() : "";
    const gstNumber = document.getElementById("regGstNumber") ? document.getElementById("regGstNumber").value.trim() : "";
    const dobDay = document.getElementById("dobDay") ? document.getElementById("dobDay").value : "";
    const dobMonth = document.getElementById("dobMonth") ? document.getElementById("dobMonth").value : "";
    const dobYear = document.getElementById("dobYear") ? document.getElementById("dobYear").value : "";
    const annivDay = document.getElementById("annivDay") ? document.getElementById("annivDay").value : "";
    const annivMonth = document.getElementById("annivMonth") ? document.getElementById("annivMonth").value : "";
    const annivYear = document.getElementById("annivYear") ? document.getElementById("annivYear").value : "";

    // ----- Client-side validation -----
    if (!name || !email || !password || !age || !gender) {
      showFormMessage("regMessage", "Please fill in all mandatory fields.", "error");
      return;
    }

    const submitBtn = document.getElementById("regSubmitBtn");
    if (submitBtn) submitBtn.disabled = true;

    try {
      const userData = {
        name, age, email, password, gender,
        gstCompany, gstNumber,
        dob: dobDay && dobMonth && dobYear ? `${dobYear}-${dobMonth}-${dobDay}` : null,
        anniv: annivDay && annivMonth && annivYear ? `${annivYear}-${annivMonth}-${annivDay}` : null
      };
      await register(userData);
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
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      showFormMessage("loginMessage", "Please enter both email and password.", "error");
      return;
    }

    const submitBtn = document.getElementById("loginSubmitBtn");
    if (submitBtn) submitBtn.disabled = true;

    try {
      const data = await loginRequest(email, password);
      saveSession(data.token, data.user);
      showFormMessage("loginMessage", "Login successful! Redirecting...", "success");
      setTimeout(() => { window.location.href = "dashboard.html"; }, 800);
    } catch (error) {
      showFormMessage("loginMessage", error.message, "error");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", initRegisterForm);
document.addEventListener("DOMContentLoaded", initLoginForm);
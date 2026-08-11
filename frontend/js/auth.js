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

  const switches = document.querySelectorAll("#themeToggleSwitch");
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
  if (e.target && e.target.id === "themeToggleSwitch") {
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

/* ---------- Generic Toast Message & Field Error Helpers ---------- */

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

function showFieldError(inputEl, message) {
  if (!inputEl) return;
  const inputGroup = inputEl.closest(".input-group") || inputEl.parentElement;
  if (!inputGroup) return;

  inputGroup.classList.add("is-invalid");
  inputGroup.classList.remove("is-valid");

  let errorEl = inputGroup.querySelector(".field-error-msg");
  if (!errorEl) {
    errorEl = document.createElement("div");
    errorEl.className = "field-error-msg";
    inputGroup.appendChild(errorEl);
  }
  errorEl.innerHTML = `<span class="material-symbols-outlined" style="font-size:14px;">error</span> ${message}`;
  errorEl.classList.add("visible");
}

function clearFieldError(inputEl) {
  if (!inputEl) return;
  const inputGroup = inputEl.closest(".input-group") || inputEl.parentElement;
  if (!inputGroup) return;

  inputGroup.classList.remove("is-invalid");
  inputGroup.classList.add("is-valid");

  const errorEl = inputGroup.querySelector(".field-error-msg");
  if (errorEl) {
    errorEl.classList.remove("visible");
  }
}

/* ---------- Regex Validators ---------- */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-Z\s'.]{2,50}$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
const PWD_COMPLEXITY_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

/* ---------- Password Strength Calculator ---------- */
function checkPasswordStrength(password) {
  if (!password) return { score: 0, text: "" };
  let score = 0;
  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, text: "Weak", class: "weak" };
  if (score === 2 || score === 3) return { score: 2, text: "Medium", class: "medium" };
  return { score: 3, text: "Strong", class: "strong" };
}

function updatePasswordStrengthUI(inputEl) {
  const pwd = inputEl.value;
  const inputGroup = inputEl.closest(".input-group");
  if (!inputGroup) return;

  let strengthContainer = inputGroup.querySelector(".password-strength-container");
  if (!strengthContainer) {
    strengthContainer = document.createElement("div");
    strengthContainer.className = "password-strength-container";
    strengthContainer.innerHTML = `
      <div class="password-strength-bar-bg"><div class="password-strength-bar-fill"></div></div>
      <span class="password-strength-text"></span>
    `;
    inputGroup.appendChild(strengthContainer);
  }

  const fillEl = strengthContainer.querySelector(".password-strength-bar-fill");
  const textEl = strengthContainer.querySelector(".password-strength-text");

  if (!pwd) {
    fillEl.className = "password-strength-bar-fill";
    textEl.textContent = "";
    return;
  }

  const strength = checkPasswordStrength(pwd);
  fillEl.className = `password-strength-bar-fill ${strength.class}`;
  textEl.textContent = `Password Strength: ${strength.text}`;
}

/* ---------- Form Event Listeners ---------- */

function populateDateDropdowns() {
  const currentYear = new Date().getFullYear();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const populate = (dayId, monthId, yearId, startYear, endYear) => {
    const dayEl = document.getElementById(dayId);
    const monthEl = document.getElementById(monthId);
    const yearEl = document.getElementById(yearId);

    if (dayEl && dayEl.options.length <= 1) {
      for (let i = 1; i <= 31; i++) {
        dayEl.add(new Option(i, i < 10 ? '0' + i : i));
      }
    }
    if (monthEl && monthEl.options.length <= 1) {
      months.forEach((m, i) => {
        const val = i + 1;
        monthEl.add(new Option(m, val < 10 ? '0' + val : val));
      });
    }
    if (yearEl && yearEl.options.length <= 1) {
      for (let i = endYear; i >= startYear; i--) {
        yearEl.add(new Option(i, i));
      }
    }
  };

  populate("dobDay", "dobMonth", "dobYear", currentYear - 120, currentYear);
  populate("annivDay", "annivMonth", "annivYear", currentYear - 120, currentYear);
}

function initRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  populateDateDropdowns();

  const regName = document.getElementById("regName");
  const regAge = document.getElementById("regAge");
  const regEmail = document.getElementById("regEmail");
  const regPassword = document.getElementById("regPassword");
  const regGstNumber = document.getElementById("regGstNumber");

  // Real-time password strength listener
  if (regPassword) {
    regPassword.addEventListener("input", function () {
      updatePasswordStrengthUI(regPassword);
      if (PWD_COMPLEXITY_REGEX.test(regPassword.value)) {
        clearFieldError(regPassword);
      }
    });
  }

  // Real-time blur listeners
  if (regName) {
    regName.addEventListener("blur", () => {
      if (!NAME_REGEX.test(regName.value.trim())) {
        showFieldError(regName, "Name must contain at least 2 letters and no special characters.");
      } else {
        clearFieldError(regName);
      }
    });
  }

  if (regAge) {
    regAge.addEventListener("blur", () => {
      const val = parseInt(regAge.value, 10);
      if (isNaN(val) || val < 1 || val > 120) {
        showFieldError(regAge, "Please enter a valid age between 1 and 120.");
      } else {
        clearFieldError(regAge);
      }
    });
  }

  if (regEmail) {
    regEmail.addEventListener("blur", () => {
      if (!EMAIL_REGEX.test(regEmail.value.trim())) {
        showFieldError(regEmail, "Please enter a valid email address (e.g., name@domain.com).");
      } else {
        clearFieldError(regEmail);
      }
    });
  }

  if (regGstNumber) {
    regGstNumber.addEventListener("blur", () => {
      const val = regGstNumber.value.trim();
      if (val && !GSTIN_REGEX.test(val)) {
        showFieldError(regGstNumber, "Invalid GSTIN format (e.g. 32AAAAA0000A1Z5).");
      } else if (val) {
        clearFieldError(regGstNumber);
      }
    });
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = regName ? regName.value.trim() : "";
    const age = regAge ? regAge.value.trim() : "";
    const email = regEmail ? regEmail.value.trim() : "";
    const password = regPassword ? regPassword.value : "";
    const gender = document.getElementById("regGender") ? document.getElementById("regGender").value : "";
    const gstCompany = document.getElementById("regGstCompany") ? document.getElementById("regGstCompany").value.trim() : "";
    const gstNumber = regGstNumber ? regGstNumber.value.trim() : "";
    const dobDay = document.getElementById("dobDay") ? document.getElementById("dobDay").value : "";
    const dobMonth = document.getElementById("dobMonth") ? document.getElementById("dobMonth").value : "";
    const dobYear = document.getElementById("dobYear") ? document.getElementById("dobYear").value : "";
    const annivDay = document.getElementById("annivDay") ? document.getElementById("annivDay").value : "";
    const annivMonth = document.getElementById("annivMonth") ? document.getElementById("annivMonth").value : "";
    const annivYear = document.getElementById("annivYear") ? document.getElementById("annivYear").value : "";

    let hasError = false;

    if (!NAME_REGEX.test(name)) {
      showFieldError(regName, "Name must contain at least 2 letters.");
      hasError = true;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      showFieldError(regAge, "Age must be between 1 and 120.");
      hasError = true;
    }

    if (!EMAIL_REGEX.test(email)) {
      showFieldError(regEmail, "Please enter a valid email address.");
      hasError = true;
    }

    if (!PWD_COMPLEXITY_REGEX.test(password)) {
      showFieldError(regPassword, "Password must be at least 6 characters and contain letters & numbers.");
      hasError = true;
    }

    if (gstNumber && !GSTIN_REGEX.test(gstNumber)) {
      showFieldError(regGstNumber, "Invalid GSTIN format (e.g. 32AAAAA0000A1Z5).");
      hasError = true;
    }

    if (hasError) {
      form.classList.add("shake-invalid");
      setTimeout(() => form.classList.remove("shake-invalid"), 500);
      showFormMessage("regMessage", "Please correct the highlighted errors before submitting.", "error");
      return;
    }

    const submitBtn = document.getElementById("regSubmitBtn");
    if (submitBtn) submitBtn.disabled = true;

    try {
      const userData = {
        name, age: ageNum, email, password, gender,
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

  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");

  if (loginEmail) {
    loginEmail.addEventListener("blur", () => {
      if (!EMAIL_REGEX.test(loginEmail.value.trim())) {
        showFieldError(loginEmail, "Please enter a valid email address.");
      } else {
        clearFieldError(loginEmail);
      }
    });
  }

  if (loginPassword) {
    loginPassword.addEventListener("blur", () => {
      if (loginPassword.value.length < 6) {
        showFieldError(loginPassword, "Password must be at least 6 characters long.");
      } else {
        clearFieldError(loginPassword);
      }
    });
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = loginEmail ? loginEmail.value.trim() : "";
    const password = loginPassword ? loginPassword.value : "";

    let hasError = false;

    if (!EMAIL_REGEX.test(email)) {
      showFieldError(loginEmail, "Please enter a valid email address.");
      hasError = true;
    }

    if (!password || password.length < 6) {
      showFieldError(loginPassword, "Password must be at least 6 characters long.");
      hasError = true;
    }

    if (hasError) {
      form.classList.add("shake-invalid");
      setTimeout(() => form.classList.remove("shake-invalid"), 500);
      showFormMessage("loginMessage", "Please fill in valid credentials.", "error");
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
# Ente KSRTC Premium - Material Design 3 (M3) Frontend

Welcome to **Ente KSRTC Premium**, a modern, high-performance, responsive redesign of the Kerala State Road Transport Corporation (KSRTC) booking experience built with Material Design 3 (M3) principles, vanilla HTML5, CSS3, and JavaScript.

---

## 🎨 Material Design 3 (M3) System & Features

- **M3 Global Color Roles**:
  - **Primary**: KSRTC Green (`#0b6e4f` Light / `#3dba84` Dark)
  - **Secondary**: Kasavu Gold (`#d4af37` Light / `#e5c158` Dark)
  - **Tertiary**: Accent Coral (`#d1483c` Light / `#e06b60` Dark)
  - **Surface Container Scale**: 5 adaptive surface container levels (`lowest`, `low`, `container`, `high`, `highest`) for smooth background depth in both Light and Dark themes.
- **M3 Shape Radii**:
  - `--md-shape-corner-xl` (28px) extra-large container radius for `.m3-card` elements.
  - `--md-shape-corner-full` (9999px) full pill shape for buttons (`.m3-btn-filled`) and floating glass navbars (`.modern-navbar`).
- **M3 Motion & Physics**:
  - Spring-physics animation curves (`cubic-bezier(0.2, 0, 0, 1)`) for reactive switches, hover elevations, and active button press feedback.
- **Seamless Light & Dark Theme Switcher**:
  - Persistent state in `localStorage`.
  - Zero-FOUC (Flash of Unstyled Content) instant `<head>` initialization across all pages.
  - Complete dark theme overrides across all components (Dashboard, Tickets, Bus Results, Form Controls).
- **Boarding Pass Pass-Card Auth UI**:
  - Boarding pass pass-card design for Login and Registration with authentic ticket punch notch cutouts and crisp vector Google "G" SVG branding.
- **Interactive Seat Selection & Booking**:
  - Real-time seat selection map, dynamic fare calculation, and ticket checkout flow.
- **Personalized User Dashboard**:
  - Upcoming trips overview, loyalty points widget, quick search actions, and booking history management.

---

## 📁 Project Structure

```
frontend/
├── index.html            # Landing page with hero search widget & top routes
├── buses.html            # Bus search results, filter sidebars & sorting
├── booking.html          # Interactive seat map & passenger checkout
├── bookings.html         # User ticket history & booking management
├── dashboard.html        # User profile dashboard, stats & quick actions
├── login.html            # Boarding pass style sign-in pass card
├── register.html         # Boarding pass style account creation pass card
├── css/
│   ├── style.css         # M3 tokens, color roles, component classes & global themes
│   ├── dashboard-layout.css # Layouts and dark theme styles for dashboard widgets
│   └── ticket.css        # Boarding pass ticket card styles & notch cutouts
└── js/
    ├── api.js            # Mocked backend API endpoints & LocalStorage seed data
    ├── auth.js           # Auth state management, session token logic & M3 theme switcher
    ├── booking.js        # Seat map interaction & booking submission logic
    ├── bookings.js       # User ticket history fetcher & renderer
    ├── buses.js          # Route search, filtering & dynamic M3 bus card rendering
    └── dashboard.js      # Dashboard welcome greeting & stat loader
```

---

## 🛠️ How to Run Locally

You don't need an external backend server to test the application frontend!

### Using Node.js (Recommended)

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Start the local server:
   ```bash
   npm run dev
   ```
3. Open your browser at `http://localhost:3000`.

---

## 🧪 Testing Mock Data & Auth

The application is pre-seeded with sample data in `js/api.js`:

### Authentication Credentials
- **Email**: `govindport123@gmail.com`
- **Password**: `password123` (or any string — auto-registers new test emails!)

### Sample Bus Routes
Try searching for these available routes:
- **Trivandrum** ➔ **Ernakulam**
- **Ernakulam** ➔ **Kozhikode**
- **Trivandrum** ➔ **Bangalore**

---

*Developed as part of B-Tech S5 AWT Project.*

# 🍔 CampusBites — College Campus Food Ordering Platform

> **Unofficial UI/UX Redesign Concept for Campus Dining**  
> *A modern, premium, fully responsive full-stack concept inspired by the campus food ordering ecosystem at SRM University-AP (SRM-AP).*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-collagebites.vercel.app-FF5722?logo=vercel&logoColor=white)](https://collagebites.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Collagebites-181717?logo=github&logoColor=white)](https://github.com/snehithraj-1/Collagebites)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> 🚀 **Live Demo:** [https://collagebites.vercel.app/](https://collagebites.vercel.app/)  
> 📦 **GitHub Code:** [https://github.com/snehithraj-1/Collagebites](https://github.com/snehithraj-1/Collagebites)

---

## 🌟 Overview

**CampusBites** is an unofficial redesign and modernized full-stack web application concept for college campus dining. Tailored specifically around student dorm life, fast class intervals, and campus vendor logistics, it elevates the digital food ordering experience to match top-tier consumer apps like Swiggy, Zomato, and UberEats while remaining tailored to university campus needs.

---

## ✨ Key Features

### 1. 🏠 Dynamic Campus Home Page
- **Time-Aware Greeting**: Automatically greets students with *"Good Morning"*, *"Good Afternoon"*, *"Good Evening"*, or *"Late Night Cravings?"* based on campus time.
- **Campus Drop-off Selector**: Choose between Hostel Blocks A, B, C, D, Central Library, and Academic Blocks.
- **Interactive Search**: Full-screen instant search modal with recent and popular campus cravings.
- **Cuisine Filters**: Quick filters for Biryani, Chinese Wok, Rolls & Wraps, Fresh Fruits, Shakes, and Sweets.
- **Bestsellers Shelf**: Horizontal scrollable shelf featuring top-ordered dishes with ratings and prep times.

### 2. 🏪 Campus Food Corner Storefronts
- Dedicated vendor storefronts for authentic campus partners:
  - **Hotel Bheemasena** (5.0 ⭐ — Authentic Biryani, Butter Chicken & Starters)
  - **Food Corner** (4.8 ⭐ — Chicken Noodles, Fried Rice & Veg Manchurian)
  - **A1 Biryani** (4.9 ⭐ — High-value Hyderabadi Dum & Mixed Biryanis)
  - **Fruit Market** (4.7 ⭐ — Daily fresh seasonal fruits delivered at market rates)
  - **The Caffeine Lab** (4.8 ⭐ — Oreo Milkshakes, Cold Brews & Cutting Chai)

### 3. 🍱 Food Customization Modal
- High-resolution photography and ingredient transparency.
- Interactive **Spiciness Level selector** (*Mild 🌶️*, *Medium 🌶️🌶️*, *Extra Spicy 🌶️🌶️🌶️*).
- Chef instructions input for custom requests (*"Less oil, extra green chutney"*).
- Animated quantity counter.

### 4. 🛒 Slide-Over Cart & Promo Engine
- Persistent cart state saved via `LocalStorage`.
- Working campus voucher engine:
  - `CAMPUS50`: 50% OFF up to ₹100 for verified campus students
  - `SRMFEAST`: Flat ₹40 OFF
  - `FREEDEL`: Free campus doorstep delivery
- Real-time bill breakdown (Subtotal, Promo discount, Packaging, Grand Total).

### 5. 💳 Hostel Checkout Flow
- Select hostel block, room number, and courier drop-off instructions.
- Simulated payment options:
  - UPI on Delivery (Google Pay, PhonePe, Paytm QR)
  - Cash on Delivery (COD) at Hostel Gate
  - Student Campus Meal Card simulation
- Confetti celebration upon placing the order.

### 6. 🛵 5-Stage Live Order Tracker
- Real-time multi-stage status progress:
  1. **Order Placed** — Recorded by dining desk
  2. **Order Confirmed** — Kitchen printed ticket
  3. **Being Prepared** — Chef cooking fresh
  4. **Out for Delivery** — Courier en route to hostel block
  5. **Delivered** — Pick up & enjoy!
- **"Simulate Next Stage (Demo)"** button to showcase status progression during presentations.
- Simulated delivery partner contact card.

### 7. 👤 Student Profile & History
- Student ID card with verified status, roll number, and contact info.
- Full order history with **1-Click Reorder** button.
- Saved campus drop-off locations and hostel curfew guidelines.

---

## 🛠️ Tech Stack & Architecture

```
collage-bites/
├── index.html               # Responsive viewport, Outfit & Plus Jakarta Sans typography
├── package.json             # React 18, Vite, Lucide-react, Canvas-confetti
├── vite.config.js           # Vite development server
├── src/
│   ├── index.css            # Custom tokens, glassmorphism, veg/non-veg badges & animations
│   ├── main.jsx             # React entrypoint wrapped in CartProvider
│   ├── App.jsx              # Main router, navbar, bottom nav, modals & floating order pill
│   ├── context/
│   │   └── CartContext.jsx  # Global state for cart, coupons, active order & toast
│   ├── data/
│   │   └── campusFoodData.js# Data models for vendors, dishes, prices, and locations
│   ├── components/
│   │   ├── Navbar.jsx       # Frosted glass top header with location picker
│   │   ├── BottomNav.jsx    # Native mobile bottom app bar
│   │   ├── FoodCard.jsx     # Food card with dual-state ADD button
│   │   ├── VendorCard.jsx   # Campus kitchen highlight card
│   │   ├── CategoryPills.jsx# Scrollable cuisine filters
│   │   ├── CartDrawer.jsx   # Slide-over cart drawer with voucher engine
│   │   ├── FoodDetailModal.jsx # Dish customization modal
│   │   ├── SearchModal.jsx  # Instant campus search modal
│   │   └── CheckoutModal.jsx# Hostel room drop-off & payment form
│   └── pages/
│       ├── HomePage.jsx     # Split hero, categories, popular shelf & student reviews
│       ├── VendorPage.jsx   # Vendor storefront with in-menu search
│       ├── OrderTrackingPage.jsx # 5-stage live status tracker with demo simulator
│       └── ProfilePage.jsx  # Student ID card, past orders & campus FAQ
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/snehithraj-1/Collagebites.git
cd Collagebites

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

The application will be live at:
👉 **`http://localhost:5174/`**

### Production Build
```bash
npm run build
```

---

## ⚠️ Disclaimer

*This project is an **unofficial UI/UX redesign concept** created independently for design and development demonstration purposes. It is not officially affiliated with, maintained by, or endorsed by any existing platform or university entity.*

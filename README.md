# Abhushan Fine Jewellery

> An editorial luxury storefront and bespoke appointment platform for fine gold, diamond, and welded permanent jewellery.

**Live Demo:** [abhushan-by-divyaraj.vercel.app](https://abhushan-by-divyaraj.vercel.app/)  
**Portfolio:** [divyarajchauhan.in](https://www.divyarajchauhan.in/)  
**GitHub Repository:** [github.com/diu-ctrl/Abhushan-Jewellery](https://github.com/diu-ctrl/Abhushan-Jewellery)  

---

## 1. Overview

**Abhushan** is a digital flagship storefront created for a contemporary luxury Indian fine-jewellery maison. Designed with an editorial aesthetic, refined typography, and warm tactile gold tones, the platform blends traditional heritage craft with modern e-commerce interactions.

Beyond standard catalog browsing, Abhushan introduces an interactive 'Welded Forever' permanent jewellery appointment booking flow, an interactive dynamic cart drawer, detailed gemstone provenance documentation, and a dedicated store administration console.

---

## 2. Key Features

- **Editorial Maison Experience:** Minimalist luxury visual hierarchy featuring bespoke typography, generous whitespace, and high-resolution artisan photography.
- **Nine Curated Collections:** Themed navigation across bridal heirlooms, daily fine gold, solitaire diamonds, polki, temple heritage, and modern minimalist jewels.
- **'Welded Forever' Appointment Booking:** Interactive in-store appointment reservation for permanent, clasp-less chain welding sessions with custom sizing and metal selection.
- **Dynamic Slide-Over Shopping Cart (`cart.js`):** Client-side stateful cart with instant subtotal calculation, quantity adjustments, persistent local storage, and complimentary gift packaging toggles.
- **Interactive Product Detail Pages:** 16+ dedicated product showcases with 18k/22k gold purity switches, carat breakdown, certification badges, and care instructions.
- **Admin Storefront Manager (`admin.html`):** Management console for tracking customer appointment queues, order inquiries, and inventory availability.
- **Responsive & Accessible:** Full fluid layout optimization across mobile touchscreens, tablets, and wide desktop displays.

---

## 3. Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Markup** | Semantic HTML5 (Custom Component Architecture) |
| **Styling** | Vanilla CSS3 (`styles.css`, `cart.css`) with Custom Custom Properties |
| **Interactivity** | Modern Vanilla JavaScript (`script.js`, `cart.js`, `notify.js`) |
| **Routing & Edge** | Vercel Edge Middleware (`middleware.js`) with Clean URLs |
| **Typography** | Editorial Serif & Clean Sans Pairings |
| **Deployment** | Vercel |

---

## 4. Project Preview

- **Live Storefront:** [abhushan-by-divyaraj.vercel.app](https://abhushan-by-divyaraj.vercel.app/)
- **Permanent Jewellery Booking:** [abhushan-by-divyaraj.vercel.app/#welded](https://abhushan-by-by-divyaraj.vercel.app/#welded)
- **Maison Story:** [abhushan-by-divyaraj.vercel.app/story](https://abhushan-by-divyaraj.vercel.app/story)
- **Case Study Deep-Dive:** [divyarajchauhan.in/websites#abhushan](https://www.divyarajchauhan.in/websites#abhushan)

---

## 5. Getting Started

### Local Setup
This project runs as a zero-dependency static web application.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/diu-ctrl/Abhushan-Jewellery.git
   cd Abhushan-Jewellery
   ```

2. **Serve locally:**
   You can serve the directory using any static file server (such as Python, Node `serve`, or VS Code Live Server):
   ```bash
   # Using npx serve:
   npx serve .

   # Or using Python:
   python -m http.server 3000
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Author

**Divyaraj Chauhan**  
- Portfolio: [https://www.divyarajchauhan.in/](https://www.divyarajchauhan.in/)  
- GitHub: [@diu-ctrl](https://github.com/diu-ctrl)  

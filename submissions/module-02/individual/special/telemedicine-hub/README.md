# Telemedicine Triage & Patient Booking Hub (`telemedicine-hub`)

**Mentee:** Special (`@christogun58-boop`)  
**Module:** Module 02 — UI/UX Engineering (Google Stitch) & Collaborative Git  
**Feature Branch:** `feat/m02-ind-special`  
**Assigned Topic:** Telemedicine Triage & Patient Booking Hub  
**Google Stitch Prototype URL:** _[Paste your shareable Google Stitch prototype link before submitting your PR]_

---

## 1. Overview & Architecture

**MedBridge Telemedicine Hub** is a full-stack, mobile-first clinical triage and appointment booking web application engineered to screen patients for life-threatening red-flag symptoms before scheduling telehealth consultations.

```text
telemedicine-hub/
├── public/
│   ├── index.html        # Semantic, accessible triage form & booking UI
│   ├── styles.css        # 8pt grid, 60-30-10 color tokens, WCAG AA, 5 states
│   └── app.js            # Triage submission, slot selection & clinic queue
├── src/
│   ├── triageEngine.js   # RED / YELLOW / GREEN red-flag & urgency logic
│   └── server.js         # Express REST API & consultation booking endpoints
├── .gitignore
├── package.json
└── README.md
```

### Clinical Triage Pathway (`RED` / `YELLOW` / `GREEN`)

1. **`RED` (Emergency):** Triggered when any symptom matches `chest pain`, `difficulty breathing`, `severe bleeding`, `unconscious`, or `stroke`. Sets `allowOnlineBooking: false`, locks online booking, and directs the patient to immediate in-person emergency care.
2. **`YELLOW` (Urgent):** Triggered when symptoms match `high fever`, `persistent vomiting`, `severe headache`, `migraine`, or `infection`. Sets `allowOnlineBooking: true` and highlights priority teleconsultation slots within 2 hours.
3. **`GREEN` (Routine):** Assigned when no RED or YELLOW flags are present. Sets `allowOnlineBooking: true` for standard appointment booking.

---

## 2. Quick Start

### Prerequisites
- Node.js `v18+` and `npm`

### Install & Run
```bash
cd submissions/module-02/individual/special/telemedicine-hub
npm install
npm start
```

Open `http://localhost:3000` in your browser.

---

## 3. REST API Reference

| Method | Endpoint | Request / Response |
| :--- | :--- | :--- |
| `POST` | `/api/triage` | Body: `{ patientName, symptoms[] }` → Returns `{ patientName, priority, action, allowOnlineBooking }` |
| `POST` | `/api/bookings` | Body: `{ patientName, phone, priority, slot }` → Returns `201 { message, booking }` |
| `GET` | `/api/bookings` | Returns `{ total, bookings[] }` (live clinic queue) |

---

## 4. Module 02 UI/UX Engineering Audit

### A. 8pt Spatial Grid System
- **Base Rhythm:** `8px` (`--space-2: 8px`, `--space-3: 16px`, `--space-4: 24px`, `--space-5: 32px`, `--space-6: 48px`, `--space-7: 64px`).
- **4px Micro-Grid (`--space-1: 4px`):** Restricted strictly to compact badge padding and icon-to-label alignment.
- **Responsive Breakpoints & Grid Spec:**
  - **Mobile (`< 768px`):** 4-column fluid layout, `16px` gutter, `16px` page margin.
  - **Tablet (`>= 768px`):** 8-column layout, `24px` gutter, `24px` page margin.
  - **Desktop (`>= 1024px`):** 12-column grid (`max-width: 1200px`, 7-col workspace + 5-col sticky sidebar), `24px` gutter, `32px` page margin.
- **Touch Targets:** Minimum `48px` height on all buttons, form controls, and selectable cards.

### B. 60-30-10 Color Architecture & Verified WCAG AA Contrast Table

All foreground/background pairs were verified mathematically against WCAG 2.1 relative luminance (`>= 4.5:1` for normal text, `>= 3.0:1` for UI boundaries and focus indicators):

| Role | Share | Hex Token | Paired Foreground / Background | Contrast Ratio | WCAG AA Pass |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dominant / Neutral Canvas** | 60% | `#F8FAFC` / `#FFFFFF` | `#0F172A` text on `#FFFFFF` | `17.85:1` | Yes |
| **Dominant / Body Secondary** | 60% | `#475569` | `#475569` text on `#FFFFFF` | `7.58:1` | Yes |
| **Secondary Structural Chrome** | 30% | `#0F2942` | `#FFFFFF` text on `#0F2942` | `14.83:1` | Yes |
| **Secondary Structural Panel** | 30% | `#F1F5F9` | `#334155` text on `#F1F5F9` | `9.45:1` | Yes |
| **UI Control Boundary** | 30% | `#64748B` | `#64748B` border on `#FFFFFF` | `4.76:1` | Yes (`>= 3:1`) |
| **Accent / Primary CTA** | 10% | `#0F766E` | `#FFFFFF` text on `#0F766E` | `5.47:1` | Yes |
| **Accent / Hover CTA** | 10% | `#115E59` | `#FFFFFF` text on `#115E59` | `7.58:1` | Yes |
| **Accent / Active CTA** | 10% | `#134E4A` | `#FFFFFF` text on `#134E4A` | `9.48:1` | Yes |
| **Accent Tint Surface** | 10% | `#F0FDFA` | `#115E59` text on `#F0FDFA` | `7.27:1` | Yes |
| **Keyboard Focus Ring** | Accent | `#0369A1` | `#0369A1` ring on `#FFFFFF` | `5.93:1` | Yes (`>= 3:1`) |
| **Semantic: RED (Emergency)** | Semantic | `#B91C1C` / `#FEF2F2` | `#FFFFFF` on `#B91C1C` / `#991B1B` on `#FEF2F2` | `6.47:1` / `7.60:1` | Yes |
| **Semantic: YELLOW (Urgent)** | Semantic | `#B45309` / `#FFFBEB` | `#FFFFFF` on `#B45309` / `#92400E` on `#FFFBEB` | `5.02:1` / `6.84:1` | Yes |
| **Semantic: GREEN (Routine)** | Semantic | `#047857` / `#ECFDF5` | `#FFFFFF` on `#047857` / `#065F46` on `#ECFDF5` | `5.48:1` / `7.29:1` | Yes |
| **Disabled Controls** | State | `#E2E8F0` / `#475569` | `#475569` text on `#E2E8F0` | `6.15:1` | Yes |

### C. Five Interactive Component States

Every core interactive control (primary/secondary buttons, form inputs, selectable symptom cards, modality filter tabs, and clinician time-slot cards) implements all 5 required states (also inspectable live inside the page's collapsible **UI/UX Design System Audit** specimen):

- [x] **Default** — Crisp resting borders (`#64748B`) and high-contrast labels.
- [x] **Hover** — Clear color shift (`#115E59` / `#F0FDFA` / `#E2E8F0`) and subtle elevation on slot cards.
- [x] **Focus** — Visible `3px solid #0369A1` keyboard `:focus-visible` ring with `2px` offset (`5.93:1` contrast).
- [x] **Active / Pressed** — Deepened fill (`#134E4A` / `#CCFBF1`) with `translateY(1px)` tactile press feedback.
- [x] **Disabled** — Desaturated `#E2E8F0` fill, `#94A3B8` border, `#475569` label, and `cursor: not-allowed` (demonstrated on pre-booked slots and the locked booking CTA).

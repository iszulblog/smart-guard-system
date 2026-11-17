# Smart Guard Verification & Patrol System (SGVS V2)

[![Version](https://img.shields.io/badge/Version-2.0.0-emerald.svg)](https://smart-guard-system.vercel.app)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2016-black.svg)](https://nextjs.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS%203.4-sky.svg)](https://tailwindcss.com)
[![Platform](https://img.shields.io/badge/Mobile-Android%20Flutter-blue.svg)](https://flutter.dev)

SGVS V2 is a modern, high-precision security guard tour, perimeter geofencing, and shift attendance verification platform. Designed from the ground up with a crisp, minimalist, high-contrast light theme, SGVS provides zero-friction mobile operation for field security guards and a central command dashboard for operations supervisors.

---

## 1. Global Market Research & Benchmark

We conducted a comprehensive analysis of the world's leading commercial guard tour and patrolling platforms:

| Feature / Metric | TrackTik | Silvertrac | Guardso / Novagems | **SGVS V2 (Our System)** |
| :--- | :--- | :--- | :--- | :--- |
| **User Interface (UI)** | Cluttered enterprise forms, dense dark/gray tables | Dated, utilitarian 2010s aesthetic, text-heavy | Traditional form cards, high cognitive load | **Modern Linear/Apple-inspired minimalist light theme (`#f8fafc`), clean visual badges, low text density** |
| **Waypoint Stepper** | Nested menus | Form drop-downs | Linear checklist | **Visual timeline stepper with real-time distance radar and progress bar** |
| **Perimeter Verification** | GPS Breadcrumbs | Fixed NFC tags | Geofencing & QR | **High-precision GPS Geofencing (15m–50m radius) with real-time distance calculations** |
| **Audit Photos** | Unwatermarked attachments | Basic timestamp text | Uncompressed uploads | **Client-side compressed (70KB–110KB) Canvas security watermark with GPS coordinates, guard ID, waypoint & tamper stamp** |
| **Checklist Audits** | Add-on module | Form fields | Preset checklists | **Interactive task checklist per waypoint with instant checkbox validation** |
| **Offline-First** | Partial cache | Device buffer | Limited | **Full offline-first IndexedDB/localStorage queue with auto-reconnection synchronization** |
| **Field Mobile Operation** | Heavy native app | Browser / App | Mobile app | **Lightweight PWA + Native Android APK with WebRTC camera and hardware GPS integration** |
| **Database Architecture** | Proprietary Cloud | Hosted SQL | Multi-tenant SaaS | **Dual-adapter: Local high-concurrency SQLite (WAL mode) or Serverless Supabase PostgreSQL** |

---

## 2. Key Capabilities in SGVS V2

### 🛡️ For Security Guards (Mobile App)
- **Zero-Friction Authentication**: Fast sign-in using Officer ID and 4-digit PIN.
- **Real-Time Geofence Radar**: Live distance calculations showing how close the guard is to the post center.
- **Shift Attendance Clock In / Out**: Instant one-tap shift logging backed by live watermarked camera verification.
- **Sequential Waypoint Patrols**:
  - Live distance to next target checkpoint (e.g. `12m away • Within Range`).
  - Waypoint inspection tasks (e.g., *Verify fire doors unlocked*, *Check fire extinguisher pressure*, *Confirm padlock engaged*).
  - Geotagged photo capture with automated security watermark overlay.
- **Incident & Anomaly Reporting**: On-the-fly incident dispatches for broken locks, hazards, or suspicious activity.
- **Offline Reliability**: Automatically saves records if cellular data drops; syncs in background once connection returns.

### 🏢 For Operations & HR Supervisors (Command Center)
- **Live Command Dashboard**: Real-time Leaflet OpenStreetMap displaying all posts, active guards, and patrol routes.
- **Post & Route Configurator**:
  - Add and adjust guard posts and geofence radii directly on the map.
  - Build sequential patrol routes per guard post with custom inspection tasks.
- **Integrity & Flagged Audit Center**: Review out-of-bounds clock-ins with high-resolution map forensics and photo evidence.
- **Excel Audit Reports**: Generate multi-sheet `.xlsx` workbooks detailing shift attendance and patrol tour completions.
- **Telegram Bot Integration**: Instant alerts sent to Telegram channels for perimeter breaches or patrol anomalies.

---

## 3. Technology Stack

- **Frontend & Backend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS (Tailored light theme palette: Slate-50, Slate-900, Sky-600, Emerald-600)
- **Maps & Geospatial**: Leaflet + OpenStreetMap + Haversine Great-Circle Geofencing Formula
- **Database**:
  - Local/On-Premise: `better-sqlite3` in WAL mode
  - Production/Cloud: Supabase (PostgreSQL with Row Level Security)
- **Mobile Container**: Flutter 3.41 + Dart 3.11 with Android native camera and geolocation permissions
- **Exports**: SheetJS (`xlsx`) for Microsoft Excel reports

---

## 4. Folder Structure (V2)

```
sgvs-v2/
├── guard_mobile_app/       # Native Flutter Android WebView app wrapper
│   └── lib/main.dart       # Light theme, auto-granted camera & GPS permissions
├── src/
│   ├── app/
│   │   ├── admin/          # Command center (Overview, Posts, Guards, Flags, Reports, Settings)
│   │   ├── api/            # REST API endpoints (Attendance, Patrol Checkpoints, Runs, Verify)
│   │   ├── guard/          # Field mobile client (Login, Check-in, Patrol Stepper, History)
│   │   ├── globals.css     # Clean light palette & typography
│   │   └── page.tsx        # Portal selector & download landing page
│   ├── components/         # LeafletMap, CameraCapture, OfflineBanner, AdminNavbar
│   └── lib/                # db.ts (SQLite), supabase.ts, data-service.ts, geofence.ts, watermark.ts, excel.ts
├── supabase_schema.sql     # PostgreSQL migration script with tables, indexes & RLS policies
└── next.config.mjs         # Production Next.js 16 configuration
```

---

## 5. Getting Started

### Local Development
```bash
cd sgvs-v2
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.

### Production Build
```bash
npm run build
npm start
```

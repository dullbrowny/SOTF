# White‑Label School PoC — Vite + React (Frontend-only, Mocked)

A clickable investor demo showing six core journeys using static JSON mocks — **no backend required**.

## ✨ Includes
- React Router routes for 6 screens (Teacher, Student, Admin, Parent)
- Mock API (fetches from `/public/api/*.json` with artificial latency)
- KPI components and simple charts (Chart.js)
- Heatmap table (no external dep)
- Dark UI with minimal styles

## 🚀 Run locally
```bash
npm install
npm run dev
# open http://localhost:5173
```
or
```bash
pnpm i && pnpm dev
```

## 🧭 Routes
- `/` — Teacher Assessment Studio
- `/grading` — Teacher Auto-Grading
- `/practice` — Student Personalized Practice
- `/tutor` — Student AI Tutor Chat
- `/admin` — Admin Dashboard
- `/parent` — Parent Weekly Digest

## 🧪 Mock data
Edit files in `public/api/*.json`. The mock API adds ~400ms delay to simulate "AI thinking".

## 🧱 Structure
```
src/
  api/mockApi.js
  components/
  pages/
    charts.jsx
```

## 📦 Deploy
- Push to GitHub, connect to Vercel/Netlify
- Ensure `public/api` is included

## 🔒 Notes
This is a demo. No auth, no PII. Replace with real APIs later.


## 🎛 Demo Data Switcher
Use the top‑nav selector to switch between **Grade 7 / Grade 8 / Grade 9** datasets.  
Data files live under `public/api/datasets/{g7|g8|g9}/`.

## 🏷 White‑Label
This PoC is brand‑agnostic. No vendor or company names included.

# 🏫 School of the Future – VC Demo

> 🚀 A role-based adaptive learning platform prototype with GenAI integration, designed for 21st-century education.

---

## 🎯 Purpose of This Demo

This is a **VC-facing demo** that simulates the **School of the Future** experience through role-specific dashboards for Admins, Parents, Students, and Tutors. The current version is deployed on **Vercel** and is built for showcasing **adaptive learning**, **data-driven insights**, and **GenAI-powered enhancements**.

---

## 📌 Key Features Implemented

### 1. 🧑‍🏫 Admin Dashboard
- Overview of system usage and engagement
- Cards showing placeholder stats (students, tutors, sessions, reports)
- Foundation for future analytics and content coverage heatmaps

### 2. 👨‍👩‍👧 Parent Dashboard
- View child’s performance trends
- Summary-level cards (practice completed, topics attempted)
- Weekly digest simulation (planned)

### 3. 👩‍🎓 Student Dashboard
- Subject-wise practice panel
- Topic selection and question attempts
- Progress bar/accuracy mock stats

### 4. 👨‍🏫 Tutor Dashboard
- Overview of tutoring sessions
- Student progress and suggested intervention areas
- Planned integration of tutor logs + insights

---

## 🤖 GenAI Capabilities (Current)

### ✅ Basic GenAI Mockups Included:
- **Generate Questions Button**: In the Practice panel
- **LLM-Simulated Response**: Generates a few MCQs using a mocked OpenAI/Together.ai endpoint
- **Question Variation**: Students are shown adaptive variants of the same concept

```js
// Mock AI call (placeholder)
const response = await fetch('/api/genai', {
  method: 'POST',
  body: JSON.stringify({ topic: 'Simple Equations' }),
});
```

---

## 🔮 GenAI Roadmap (Future Opportunities)

### ✅ Student-Facing
- **AI-Generated Explanations & Hints**
- **Concept Mastery Evaluation via Q&A**
- **Dynamic Question Difficulty Adaptation**

### ✅ Teacher/Tutor-Facing
- **AI-Based Auto-Grading** for subjective answers
- **Question Bank Generator** from curriculum inputs
- **Assessment Quality Analyzer** (based on Bloom’s taxonomy)

### ✅ Admin-Facing
- **System-wide Usage Insights** via AI summaries
- **Content Gap Detection** using AI topic modeling
- **Predictive Analytics** (drop-off risk, improvement zones)

### ✅ Parent-Facing
- **Digest Summarization** (“Your child has mastered algebra but needs help in geometry”)
- **Comparative Insights** (vs class averages, trends)

---

## 🧱 Tech Stack

| Layer        | Tech Stack              |
|--------------|-------------------------|
| Frontend     | Vite + React + Tailwind |
| Charting     | Recharts / Chart.js     |
| State Mgmt   | React Context API       |
| Hosting      | Vercel (Frontend only)  |
| Backend (Mock)| Local mock APIs         |
| AI Integration | OpenAI / Together.ai (planned) |

---

## 🧪 Demo Mode (How to Use)

| Role    | Username | Description |
|---------|----------|-------------|
| Admin   | `admin`  | System-level view of engagement, user metrics |
| Parent  | `parent` | View weekly reports and child’s progress |
| Student | `student`| Practice questions and view learning trends |
| Tutor   | `tutor`  | Track students and prepare sessions |

_☑ Demo logins can be preset or shown on the login screen._

---

## 📁 Directory Structure (Simplified)

```
src/
│
├── pages/
│   ├── AdminDashboard.jsx
│   ├── ParentDigest.jsx
│   ├── StudentPractice.jsx
│   └── TutorPanel.jsx
│
├── components/
│   ├── charts/
│   └── adaptive/
│
├── api/
│   └── mockApi.js
│
├── utils/
│   └── ai-utils.js     # Placeholder for GenAI calls
```

---

## 📍 Next Steps

| Feature | Description |
|--------|-------------|
| 🔧 Adaptive Panel | Student sees personalized question sets per topic |
| 📊 Visual Dashboards | Add real-time charts to Admin, Student, Parent views |
| 🤖 AI Integration | Replace mock API with actual OpenAI/Together.ai |
| 🧠 AI Tutor | Chatbot assistant for student learning |
| 📥 Upload Flow | Faculty uploads answers and gets AI grading |
| 🎓 Curriculum Map | Subject → Chapter → Concepts → Questions |

---

## ✨ Vision Statement

**The School of the Future is data-rich, adaptive, and AI-augmented.**  
This demo is the foundation of a full-stack system where **every user gets a personalized view** of learning outcomes, and **AI empowers students, tutors, parents, and administrators** to make better decisions for the learner’s success.
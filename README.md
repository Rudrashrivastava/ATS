# 🌌 ATS Neural Analyzer (Cybernetic Edition)

An elite, full-stack career intelligence platform that uses advanced AI to bridge the gap between resumes and the global job market. Built with a high-performance **Spring Boot 3.x** backend and a premium **React.js** futuristic glassmorphic frontend.

---

## 🚀 Core Functionalities

### 1. Neural ATS Scoring Engine
- **Intelligent Analysis**: Deep-scans resumes using the Mistral AI model via Spring AI.
- **Dynamic Scoring**: Moves beyond static parsing. Every score (1-100) is calculated based on keywords, structure, quantifiable achievements, and JD alignment.
- **JD Matching**: Optional Job Description field for targeted compatibility analysis.
- **Multi-Page Support**: Robust PDF extraction that reads every page of your career history.

### 2. Market Synchronization Node
- **Live Job Mapping**: Automatically translates your resume strengths into concise search queries.
- **Glassdoor Integration**: Fetches real-time job listings from the **Glassdoor API** (proxied via OpenWebNinja).
- **Trajectory Visualization**: View active openings, company logos, and direct application links in a dedicated futuristic "Sync" view.

### 3. Persistent Talent Dashboard
- **Neural History**: Every scan is saved to a persistent MySQL database. Never lose a trajectory.
- **Real-Time Analytics**: Visualizes your career progression and historical match accuracy.
- **AI Recommendations**: Instant, actionable advice displayed directly on your talent feed.

---

## 🤖 The AI "Agents" Inside

We have engineered two distinct AI personas into the logic of this application:

### A. The Elite Technical Recruiter (Analysis Agent)
*   **Persona**: A brutal, high-standard technical recruiter who hates fluff.
*   **Mission**: To provide objective, data-driven scores and identify "Weaknesses" that most scanners miss.
*   **Location**: `ATSScoreService.java` (System Prompt).

### B. The Market Synchronization Specialist (Extraction Agent)
*   **Persona**: A strategist who knows how to map human experience to market demand.
*   **Mission**: To extract the single most powerful "Market Query" from your resume to find the highest-paying, most relevant jobs.
*   **Location**: Integrated into the `ATSScore` output schema.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend Core** | Spring Boot 3.2.5, Java 17 |
| **AI Integration** | Spring AI (Mistral / OpenAI format) |
| **Persistence** | Spring Data JPA + MySQL |
| **Security** | JWT (JSON Web Tokens) & Spring Security |
| **Frontend** | React (Vite), Axios, Lucide Icons |
| **Styling** | Custom Cybernetic CSS (Glassmorphism) |
| **External APIs** | OpenWebNinja (Glassdoor), RapidAPI (Salary Data) |

---

## ⚙️ Setup & Configuration

1.  **Backend**: Configure your `application.properties` with:
    - `rapidapi.key`
    - `openwebninja.api-key`
    - `spring.ai.openai.api-key`
2.  **Database**: Ensure a MySQL instance is running and update the connection string.
3.  **Frontend**: Run `npm install` followed by `npm run dev`.

---

## 📈 Recent Updates (v2.0)
- ✅ **Global Scrollbar Hiding**: Pure immersive "App" experience.
- ✅ **Secure Proxying**: All API keys are hidden behind a backend proxy (`JobProxyController`).
- ✅ **Reference Hardening**: Fixed PDF extraction and URL encoding for 100% crash-proof scans.

---
*Created by Rudrashrivastava • Powered by Antigravity AI*

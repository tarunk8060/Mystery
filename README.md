# AI Mystery Room — AI Detective & Case Solver

An AI-powered forensic investigation web application where **users supply the case, evidence, and suspects, and the AI acts as the lead detective**. 

Unlike traditional mystery games where the AI invents puzzles for the user to solve, **AI Mystery Room inverts the paradigm**: writers, game masters, puzzle enthusiasts, and investigators provide the crime scene facts, and the AI systematically searches for contradictions, checks alibis against timelines, tests competing hypotheses, and delivers a structured, evidence-grounded investigative report.

---

## Key Features

- **Evidence Board & Clue Cataloging:** Categorize physical, digital, forensic, timeline, document, and circumstantial evidence with verification status tags (`User-provided`, `Unverified`, `Corroborated`, `Contradicted`, `Inconclusive`).
- **Suspect Testimony & Alibi Evaluation:** Track statements, claimed alibis, and motives. The AI evaluates whether alibis hold up against physical and timeline clues without prematurely declaring guilt.
- **Strict Evidence Citation (Zero Hallucination Constraint):** Whenever the AI cites evidence, it is bound by schema to cite valid existing clue codes (e.g. `CLUE-1`, `CLUE-2`). It never fabricates non-existent clues, suspects, or timestamps.
- **Contradiction & Plot-Hole Detection:** Pinpoints conflicts between suspect statements, timestamps, and crime scene forensics.
- **Hypothesis Testing & Comparison:** Distinguishes the primary explanation from alternative scenarios, ranking likelihoods based on corroborating evidence.
- **Interactive Detective Interrogation Console:** Real-time conversational Q&A with the AI Detective grounded in the entire stored case context.
- **Stale Analysis Tracking:** Automatically flags previous analyses as outdated whenever clues or suspects are modified, alerting the user to reanalyze.
- **Comprehensive 12-Section Case Dossier Export:** Generate and export print-ready or downloadable HTML investigation reports.
- **Multi-Tenant Security:** Strict ownership isolation prevents users from accessing or modifying other users' investigations.

---

## Technology Stack

### Frontend
- **Framework:** React 18+ (Vite)
- **Styling:** Tailwind CSS (Dark cinematic detective theme: `#0B0D12`, `#121722`, `#181E2A`, `#D6B36A`, `#769BDA`)
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios with auth interceptors
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js (ES Modules)
- **Web Framework:** Express.js
- **Database & ODM:** MongoDB with Mongoose
- **AI Engine:** Official Google Gen AI SDK (`@google/genai`)
- **Validation:** Zod (HTTP payloads & AI structured JSON responses)
- **Security:** `bcryptjs` for password hashing, `jsonwebtoken` (JWT), `helmet` for security headers, `cors` origin whitelisting, `express-rate-limit` for endpoint protection.

---

## Project Structure

```
ai-mystery-room/
├── SPEC.md                  # Comprehensive System Specification (Source of Truth)
├── README.md                # Setup & Deployment Guide
├── .env.example             # Environment variable template
├── .gitignore
├── client/                  # Frontend Vite + React application
│   ├── public/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, StatusBadge, ProtectedRoute
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Landing, Login, Register, CaseList, CreateCase, Workspace, Report, Settings, NotFound
│   │   ├── services/        # api.js (Axios instance)
│   │   ├── App.jsx          # App routing
│   │   ├── main.jsx
│   │   └── index.css        # Tailwind directives & print styles
│   ├── tailwind.config.js   # Detective palette tokens
│   ├── vite.config.js       # Vite proxy & configuration
│   └── vercel.json          # SPA routing rewrites for Vercel
└── server/                  # Backend Express REST API
    ├── src/
    │   ├── config/          # env.js, db.js
    │   ├── controllers/     # authController, caseController, suspectController, clueController, analysisController
    │   ├── middleware/      # auth.js, errorHandler.js
    │   ├── models/          # User, Case, Analysis, ChatMessage
    │   ├── routes/          # authRoutes, caseRoutes
    │   ├── services/        # geminiService.js (@google/genai integration)
    │   ├── utils/           # errors.js (Custom AppError classes)
    │   ├── validators/      # authValidators.js, caseValidators.js (Zod)
    │   ├── app.js           # Express app configuration
    │   └── server.js        # Server entry point
    ├── scripts/             # testGeminiLive.js
    ├── tests/               # vitest test suites (auth, cases, ai, setup)
    └── vitest.config.js
```

---

## Prerequisites

- **Node.js:** v18.0.0 or later (v20+ or v24+ recommended)
- **npm:** v9.0.0 or later
- **MongoDB:** A local MongoDB instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.
- **Google Gemini API Key:** Obtainable free from [Google AI Studio](https://aistudio.google.com/).

---

## Local Setup & Installation

### 1. Clone & Setup Environment

```bash
git clone <repository_url>
cd ai-mystery-room
```

Copy the environment example file:
```bash
cp .env.example .env
```

Open `.env` and fill in your secrets:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection (Local MongoDB or Atlas connection string)
MONGODB_URI=mongodb://127.0.0.1:27017/ai_mystery_room

# Google Gemini API
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
GEMINI_MODEL=gemini-2.5-flash

# Authentication Secret (At least 32 characters)
JWT_SECRET=super_secret_jwt_key_at_least_32_characters_long
```

> **Security Note:** Never commit your `.env` file or paste secret API keys into source files. The `.gitignore` file already excludes `.env`.

### 2. Backend Installation & Startup

```bash
cd server
npm install
npm run dev
```

The backend server starts at `http://localhost:5000`.  
Verify health by visiting `http://localhost:5000/api/health`.

### 3. Frontend Installation & Startup

In a separate terminal:
```bash
cd client
npm install
npm run dev
```

The frontend development server starts at `http://localhost:5173`.

---

## Running Automated Tests

AI Mystery Room includes unit and integration tests covering authentication, case management, user data isolation, clue code sequencing, and Zod AI output validation.

To run the backend test suite:
```bash
cd server
npm test
```

### Running Live Gemini API Integration Test

To verify connectivity and deduction against Google's live Gemini model:
```bash
cd server
node scripts/testGeminiLive.js
```

---

## Deployment Guide

### Database: MongoDB Atlas
1. Log in to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free M0 cluster.
2. In **Database Access**, create a database user with read and write permissions to `ai_mystery_room`.
3. In **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere) so PaaS servers can connect.
4. Copy the connection string (format: `mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/ai_mystery_room?retryWrites=true&w=majority`).

### Backend: Render / Node.js Hosting
1. Create a new **Web Service** on [Render](https://render.com) connected to your repository.
2. Set **Root Directory** to `server`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `node src/server.js`.
5. In **Environment Variables**, configure:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `CLIENT_URL=https://your-frontend-app.vercel.app`
   - `MONGODB_URI=your_mongodb_atlas_connection_string`
   - `GEMINI_API_KEY=your_gemini_api_key`
   - `GEMINI_MODEL=gemini-2.5-flash`
   - `JWT_SECRET=your_production_random_secret`
6. Deploy the web service and note your backend URL (e.g., `https://ai-mystery-room-api.onrender.com`).

### Frontend: Vercel
1. Import your repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Set **Framework Preset** to `Vite`.
4. Set **Build Command** to `npm run build`.
5. Set **Output Directory** to `dist`.
6. Under **Environment Variables**, add:
   - `VITE_API_URL=https://ai-mystery-room-api.onrender.com/api`
7. Click **Deploy**. Vercel will build the frontend and apply the SPA rewrite rule configured in `client/vercel.json`.

---

## End-to-End Investigation Flow

1. **Register or Sign In:** Create your detective badge or log in with credentials.
2. **File a New Case:** Enter incident details, suspects with statements and alibis, and physical/digital clues.
3. **Trigger AI Analysis:** Click "Run AI Analysis" in the workspace. The backend invokes Gemini using structured JSON output, validates with Zod, and checks cross-references.
4. **Interrogate the Detective:** Use the AI Detective interactive chat to ask about specific clues, contradictions, or missing links.
5. **Add New Evidence:** Add new clues as they are uncovered. The workspace immediately marks the previous analysis as outdated until you click "Reanalyze Case".
6. **Export Investigation Dossier:** Navigate to the full report to review the 12 standard forensic sections, print the dossier, or download the formatted HTML report.

---

## License

MIT License. Built for mystery writers, detectives, and puzzle creators.

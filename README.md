# ProjectMind — AI-Powered Project Copilot

> Personalized AI copilot for long-term project productivity

## What it does

ProjectMind automatically tracks your coding activity through a VS Code extension, maps it to your planned tasks, detects delays, and uses AI to reschedule your plan — all without manual check-ins.

## Core features

- AI generates a day-by-day task plan from a plain English goal
- VS Code extension silently tracks file edits and saves
- Activity automatically updates task statuses (pending → partial → done)
- Delay detection runs after every activity batch
- Auto-reschedule redistributes remaining tasks when behind
- Burndown chart shows planned vs actual progress live

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS + Recharts |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| AI | Groq API (llama-3.3-70b-versatile) |
| Tracking | VS Code Extension (VSIX) |

## Getting started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Groq API key (free at console.groq.com)

### 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/projectmind.git
cd projectmind

### 2. Setup the backend
cd server
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev

### 3. Setup the frontend
cd ../client
npm install
npm run dev

### 4. Install the VS Code extension
cd ../vscode-extension
npm install
npx vsce package --no-dependencies
code --install-extension projectmind-tracker-0.0.1.vsix

## Environment variables

### server/.env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:5173

### client/.env
VITE_API_URL=http://localhost:4000

## Project structure

projectmind/
├── server/              # Express backend
│   ├── controllers/     # Route handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   └── services/        # AI + task mapping logic
├── client/              # React frontend
│   └── src/
│       ├── pages/       # Login, Register, Projects, Dashboard
│       ├── components/  # Reusable components
│       ├── store/       # Zustand auth store
│       └── api/         # Axios client
└── vscode-extension/    # VS Code tracker extension
    ├── extension.js     # Entry point
    └── tracker.js       # File event listeners
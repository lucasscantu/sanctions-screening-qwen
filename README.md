# UN Sanctions Screening System

A local web application for screening individuals and entities against the United Nations Security Council Consolidated Sanctions List. All processing happens locally on your machine — no data is sent to external services.

> ⚠️ **Disclaimer:** This system supports screening and does not make definitive legal or identity determinations. Name similarity scores are experimental and must always be reviewed by qualified personnel before making compliance decisions.

## 📁 Project Structure

```
sanctions-screening/
├── frontend/                    # React + TypeScript frontend (this codebase)
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts        # API client with search, records, sync endpoints
│   │   │   └── mock-data.ts     # Local data (replace with real backend calls)
│   │   ├── components/
│   │   │   └── Layout.tsx       # App shell with navigation
│   │   ├── lib/
│   │   │   └── similarity.ts    # Deterministic name matching algorithms
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx    # System overview
│   │   │   ├── SearchPage.tsx   # Name screening interface
│   │   │   ├── RecordDetails.tsx # Full record view
│   │   │   └── AdminPage.tsx    # Synchronization & config
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript interfaces
│   │   ├── App.tsx              # Router & providers
│   │   ├── main.tsx             # Entry point
│   │   └── index.css            # Tailwind styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tsconfig.json
├── backend/                     # Spring Boot backend (to be implemented)
│   ├── src/main/java/
│   ├── src/main/resources/
│   ├── src/test/java/
│   └── pom.xml
├── docker/
│   └── docker-compose.yml
├── scripts/
│   └── package.sh               # Packaging script
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 Quick Start (Frontend Only)

### Prerequisites
- Node.js 18+ and npm

### Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

### Build for Production

```bash
npm run build
```

The output will be in the `dist/` directory.

## 🔍 How the Search Works

### Stage 1: Deterministic Matching
Four algorithms run independently:
- **Normalized Levenshtein** — edit distance similarity
- **Jaro-Winkler** — prefix-weighted string similarity
- **Token-based** — order-independent word matching
- **Bigram (Dice)** — character-pair overlap

All names are normalized (lowercase, diacritics removed, punctuation stripped).

### Stage 2: AI Linguistic Analysis (Optional)
When Ollama is available, a local LLM analyzes shortlisted candidates for:
- Transliteration variants
- Spelling differences
- Token reordering
- Supporting/conflicting evidence

### Stage 3: Final Ranking
Combined score = 70% deterministic + 30% AI qualitative assessment.
Scores are labeled: HIGH (≥85), MEDIUM (≥65), LOW (≥45), INDETERMINATE (<45).

> 🧪 Scores are **experimental** until calibrated against labeled test data.

## 🗄️ Backend Integration

The frontend expects these REST endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?name={name}&type={type}&limit={limit}&page={page}` | Search records |
| GET | `/api/records/{id}` | Get record details |
| GET | `/api/admin/sync/status` | Get sync status |
| POST | `/api/admin/sync` | Trigger manual sync |
| GET | `/api/admin/sync/history` | Import history |
| GET | `/api/health/ollama` | Ollama availability |

To connect the frontend to a real backend, replace the mock API calls in `src/api/client.ts` with actual `fetch()` calls.

## 🤖 Ollama Configuration

Set environment variables for the backend:

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:4b
OLLAMA_ENABLED=true
OLLAMA_TIMEOUT_SECONDS=30
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

Install Ollama and download a model:

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen3:4b
```

## 📦 Packaging

To create a zip archive of the project:

```bash
# From the project root
cd ..
zip -r sanctions-screening.zip sanctions-screening/ \
  -x "sanctions-screening/**/node_modules/*" \
  -x "sanctions-screening/**/dist/*" \
  -x "sanctions-screening/**/.git/*"
```

Or use the included script:

```bash
chmod +x scripts/package.sh
./scripts/package.sh
```

## 🔒 Security Notes

- All processing is local — no data leaves your machine
- The frontend uses mock data by default; connect to a secured backend for production
- Admin endpoints should be protected with authentication
- Never expose PostgreSQL or Ollama ports publicly
- Use environment variables for all secrets

## 📊 Data Source

The official UN Security Council Consolidated Sanctions List:
https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list

Download the XML/CSV manually and import it through the admin interface.

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite 6
- Tailwind CSS 4
- React Router 6
- TanStack Query
- React Hook Form + Zod
- Lucide React icons

### Backend (planned)
- Java 21 + Spring Boot 3.5.x
- PostgreSQL + Flyway
- Spring Security
- Ollama integration

## 📝 License

This project is provided as-is for compliance screening assistance.

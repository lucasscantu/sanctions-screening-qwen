# Quick Start Guide - Name Matching System

## Quick Start (3 steps)

### Step 1: Install dependencies
```bash
npm install
```

### Step 2: Run in development mode
```bash
npm run dev
```

### Step 3: Open in browser
Access: **http://localhost:3000**

---

## Using Docker

### Start with Docker
```bash
docker-compose up -d
```

### Access
Open: **http://localhost:3000**

### Stop
```bash
docker-compose down
```

---

## Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

---

## Production Build

```bash
npm run build
```

Files will be generated in `dist/`

---

## Project Structure

```
name-matching-system/
+-- src/                    # React source code
|   +-- api/               # API client and mock data
|   +-- components/        # Reusable components
|   +-- pages/             # Application pages
|   +-- lib/               # Similarity logic
|   +-- types/             # TypeScript types
|   +-- test/              # Automated tests
+-- backend/               # Java backend (incomplete)
+-- docker-compose.yml     # Docker configuration
+-- package.json           # Dependencies
+-- README.md              # Main documentation
```

---

## Features

- **Dashboard** - System overview
- **Search** - Name matching with local AI
- **Details** - Complete record information
- **Administration** - Synchronization management

---

## Testing the Search

Try searching for:
- `John` - Multiple matches
- `Mohammed` - Transliteration variants
- `Zhang Wei` - Names in different order
- `Global Trading` - Entities

---

## Complete Documentation

- [README.md](./README.md) - Main documentation
- [TESTING.md](./TESTING.md) - Testing guide
- [DOCKER.md](./DOCKER.md) - Docker guide
- [TEST_REPORT.md](./TEST_REPORT.md) - Test report

---

## Requirements

- Node.js 18+
- npm 9+
- Docker 20.10+ (optional)

---

## Common Issues

### Port 3000 in use
```bash
# Use another port
npm run dev -- --port 3001
```

### Outdated dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Docker not working
```bash
# Rebuild from scratch
docker-compose down
docker-compose up -d --build
```

---

## Support

1. Check logs: `npm run dev` or `docker-compose logs`
2. Consult documentation in `DOCKER.md` or `TESTING.md`
3. Verify requirements are met

---

**Ready to use!**

Access http://localhost:3000 and start testing the matching system.

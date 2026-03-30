# SkillForge AI Deployment Guide

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment

Copy values from `.env.example` into:

- `backend/.env`
- `frontend/.env` only if you want a custom `VITE_API_BASE_URL`

### 3. Start locally

```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173` and backend runs on `http://localhost:5000`.

## AI Key Required?

Short answer: **No, not for the hackathon demo.**

- Use `AI_PROVIDER=mock` to run without any AI API key.
- Use `AI_PROVIDER=openai` with `OPENAI_API_KEY` for real OpenAI responses.
- Use `AI_PROVIDER=anthropic` with `ANTHROPIC_API_KEY` for real Anthropic responses.

Recommended hackathon setup:

```env
AI_PROVIDER=mock
```

## Deployment

### Single-service deploy

The backend serves `frontend/dist`, so you can deploy this as one Node service after building the frontend.

Build command:

```bash
cd frontend && npm install && npm run build
cd ../backend && npm install
```

Start command:

```bash
cd backend && npm start
```

Environment variables:

```env
PORT=5000
AI_PROVIDER=mock
```

If frontend and backend are on different domains, also set:

```env
CORS_ORIGIN=https://your-frontend-domain.com
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

### Good hosting options

- Render
- Railway
- Backend on Render/Railway + frontend on Vercel/Netlify

## Hackathon Notes

- Health check endpoint: `/api/health`
- Frontend production build verified
- Frontend lint passing
- Works without MongoDB for demo
- Works without AI keys in mock mode

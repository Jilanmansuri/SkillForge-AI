# Deployment Guide for SkillForge-AI

This project is structured as a full-stack application with a React (Vite) frontend and a Node.js (Express) backend.

## Deployment Options

### Option 1: Single Service (e.g., Render, Railway, DigitalOcean)
The project is configured so the backend can serve the frontend in production.

1.  **Build Command**: `npm run build` (This runs the frontend build).
2.  **Start Command**: `npm run start:backend` (Ensure `NODE_ENV=production` is set).
3.  **Environment Variables**:
    *   `NODE_ENV`: `production`
    *   `PORT`: `5000` (or as provided by the host)
    *   `MONGODB_URI`: Your MongoDB connection string.
    *   `AI_PROVIDER`: `openai` (or `anthropic`/`mock`).
    *   `OPENAI_API_KEY`: Your API key.
    *   `CORS_ORIGIN`: Your deployment URL (e.g., `https://your-app.onrender.com`).

### Option 2: Separate Services (Recommended for Scale)
*   **Frontend**: Deploy `frontend/` to Vercel or Netlify.
    *   Set `VITE_API_BASE_URL` to your backend URL.
*   **Backend**: Deploy `backend/` to Render or Railway.
    *   Set `CORS_ORIGIN` to your frontend URL.

## Local Production Testing
To test the production build locally:
1.  Run `npm run build` in the root.
2.  Set `NODE_ENV=production` and run `npm run start:backend`.
3.  Visit `http://localhost:5000`.

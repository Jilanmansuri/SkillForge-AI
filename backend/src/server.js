const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const routes = require('./routes/api');

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS'));
    },
  })
);

app.use(express.json());

const interviewRoutes = require('./routes/interview');
const linkedinRoutes = require('./routes/linkedin');

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    provider: process.env.AI_PROVIDER || 'mock',
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', routes);
app.use('/api/interview', interviewRoutes);
app.use('/api/linkedin', linkedinRoutes);

const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  return res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

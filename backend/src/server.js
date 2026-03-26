const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes/api');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const interviewRoutes = require('./routes/interview');
const linkedinRoutes = require('./routes/linkedin');

app.use('/api', routes);
app.use('/api/interview', interviewRoutes);
app.use('/api/linkedin', linkedinRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Serve static files from the frontend/dist folder in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Trigger nodemon restart

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const roomsRouter = require('./routes/rooms');
const bookingsRouter = require('./routes/bookings');
const contactRouter = require('./routes/contact');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/rooms', roomsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/auth', authRouter);

// Serve the frontend (static files)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Fallback: serve index.html for the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Hotel server running at http://localhost:${PORT}`);
});

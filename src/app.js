const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Routes
const authRoutes = require('./modules/auth/authRoutes');
const taskRoutes = require('./modules/task/taskRoutes');

const app = express();

// ─── GLOBAL MIDDLEWARE ────────────────────────────────────────────────────────

// helmet adds security headers to every response
// e.g. X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security
app.use(helmet());

// cors allows the frontend to talk to this API from a different origin
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// morgan logs every request: "POST /api/auth/login 200 45ms"
app.use(morgan('dev'));

// parse incoming JSON request bodies
app.use(express.json());

// ─── ROUTES ───────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
// 4 arguments = Express treats this as an error-handling middleware
// Called when any route/middleware does next(err)

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

module.exports = app;
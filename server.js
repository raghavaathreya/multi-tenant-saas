require('dotenv').config();
const app = require('./src/app');
const { connectPostgres } = require('./src/config/postgres');
const { connectMongo } = require('./src/config/mongo');

// Redis auto-connects when the client is created (in config/redis.js)
// We just need to start Postgres and Mongo before accepting requests

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to all databases first — if any fail, server won't start
    await connectPostgres();
    await connectMongo();

    // All DBs ready — now start accepting requests
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📋 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1); // exit with error code — Docker will restart the container
  }
};

// Handle unexpected crashes gracefully
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
  process.exit(1);
});

startServer();
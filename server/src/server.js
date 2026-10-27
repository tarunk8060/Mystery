import app from './app.js';
import { config, validateConfig } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

async function startServer() {
  try {
    // Validate configuration
    validateConfig();

    // Connect to MongoDB
    await connectDB();

    const server = app.listen(config.port, () => {
      console.log(`===============================================`);
      console.log(`AI Mystery Room Server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Gemini Model: ${config.geminiModel}`);
      console.log(`Gemini Key configured: ${Boolean(config.geminiApiKey)}`);
      console.log(`===============================================`);
    });

    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await disconnectDB();
        console.log('Server and database connections closed. Goodbye.');
        process.exit(0);
      });

      // Force exit if not closed in 10s
      setTimeout(() => {
        console.error('Forcefully terminating server.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('Fatal Server Startup Error:', err);
    process.exit(1);
  }
}

startServer();

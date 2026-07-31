import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';

const startServer = async () => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});

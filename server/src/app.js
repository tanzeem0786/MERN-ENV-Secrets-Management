import express from 'express';
import cors from 'cors';
import modulesRouter from './modules/index.js';
import { env } from './config/env.js';
import { securityMiddleware } from './security/index.js';
import notFoundHandler from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(securityMiddleware);
app.use(express.json());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use('/api', modulesRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

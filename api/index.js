import express from 'express';
import apiRouter from '../server/api.js';

const app = express();

// Mount the API router
app.use('/api', apiRouter);

export default app;

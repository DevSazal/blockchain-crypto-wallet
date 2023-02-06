import express from 'express';
import { json } from 'body-parser';
import { prepareUnspentOutputsRouter } from './routes/prepare-unspent-outputs';

const app = express();
app.use(json());
app.use(prepareUnspentOutputsRouter);

export { app };

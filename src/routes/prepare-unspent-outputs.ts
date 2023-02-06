import express from 'express';

const router = express.Router();

router.get('/api/prepare-unspent-outputs/', (req, res) => {
  res.status(200).send([]);
});

export { router as prepareUnspentOutputsRouter };

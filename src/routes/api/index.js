import express from 'express';
import ingestController from '../../controllers/api/ingest.controller.js';

const router = express.Router();
router.use(express.json()) // for parsing application/json

router.post('/ingest', ingestController.post);
router.post('/ingest/:platform', ingestController.post);

export default router;
import express from 'express';
import apiRouter from './api/index.js';
import app from "../app.js";

const router = express.Router();

router.use('/api', apiRouter);

router.get('/', (req, res) => {
  res.render('index');
});
router.get('/demo', (req, res) => {
  res.render('demo');
})

export default router;
import express from 'express';

const router = express.Router();
router.use(express.json()) // for parsing application/json

function ingestHandler (req, res, next) {
  // console.log(req.body);
  let platform = req.params?.platform || req.query?.platform;
  let userId = req.body?.sender?.id;
  if (platform && userId) {
    const io = req.app.locals.io;
    if (io) {
      const msg = {
        user: userId,
        text: req.body?.message?.text,
      };
      let room = `${platform}--${userId}`;
      console.log('socket send!', room, msg);
      io.in(room).emit('message', msg);
    }
  } else {
    console.log({
      platform,
      userId,
    });
  }
  res.json(req.body);
};

router.post('/ingest', ingestHandler);
router.post('/ingest/:platform', ingestHandler);

export default router;
import facebookService from '../../services/facebook.service.js';

export async function post(req, res, next) {
  console.log('Ingesting message:', req);
  let platform = req.params?.platform || req.query?.platform;
  let userId = req.body?.sender?.id;

  if (platform) {
    if (platform !== 'facebook' && platform !== 'instagram') {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    if (platform === 'facebook') {
      try {
        const result = await facebookService.handleFacebookMessage(req);
        console.log('results from facebookService', result);
        return res.status(result.status).json({ message: result.message });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }

    // const io = req.app.locals.io;
    // if (io) {
    //   const msg = {
    //     user: userId,
    //     text: req.body?.message?.text,
    //   };

    //   let room = `${platform}--${userId}`;
    //   console.log('socket send!', room, msg);
    //   io.in(room).emit('message', msg);
    // }
  } else {
    console.log({
      platform,
      userId,
    });
  }
  // res.json(req.body);
  next();
}

export async function verify(req, res) {
  console.log('Verifying Facebook webhook');
  const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    } else {
      console.log('Webhook verification failed');
      return res.status(403).send('Forbidden');
    }
  } else {
    console.log('Webhook mode or token not set');
    return res.status(403).send('Forbidden');
  }
}

export default {
  post,
  verify,
};

import facebookService from '../../services/facebook.service.js';

export async function post(req, res, next) {
  console.log('Ingesting message:');
  let platform = req.params?.platform || req.query?.platform;
  let userId = req.body?.sender?.id;

  if (platform) {
    if (platform !== 'facebook' && platform !== 'instagram') {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    if (platform === 'facebook') {
      try {
        const result = await facebookService.handleFacebookMessage(req);
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
  try {
    const result = await facebookService.verifyWebhook(req);
    return res.status(result.status).send(result.message);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export default {
  post,
  verify,
};

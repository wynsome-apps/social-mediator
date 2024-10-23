import { addToOutboundMQ } from '../../services/messagequeue.service.js';

export async function handleDiscipleToolsResponse(req, res) {
  if (!req.body) {
    return res.status(400).json({ message: 'No body provided' });
  }

  if (req.body.platform === 'facebook') {
    try {
      const result = await addToOutboundMQ(req.body);

      if (result) {
        return res
          .status(200)
          .json({ message: 'Message processed successfully' });
      } else {
        return res.status(500).json({ message: 'Message Not Processed' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  return res.status(400).json({ message: 'Invalid platform' });
}

export default {
  handleDiscipleToolsResponse,
};

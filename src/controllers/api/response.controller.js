import facebookService from '../../services/facebook.service.js';

export async function handleDiscipleToolsResponse(req, res) {
  if (!req.body) {
    return res.status(400).json({ message: 'No body provided' });
  }

  if (req.body.platform === 'facebook') {
    try {
      const result = await facebookService.sendToFacebook(req.body);
      return res.status(result.status).json({ message: result.message });
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

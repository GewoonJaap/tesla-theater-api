import { Hono } from 'hono';
import {
  startVideoProcessing,
  getVideoStatus,
  getAllVideos,
} from '../controllers/video.controller';

const videoRoutes = new Hono();

videoRoutes.post('/', startVideoProcessing);
videoRoutes.get('/', getAllVideos);
videoRoutes.get('/status/:id', getVideoStatus);

export default videoRoutes;

import express from 'express';
import aggiefeedController from '../../controllers/AggieFeed/activities.js';

const router = express.Router();

router.get('/', aggiefeedController.getActivities);

export default router;
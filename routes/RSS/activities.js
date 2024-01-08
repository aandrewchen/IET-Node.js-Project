import express from 'express';
import rssController from '../../controllers/RSS/activities.js';

const router = express.Router();

router.get('/', rssController.getActivities);
router.get('/posts', rssController.getStoredActivities);
router.get('/getSources', rssController.getSources);

export default router;
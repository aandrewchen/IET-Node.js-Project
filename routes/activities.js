import express from 'express';
import ActivitiesController from '../controllers/activities.js';

const router = express.Router();

router.get('/', ActivitiesController.getActivities);

export default router;
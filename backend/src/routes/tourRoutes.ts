import {
  deleteTour,
  getAllTours,
  getTour,
  createTour,
  updateTour,
} from '../controllers/tourController';
import express from 'express';

const router = express.Router();

// router.param('id', checkID);

// router.route('/').get(getAllTours).post(checkPostBody, createTour);
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default router;

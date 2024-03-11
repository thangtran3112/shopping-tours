import {
  deleteTour,
  getAllTours,
  getTour,
  postTour,
  updateTour,
} from '../controllers/tourController';
import express from 'express';

const router = express.Router();

router.route('/').get(getAllTours).post(postTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default router;

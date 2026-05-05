import express from 'express';
import { 
  getUserProfile, 
  updateUserProfile, 
  getAllUsers, 
  getPatients,
  deleteUser,
  updateUserClinicalDetails,
  clearUserClinicalDetails,
  updatePatientProfileDetails
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/', protect, admin, getAllUsers);
router.get('/patients', protect, getPatients);
router.delete('/:id', protect, admin, deleteUser);
router.put('/:id/profile', protect, admin, updatePatientProfileDetails);
router.put('/:id/clinical', protect, admin, updateUserClinicalDetails);
router.delete('/:id/clinical', protect, admin, clearUserClinicalDetails);

export default router;

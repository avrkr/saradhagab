const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/me', auth, userController.getMe);
router.put('/update', auth, userController.updateProfile);
router.put('/change-password', auth, userController.changePassword);
router.post('/:id/popularity', auth, userController.increasePopularity);

module.exports = router;

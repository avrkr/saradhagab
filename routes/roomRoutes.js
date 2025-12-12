const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const auth = require('../middleware/auth');

router.post('/create', auth, roomController.createRoom);
router.get('/active', auth, roomController.getActiveRooms);
router.get('/:id', auth, roomController.getRoomById);
router.get('/invite/:token', roomController.getRoomByToken); // Public endpoint to resolve token
router.post('/:id/hype', auth, roomController.hypeRoom);
router.delete('/:id', auth, roomController.deleteRoom);
router.put('/:id/status', auth, roomController.toggleRoomStatus);

// Chat routes nested here for convenience
router.get('/:id/messages', auth, roomController.getMessages);
router.post('/:id/messages', auth, roomController.sendMessage);

module.exports = router;

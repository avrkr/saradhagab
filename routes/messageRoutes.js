const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const auth = require('../middleware/auth');

// Separate route file for messages if needed, but currently handled in roomRoutes for /rooms/:id/messages
// The prompt asked for POST /api/messages/:id/react
router.post('/:id/react', auth, roomController.reactToMessage);

module.exports = router;

const Room = require('../models/Room');
const Message = require('../models/Message');
const crypto = require('crypto');

exports.createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    const token = crypto.randomBytes(4).toString('hex'); // Simple token
    
    const room = await Room.create({
      name,
      host: req.user._id,
      token,
      participants: [req.user._id]
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ active: true })
      .populate('host', 'name profileImage')
      .populate('participants', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('host', 'name profileImage')
      .populate('participants', 'name profileImage');
    
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRoomByToken = async (req, res) => {
  try {
    const room = await Room.findOne({ token: req.params.token });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.hypeRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    if (room.hypes.includes(req.user._id)) {
      return res.status(400).json({ error: 'You have already hyped this room' });
    }

    room.hypes.push(req.user._id);
    await room.save();

    res.json({ hypeCount: room.hypes.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleRoomStatus = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    if (room.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    room.active = !room.active;
    await room.save();
    res.json({ message: `Room ${room.active ? 'activated' : 'deactivated'}`, active: room.active });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Chat Controllers
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.id })
      .populate('sender', 'name profileImage')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { text, emojis } = req.body;
    const message = await Message.create({
      roomId: req.params.id,
      sender: req.user._id,
      text,
      emojis
    });
    
    const populatedMessage = await message.populate('sender', 'name profileImage');
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.reactToMessage = async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.id);
    
    if (!message) return res.status(404).json({ error: 'Message not found' });

    // Remove existing reaction from this user if any
    message.reactions = message.reactions.filter(r => r.user.toString() !== req.user._id.toString());
    
    // Add new reaction
    message.reactions.push({ user: req.user._id, emoji });
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

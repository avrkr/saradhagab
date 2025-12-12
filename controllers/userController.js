const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getMe = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'profileImage'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    updates.forEach((update) => req.user[update] = req.body[update]);
    await req.user.save();
    res.json(req.user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!req.user.passwordHash) {
      return res.status(400).json({ error: 'No password set. Use reset password flow.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, req.user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid current password' });
    }

    const salt = await bcrypt.genSalt(10);
    req.user.passwordHash = await bcrypt.hash(newPassword, salt);
    await req.user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.increasePopularity = async (req, res) => {
  try {
    const { id } = req.params;
    const userToBoost = await User.findById(id);

    if (!userToBoost) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userToBoost._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot boost yourself' });
    }

    userToBoost.popularityScore += 10;

    // Check for badges
    const score = userToBoost.popularityScore;
    const badges = [];
    if (score >= 100) badges.push('Bronze');
    if (score >= 500) badges.push('Silver');
    if (score >= 2000) badges.push('Gold');
    
    userToBoost.badges = badges;
    await userToBoost.save();

    res.json({ popularityScore: userToBoost.popularityScore, badges: userToBoost.badges });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const admin = require('../config/firebase');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name } = decodedToken;

    // 1. Try to find user by UID
    let user = await User.findOne({ uid });

    // 2. If not found by UID, try finding by Email (to prevent duplicates)
    if (!user) {
      user = await User.findOne({ email });
      
      if (user) {
        // User exists but has different/missing UID? Update it.
        user.uid = uid;
        await user.save();
      } else {
        // 3. Really doesn't exist? Create new.
        user = await User.create({
          uid,
          email,
          name: name || email.split('@')[0],
          role: 'MEMBER'
        });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
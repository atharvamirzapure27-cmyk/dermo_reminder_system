const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'avbrh_dermatology_reminder_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'avbrh_dermatology_reminder_secret_key_2026') {
  console.warn('⚠️  SECURITY WARNING: Running in production mode with default JWT_SECRET! Please configure a secure custom JWT_SECRET in environment.');
}

const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  signToken,
  verifyToken
};

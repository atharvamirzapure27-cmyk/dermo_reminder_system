const jwt = require('jsonwebtoken');

const isProduction = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET;

if (isProduction) {
  if (!JWT_SECRET || JWT_SECRET === 'avbrh_dermatology_reminder_secret_key_2026') {
    console.error('❌ FATAL SECURITY ERROR: Running in production mode with missing or default JWT_SECRET! Process terminated.');
    process.exit(1);
  }
}

const SECRET_KEY = JWT_SECRET || 'avbrh_dermatology_reminder_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

const signToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
};

module.exports = {
  signToken,
  verifyToken
};

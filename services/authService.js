const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { signToken } = require('../utils/jwt');
const HttpError = require('../utils/httpError');

const login = async (username, password) => {
  if (!username || !password) {
    throw new HttpError(400, 'Username and password are required');
  }

  const user = await userRepository.findByUsername(username);
  if (!user) {
    throw new HttpError(401, 'Invalid username or password');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new HttpError(401, 'Invalid username or password');
  }

  const token = signToken({
    id: user.id,
    username: user.username,
    role: user.role
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  };
};

module.exports = {
  login
};

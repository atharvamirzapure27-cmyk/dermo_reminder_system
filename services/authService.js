const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { signToken } = require('../utils/jwt');
const HttpError = require('../utils/httpError');

const login = async (username, password) => {
  if (!username || !password) {
    throw new HttpError(400, 'Username and password are required');
  }

  const users = await userRepository.findByUsername(username);
  if (!users || users.length === 0) {
    throw new HttpError(401, 'Invalid username or password');
  }

  let matchedUser = null;
  for (const u of users) {
    const isPasswordMatch = await bcrypt.compare(password, u.password);
    if (isPasswordMatch) {
      matchedUser = u;
      break;
    }
  }

  if (!matchedUser) {
    throw new HttpError(401, 'Invalid username or password');
  }

  const token = signToken({
    id: matchedUser.id,
    username: matchedUser.username,
    role: matchedUser.role
  });

  return {
    token,
    user: {
      id: matchedUser.id,
      username: matchedUser.username,
      role: matchedUser.role
    }
  };
};

module.exports = {
  login
};

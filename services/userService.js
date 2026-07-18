const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const HttpError = require('../utils/httpError');

const getAllUsers = async () => {
  return userRepository.findAll();
};

const getUserById = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  return user;
};

const createUser = async ({ username, password, role }) => {
  const existingUser = await userRepository.findByUsername(username);
  if (existingUser) {
    throw new HttpError(409, 'Username already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return userRepository.create({
    username,
    password: hashedPassword,
    role
  });
};

const deleteUser = async (id) => {
  const affectedRows = await userRepository.deleteById(id);
  if (affectedRows === 0) {
    throw new HttpError(404, 'User not found');
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser
};

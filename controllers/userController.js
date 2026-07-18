const userService = require('../services/userService');
const auditService = require('../services/auditService');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    
    // Basic validation
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username is required and must be at least 3 characters long'
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!password || typeof password !== 'string' || !passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and symbols (@, $, !, %, *, ?, &, #)'
      });
    }

    const validRoles = ['admin', 'receptionist'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be admin or receptionist'
      });
    }

    const user = await userService.createUser({
      username: username.trim(),
      password,
      role
    });

    await auditService.log(req, 'user_created', `Created user account: ${username.trim()} with role ${role}`);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const userToDelete = await userService.getUserById(userId);
    
    // Prevent deleting oneself
    if (userToDelete.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Prevent deleting default superadmin
    if (userToDelete.username === 'superadmin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the default superadmin account'
      });
    }

    await userService.deleteUser(userId);

    await auditService.log(req, 'user_deleted', `Deleted user account: ${userToDelete.username}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const limit = req.query.limit || 100;
    const logs = await auditService.getRecentLogs(limit);
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

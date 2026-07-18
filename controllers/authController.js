const authService = require('../services/authService');
const auditService = require('../services/auditService');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Attempt login
    const result = await authService.login(username, password);
    
    // Set secure cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 12 * 60 * 60 * 1000 // 12 hours
    });

    // Populate temporary req.user for audit logging
    req.user = result.user;
    await auditService.log(req, 'login', `User ${username} logged in successfully`);

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    // Log failed login attempt
    const username = req.body.username || 'unknown';
    await auditService.log(req, 'login_failed', `Failed login attempt for user: ${username}`);
    
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      await auditService.log(req, 'logout', `User ${req.user.username} logged out`);
    }
    
    res.clearCookie('token');
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

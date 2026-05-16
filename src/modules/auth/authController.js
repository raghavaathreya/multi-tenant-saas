const { register, login, logout } = require('./authService');

// Controller's only job: receive request, call service, send response
// Business logic lives in the service — not here

const registerController = async (req, res) => {
  try {
    const { name, email, password, orgName } = req.body;
    const result = await register({ name, email, password, orgName });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login({ email, password });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

const logoutController = async (req, res) => {
  try {
    // Extract token from "Authorization: Bearer <token>" header
    const token = req.headers.authorization?.split(' ')[1];
    if (token) await logout(token);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { registerController, loginController, logoutController };
const Tenant = require('../models/pg/Tenant');

// Runs after authenticate middleware
// req.user already has tenantId from the JWT
// This middleware fetches the full tenant record and attaches it to req.tenant
// So controllers can do req.tenant.name, req.tenant.slug etc. without DB calls

const resolveTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne({
      where: { id: req.user.tenantId, isActive: true },
    });

    if (!tenant) {
      return res.status(403).json({ success: false, message: 'Tenant not found or inactive' });
    }

    req.tenant = tenant; // attach full tenant to request
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error resolving tenant' });
  }
};

module.exports = { resolveTenant };
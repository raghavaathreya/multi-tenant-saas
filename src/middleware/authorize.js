// Role hierarchy:
// admin  → can do everything
// member → can create/edit tasks, cannot manage members or tenant settings
// viewer → read-only, cannot create or modify anything

// Permission map — defines which roles can access which actions
const permissions = {
  admin:  ['read', 'create', 'update', 'delete', 'manage_members'],
  member: ['read', 'create', 'update'],
  viewer: ['read'],
};

// Factory function — returns a middleware for a specific required permission
// Usage in routes: router.delete('/tasks/:id', authorize('delete'), controller)

const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(403).json({ success: false, message: 'No role found' });
    }

    const userPermissions = permissions[userRole] || [];

    // Check if user has ALL required permissions for this route
    const hasPermission = requiredPermissions.every((p) => userPermissions.includes(p));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required: ${requiredPermissions.join(', ')}. Your role: ${userRole}`,
      });
    }

    next();
  };
};

module.exports = { authorize };
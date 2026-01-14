function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    const roles = req.user?.roles || [];
    const ok = allowedRoles.some((r) => roles.includes(r));

    if (!ok) return res.status(403).json({ error: "Forbidden" });
    return next();
  };
}

module.exports = { requireRoles };

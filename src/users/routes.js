const router = require("express").Router();
const auth = require("../middleware/auth");
const { requireRoles } = require("../middleware/rbac");

router.get("/me", auth, (req, res) => {
  res.json({ user: req.user });
});

// example admin-only route
router.get("/admin/ping", auth, requireRoles("admin"), (req, res) => {
  res.json({ ok: true, message: "admin access granted" });
});

module.exports = router;

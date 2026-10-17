const router = require("express").Router();
const controller = require("../controllers/adminController");
const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.use(authenticate, allowRoles("admin"));
router.get("/stats", controller.dashboardStats);
router.get("/users", controller.listUsers);
router.patch("/users/:id/status", controller.setUserStatus);

module.exports = router;

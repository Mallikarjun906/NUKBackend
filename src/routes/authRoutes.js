const router = require("express").Router();
const controller = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const { validateBody } = require("../middleware/validateMiddleware");

router.post("/register", validateBody(["name", "email", "phone", "password", "location"]), controller.register);
router.post("/login", controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", authenticate, controller.logout);

module.exports = router;

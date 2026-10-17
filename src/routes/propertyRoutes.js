const router = require("express").Router();
const controller = require("../controllers/propertyController");
const { authenticate } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { uploadListingImages } = require("../middleware/uploadMiddleware");

router.get("/", controller.listProperties);
router.get("/:id", controller.getProperty);
router.post("/", authenticate, allowRoles("provider"), uploadListingImages, controller.createProperty);
router.patch("/:id", authenticate, allowRoles("provider", "admin"), uploadListingImages, controller.updateProperty);
router.delete("/:id", authenticate, allowRoles("provider", "admin"), controller.deleteProperty);
router.delete("/:id/images/:imageId", authenticate, allowRoles("provider", "admin"), controller.deletePropertyImage);

module.exports = router;

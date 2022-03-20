const { Router } = require("express");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = Router();

router.get("/signup", authController.signup_get);
router.post("/signup", authController.signup_post);
router.get("/login", authController.login_get);
router.post("/login", authController.login_post);
router.get("/:username/tasks", requireAuth, authController.get_tasks);
router.post("/:username/tasks", requireAuth, authController.post_task);
router.post("/:username/tasks/delete", requireAuth, authController.delete_task);
router.get("/:username/profile", requireAuth, authController.get_profile);
router.post("/:username/profile", requireAuth, authController.update_profile);
router.get("/:username/courses", requireAuth, authController.get_courses);
router.post("/:username/courses", requireAuth, authController.update_courses);
router.get("/logout", authController.get_logout);

module.exports = router;

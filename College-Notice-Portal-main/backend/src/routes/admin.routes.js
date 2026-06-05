const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(authenticateToken);
router.use(authorizeRole(["admin"]));

// Dashboard
router.get("/dashboard", adminController.getDashboard);

// Users
router.get("/users", adminController.getAllUsers);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

// Notices (with file upload support)
router.get("/notices", adminController.getAllNotices);
router.post(
  "/notices",
  upload.array("attachments", 5),
  adminController.createNotice
);
router.put(
  "/notices/:id",
  upload.array("attachments", 5),
  adminController.updateNotice
);
router.delete("/notices/:id", adminController.deleteNotice);
router.delete("/attachments/:id", adminController.deleteAttachment);

// Classes
router.get("/classes", adminController.getAllClasses);
router.post("/classes", adminController.createClass);
router.delete("/classes/:id", adminController.deleteClass);

// Sections
router.get("/sections", adminController.getAllSections);
router.get("/sections/class/:classId", adminController.getSectionsByClass);
router.post("/sections", adminController.createSection);
router.put("/sections/:id", adminController.updateSection);
router.delete("/sections/:id", adminController.deleteSection);

// Faculty Assignments
router.post("/assign-faculty", adminController.assignFacultyToClass);
router.delete("/remove-faculty", adminController.removeFacultyFromClass);
router.post("/assign-faculty-section", adminController.assignFacultyToSection);
router.delete(
  "/remove-faculty-section",
  adminController.removeFacultyFromSection
);

module.exports = router;
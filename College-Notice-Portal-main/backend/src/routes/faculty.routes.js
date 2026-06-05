const express = require("express");
const router = express.Router();
const facultyController = require("../controllers/faculty.controller");
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(authenticateToken);
router.use(authorizeRole(["faculty", "admin"]));

router.get("/dashboard", facultyController.getDashboard);
router.get("/notices", facultyController.getNotices);
router.post(
  "/notices",
  upload.array("attachments", 5),
  facultyController.createNotice
);
router.put(
  "/notices/:id",
  upload.array("attachments", 5),
  facultyController.updateNotice
);
router.delete("/notices/:id", facultyController.deleteNotice);
router.get("/students", facultyController.getStudents);
router.get("/departments", facultyController.getAllClasses);
router.get("/classes", facultyController.getMyClasses);
router.get("/sections", facultyController.getMySections);
router.get("/all-sections", facultyController.getAllSections);

module.exports = router;

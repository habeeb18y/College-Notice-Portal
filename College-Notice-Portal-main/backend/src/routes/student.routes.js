const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRole(['student', 'faculty', 'admin']));

router.get('/dashboard', studentController.getDashboard);
router.get('/notices', studentController.getNotices);
router.get('/notices/:id', studentController.getNoticeById);
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);
router.get('/departments', studentController.getDepartments);

module.exports = router;

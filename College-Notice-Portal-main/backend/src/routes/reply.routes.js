// backend/src/routes/reply.routes.js

const express = require("express");
const router = express.Router();
const replyController = require("../controllers/reply.controller");
const { authenticateToken } = require("../middleware/auth");

// All routes require authentication
router.use(authenticateToken);

// Create a reply
router.post("/", replyController.createReply);

// Get all replies for a specific notice
router.get("/notice/:notice_id", replyController.getNoticeReplies);

// Get user's replies (sent and received)
router.get("/my-replies", replyController.getUserReplies);

// Update a reply
router.put("/:id", replyController.updateReply);

// Delete a reply
router.delete("/:id", replyController.deleteReply);

// Mark reply as read
router.post("/:id/mark-read", replyController.markReplyAsRead);

module.exports = router;

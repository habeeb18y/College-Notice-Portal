// backend/src/controllers/reply.controller.js

const {
  createReply,
  addReplyRecipient,
  getNoticeReplies,
  getReplyById,
  getUserReplies,
  deleteReply,
  updateReply,
  markReplyAsRead,
  getUnreadRepliesCount,
  getNoticeById,
  getNoticeRecipientUserIds,
} = require("../models/queries");

// Create a reply to a notice
const createReplyController = async (req, res) => {
  try {
    const { notice_id, message, reply_type } = req.body;
    const sender_id = req.user.id;

    // Validate notice exists
    const notice = await getNoticeById(notice_id);
    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    // Create the reply
    const reply = await createReply({
      notice_id,
      sender_id,
      message,
      reply_type,
    });

    // If REPLY_ALL, add all notice recipients
    if (reply_type === "REPLY_ALL") {
      const recipientIds = await getNoticeRecipientUserIds(notice_id);

      // Don't add the sender as a recipient
      const filteredRecipients = recipientIds.filter((id) => id !== sender_id);

      for (let userId of filteredRecipients) {
        await addReplyRecipient(reply.id, userId);
      }
    } else if (reply_type === "REPLY") {
      // Add only the notice sender as recipient (but not if they're the same person)
      if (notice.sent_by !== sender_id) {
        await addReplyRecipient(reply.id, notice.sent_by);
      }
    }

    // Get complete reply with recipients
    const completeReply = await getReplyById(reply.id);

    res.status(201).json({
      message: "Reply created successfully",
      reply: completeReply,
    });
  } catch (error) {
    console.error("Create reply error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all replies for a notice
const getNoticeRepliesController = async (req, res) => {
  try {
    const { notice_id } = req.params;
    const user_id = req.user.id; // ADD THIS LINE

    const notice = await getNoticeById(notice_id);
    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    // Pass user_id to filter replies
    const replies = await getNoticeReplies(notice_id, user_id); // ADD user_id parameter

    res.json({ replies });
  } catch (error) {
    console.error("Get notice replies error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get user's replies (sent and received)
const getUserRepliesController = async (req, res) => {
  try {
    const replies = await getUserReplies(req.user.id);
    const unreadCount = await getUnreadRepliesCount(req.user.id);

    res.json({
      replies,
      unread_count: unreadCount,
    });
  } catch (error) {
    console.error("Get user replies error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a reply
const deleteReplyController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get reply details
    const reply = await getReplyById(id);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    // Check permissions
    const canDelete =
      reply.sender_id === userId || // User who sent the reply
      reply.notice_sender_id === userId || // User who sent the original notice
      userRole === "admin"; // Admin

    if (!canDelete) {
      return res.status(403).json({
        error: "You don't have permission to delete this reply",
      });
    }

    await deleteReply(id);

    res.json({ message: "Reply deleted successfully" });
  } catch (error) {
    console.error("Delete reply error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a reply
const updateReplyController = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    // Get reply details
    const reply = await getReplyById(id);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    // Only the sender can update
    if (reply.sender_id !== userId) {
      return res.status(403).json({
        error: "You can only edit your own replies",
      });
    }

    const updatedReply = await updateReply(id, message);

    res.json({
      message: "Reply updated successfully",
      reply: updatedReply,
    });
  } catch (error) {
    console.error("Update reply error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Mark reply as read
const markReplyAsReadController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await markReplyAsRead(id, userId);

    res.json({ message: "Reply marked as read" });
  } catch (error) {
    console.error("Mark reply as read error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createReply: createReplyController,
  getNoticeReplies: getNoticeRepliesController,
  getUserReplies: getUserRepliesController,
  deleteReply: deleteReplyController,
  updateReply: updateReplyController,
  markReplyAsRead: markReplyAsReadController,
};

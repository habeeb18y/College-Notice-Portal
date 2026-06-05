// frontend/js/reply-components.js
// Reusable components for reply functionality

const ReplyComponents = {
  // Create reply button group
  createReplyButtons(notice, currentUser) {
    // Students can only reply to faculty/admin notices
    // Faculty can reply to any notice
    // Admin can reply to any notice

    const canReply = notice.sent_by !== currentUser.id; // Can't reply to own notice

    if (!canReply) return "";

    return `
      <div class="reply-buttons mt-3">
        <button class="btn btn-sm btn-outline-primary me-2" onclick="openReplyModal('${
          notice.id
        }', 'REPLY', '${Utils.escapeHtml(notice.sender_name)}')">
          <i class="fas fa-reply me-1"></i>Reply
        </button>
        <button class="btn btn-sm btn-outline-info" onclick="openReplyModal('${
          notice.id
        }', 'REPLY_ALL', '${Utils.escapeHtml(notice.sender_name)}')">
          <i class="fas fa-reply-all me-1"></i>Reply All
        </button>
      </div>
    `;
  },

  // Create reply display card
  createReplyCard(reply, currentUser, isAdmin, isNoticeSender) {
    const canDelete =
      reply.sender_id === currentUser.id || isNoticeSender || isAdmin;

    const canEdit = reply.sender_id === currentUser.id;

    const recipientBadges =
      reply.reply_type === "REPLY_ALL" && reply.recipients
        ? `
        <div class="mt-2">
          <small class="text-muted">
            <i class="fas fa-users me-1"></i>
            Sent to ${reply.recipients.length} recipient${
            reply.recipients.length !== 1 ? "s" : ""
          }
          </small>
        </div>
      `
        : "";

    return `
      <div class="card mb-2 reply-card" data-reply-id="${reply.id}">
        <div class="card-body p-3">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <div class="d-flex align-items-center mb-2">
                <i class="fas fa-user-circle text-primary me-2"></i>
                <strong>${Utils.escapeHtml(reply.sender_name)}</strong>
                <span class="badge ${Utils.getRoleBadgeClass(
                  reply.sender_role
                )} ms-2">
                  ${reply.sender_role}
                </span>
                <span class="badge ${
                  reply.reply_type === "REPLY_ALL" ? "bg-info" : "bg-secondary"
                } ms-2">
                  ${reply.reply_type === "REPLY_ALL" ? "Reply All" : "Reply"}
                </span>
              </div>
              <p class="mb-1 reply-message">${Utils.escapeHtml(
                reply.message
              )}</p>
              ${recipientBadges}
              <small class="text-muted">
                <i class="fas fa-clock me-1"></i>${Utils.formatDate(
                  reply.created_at
                )}
                ${reply.updated_at !== reply.created_at ? "(edited)" : ""}
              </small>
            </div>
            ${
              canEdit || canDelete
                ? `
              <div class="dropdown">
                <button class="btn btn-sm btn-link text-muted" data-bs-toggle="dropdown">
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  ${
                    canEdit
                      ? `
                    <li>
                      <a class="dropdown-item" href="#" onclick="editReply('${
                        reply.id
                      }', '${Utils.escapeHtml(reply.message).replace(
                          /'/g,
                          "\\'"
                        )}')">
                        <i class="fas fa-edit me-2"></i>Edit
                      </a>
                    </li>
                  `
                      : ""
                  }
                  ${
                    canDelete
                      ? `
                    <li>
                      <a class="dropdown-item text-danger" href="#" onclick="deleteReply('${reply.id}')">
                        <i class="fas fa-trash me-2"></i>Delete
                      </a>
                    </li>
                  `
                      : ""
                  }
                </ul>
              </div>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `;
  },

  // Create replies section for a notice
  createRepliesSection(notice, replies, currentUser) {
    const isAdmin = currentUser.role === "admin";
    const isNoticeSender = notice.sent_by === currentUser.id;

    const repliesHTML =
      replies.length > 0
        ? replies
            .map((reply) =>
              this.createReplyCard(reply, currentUser, isAdmin, isNoticeSender)
            )
            .join("")
        : '<p class="text-muted text-center py-3"><i class="fas fa-comments-slash me-2"></i>No replies yet</p>';

    return `
      <div class="replies-section mt-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="mb-0">
            <i class="fas fa-comments me-2"></i>
            Replies (${replies.length})
          </h6>
          <button class="btn btn-sm btn-link" onclick="toggleReplies('${
            notice.id
          }')">
            <i class="fas fa-chevron-down" id="replies-toggle-${notice.id}"></i>
          </button>
        </div>
        <div id="replies-container-${
          notice.id
        }" class="replies-container" style="display: none;">
          ${repliesHTML}
          ${this.createReplyButtons(notice, currentUser)}
        </div>
      </div>
    `;
  },

  // Create reply modal
  createReplyModal() {
    return `
      <div class="modal fade" id="replyModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="replyModalTitle">Reply to Notice</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="replyForm">
              <div class="modal-body">
                <input type="hidden" id="replyNoticeId">
                <input type="hidden" id="replyType">
                <input type="hidden" id="editingReplyId">
                
                <div class="mb-3">
                  <label class="form-label">
                    <span id="replyToLabel">Replying to:</span>
                    <strong id="replyToName"></strong>
                  </label>
                </div>
                
                <div class="mb-3">
                  <label for="replyMessage" class="form-label">Your Reply *</label>
                  <textarea 
                    class="form-control" 
                    id="replyMessage" 
                    rows="4" 
                    required
                    placeholder="Type your reply here..."
                  ></textarea>
                </div>
                
                <div class="alert alert-info" id="replyTypeInfo" style="display: none;">
                  <i class="fas fa-info-circle me-2"></i>
                  <span id="replyTypeText"></span>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-paper-plane me-2"></i>
                  <span id="replySubmitText">Send Reply</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  },
};

// Global functions for reply interactions
window.openReplyModal = function (noticeId, replyType, senderName) {
  document.getElementById("replyNoticeId").value = noticeId;
  document.getElementById("replyType").value = replyType;
  document.getElementById("editingReplyId").value = "";
  document.getElementById("replyMessage").value = "";

  const modalTitle = document.getElementById("replyModalTitle");
  const replyToName = document.getElementById("replyToName");
  const replyTypeInfo = document.getElementById("replyTypeInfo");
  const replyTypeText = document.getElementById("replyTypeText");
  const submitText = document.getElementById("replySubmitText");

  modalTitle.textContent = replyType === "REPLY_ALL" ? "Reply All" : "Reply";
  replyToName.textContent = senderName;
  submitText.textContent = "Send Reply";

  if (replyType === "REPLY_ALL") {
    replyTypeInfo.style.display = "block";
    replyTypeText.textContent =
      "This reply will be sent to everyone who received the original notice.";
  } else {
    replyTypeInfo.style.display = "block";
    replyTypeText.textContent = `This reply will only be sent to ${senderName}.`;
  }

  new bootstrap.Modal(document.getElementById("replyModal")).show();
};

window.editReply = function (replyId, currentMessage) {
  document.getElementById("editingReplyId").value = replyId;
  document.getElementById("replyMessage").value = currentMessage;
  document.getElementById("replyModalTitle").textContent = "Edit Reply";
  document.getElementById("replySubmitText").textContent = "Update Reply";
  document.getElementById("replyTypeInfo").style.display = "none";

  new bootstrap.Modal(document.getElementById("replyModal")).show();
};

window.deleteReply = async function (replyId) {
  if (!(await Utils.confirm("Are you sure you want to delete this reply?")))
    return;

  try {
    await API.deleteReply(replyId);
    Utils.showToast("Reply deleted successfully", "success");

    // Remove the reply card from DOM
    const replyCard = document.querySelector(`[data-reply-id="${replyId}"]`);
    if (replyCard) {
      replyCard.remove();
    }

    // Reload the page data if needed
    if (typeof loadNoticeWithReplies === "function") {
      loadNoticeWithReplies();
    } else if (typeof loadNotices === "function") {
      loadNotices();
    }
  } catch (error) {
    Utils.showToast(error.message || "Failed to delete reply", "danger");
  }
};

window.toggleReplies = function (noticeId) {
  const container = document.getElementById(`replies-container-${noticeId}`);
  const icon = document.getElementById(`replies-toggle-${noticeId}`);

  if (container.style.display === "none") {
    container.style.display = "block";
    icon.classList.remove("fa-chevron-down");
    icon.classList.add("fa-chevron-up");
  } else {
    container.style.display = "none";
    icon.classList.remove("fa-chevron-up");
    icon.classList.add("fa-chevron-down");
  }
};

// Make globally available
window.ReplyComponents = ReplyComponents;

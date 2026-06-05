const { query } = require("../config/database");

module.exports = {
  query,

  // ==================== USER QUERIES ====================
  async findUserByEmail(email) {
    const users = await query("SELECT * FROM users WHERE email = $1", [email]);
    return users[0];
  },

  async findUserById(id) {
    const users = await query("SELECT * FROM users WHERE id = $1", [id]);
    return users[0];
  },

  async createUser(userData) {
    const { name, email, password, role, class_id, section_id } = userData;
    const result = await query(
      "INSERT INTO users (name, email, password, role, class_id, section_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, email, password, role, class_id, section_id]
    );
    return result[0];
  },

  async getAllUsers() {
    return await query(`
      SELECT u.id, u.name, u.email, u.role, u.class_id, u.section_id, u.created_at, 
             c.name as class_name, s.name as section_name, s.display_name as section_display_name
      FROM users u 
      LEFT JOIN classes c ON u.class_id = c.id 
      LEFT JOIN sections s ON u.section_id = s.id 
      ORDER BY u.created_at DESC
    `);
  },

  async updateUser(id, userData) {
    const { name, email, role, class_id, section_id } = userData;
    const result = await query(
      "UPDATE users SET name = $1, email = $2, role = $3, class_id = $4, section_id = $5 WHERE id = $6 RETURNING *",
      [name, email, role, class_id, section_id, id]
    );
    return result[0];
  },

  async deleteUser(id) {
    const result = await query("DELETE FROM users WHERE id = $1 RETURNING *", [
      id,
    ]);
    return result[0];
  },

  // ==================== CLASS QUERIES ====================
  async getAllClasses() {
    return await query("SELECT * FROM classes ORDER BY name");
  },

  async getClassById(id) {
    const classes = await query("SELECT * FROM classes WHERE id = $1", [id]);
    return classes[0];
  },

  async createClass(name) {
    const result = await query(
      "INSERT INTO classes (name) VALUES ($1) RETURNING *",
      [name]
    );
    return result[0];
  },

  async deleteClass(id) {
    const result = await query(
      "DELETE FROM classes WHERE id = $1 RETURNING *",
      [id]
    );
    return result[0];
  },

  // ==================== SECTION QUERIES ====================
  async getAllSections() {
    return await query(`
      SELECT s.*, c.name as class_name 
      FROM sections s 
      JOIN classes c ON s.class_id = c.id 
      ORDER BY c.name, s.name
    `);
  },

  async getSectionsByClass(classId) {
    return await query(
      "SELECT * FROM sections WHERE class_id = $1 ORDER BY name",
      [classId]
    );
  },

  async getSectionById(id) {
    const sections = await query("SELECT * FROM sections WHERE id = $1", [id]);
    return sections[0];
  },

  async createSection(sectionData) {
    const { class_id, name, display_name } = sectionData;
    const result = await query(
      "INSERT INTO sections (class_id, name, display_name) VALUES ($1, $2, $3) RETURNING *",
      [class_id, name, display_name || `Section ${name}`]
    );
    return result[0];
  },

  async updateSection(id, sectionData) {
    const { name, display_name } = sectionData;
    const result = await query(
      "UPDATE sections SET name = $1, display_name = $2 WHERE id = $3 RETURNING *",
      [name, display_name, id]
    );
    return result[0];
  },

  async deleteSection(id) {
    const result = await query(
      "DELETE FROM sections WHERE id = $1 RETURNING *",
      [id]
    );
    return result[0];
  },

  // ==================== NOTICE QUERIES ====================
  async getAllNotices() {
    const notices = await query(`
    SELECT n.*, u.name as sender_name, u.role as sender_role
    FROM notices n 
    JOIN users u ON n.sent_by = u.id 
    ORDER BY n.created_at DESC
  `);

    // Get recipients and attachments for each notice
    for (let notice of notices) {
      notice.recipients = await module.exports.getNoticeRecipients(notice.id);
      notice.attachments = await module.exports.getNoticeAttachments(notice.id);
    }

    return notices;
  },

  async getNoticeById(id) {
    const notices = await query(
      `
    SELECT n.*, u.name as sender_name, u.role as sender_role
    FROM notices n 
    JOIN users u ON n.sent_by = u.id 
    WHERE n.id = $1
  `,
      [id]
    );

    if (notices.length === 0) return null;

    const notice = notices[0];
    notice.recipients = await module.exports.getNoticeRecipients(notice.id);
    notice.attachments = await module.exports.getNoticeAttachments(notice.id);

    return notice;
  },

  async createNotice(noticeData) {
    const { title, message, notice_type, sent_by } = noticeData;
    const result = await query(
      "INSERT INTO notices (title, message, notice_type, sent_by) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, message, notice_type, sent_by]
    );
    return result[0];
  },

  async updateNotice(id, noticeData) {
    const { title, message, notice_type } = noticeData;
    const result = await query(
      "UPDATE notices SET title = $1, message = $2, notice_type = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *",
      [title, message, notice_type, id]
    );
    return result[0];
  },

  async deleteNotice(id) {
    const result = await query(
      "DELETE FROM notices WHERE id = $1 RETURNING *",
      [id]
    );
    return result[0];
  },

  // ==================== NOTICE RECIPIENTS QUERIES ====================
  async addNoticeRecipient(noticeId, recipientData) {
    const { class_id, section_id } = recipientData;
    const result = await query(
      "INSERT INTO notice_recipients (notice_id, class_id, section_id) VALUES ($1, $2, $3) RETURNING *",
      [noticeId, class_id, section_id]
    );
    return result[0];
  },

  async getNoticeRecipients(noticeId) {
    return await query(
      `
      SELECT nr.*, c.name as class_name, s.name as section_name, s.display_name as section_display_name
      FROM notice_recipients nr
      LEFT JOIN classes c ON nr.class_id = c.id
      LEFT JOIN sections s ON nr.section_id = s.id
      WHERE nr.notice_id = $1
    `,
      [noticeId]
    );
  },

  async deleteNoticeRecipients(noticeId) {
    await query("DELETE FROM notice_recipients WHERE notice_id = $1", [
      noticeId,
    ]);
  },

  // ==================== NOTICE ATTACHMENTS QUERIES ====================
  async addNoticeAttachment(attachmentData) {
    const {
      notice_id,
      filename,
      original_filename,
      file_path,
      file_type,
      file_size,
    } = attachmentData;
    const result = await query(
      "INSERT INTO notice_attachments (notice_id, filename, original_filename, file_path, file_type, file_size) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [notice_id, filename, original_filename, file_path, file_type, file_size]
    );
    return result[0];
  },

  async getNoticeAttachments(noticeId) {
    return await query(
      "SELECT * FROM notice_attachments WHERE notice_id = $1 ORDER BY created_at",
      [noticeId]
    );
  },

  async deleteNoticeAttachment(id) {
    const result = await query(
      "DELETE FROM notice_attachments WHERE id = $1 RETURNING *",
      [id]
    );
    return result[0];
  },

  async deleteNoticeAttachments(noticeId) {
    const result = await query(
      "DELETE FROM notice_attachments WHERE notice_id = $1 RETURNING *",
      [noticeId]
    );
    return result;
  },

  // ==================== FACULTY-CLASS ASSIGNMENT QUERIES ====================
  async assignFacultyToClass(faculty_id, class_id) {
    const result = await query(
      "INSERT INTO faculty_classes (faculty_id, class_id) VALUES ($1, $2) RETURNING *",
      [faculty_id, class_id]
    );
    return result[0];
  },

  async removeFacultyFromClass(faculty_id, class_id) {
    const result = await query(
      "DELETE FROM faculty_classes WHERE faculty_id = $1 AND class_id = $2 RETURNING *",
      [faculty_id, class_id]
    );
    return result[0];
  },

  async getFacultyClasses(faculty_id) {
    return await query(
      `
      SELECT c.* 
      FROM classes c 
      JOIN faculty_classes fc ON c.id = fc.class_id 
      WHERE fc.faculty_id = $1
    `,
      [faculty_id]
    );
  },

  // ==================== FACULTY-SECTION ASSIGNMENT QUERIES ====================
  async assignFacultyToSection(faculty_id, section_id) {
    const result = await query(
      "INSERT INTO faculty_sections (faculty_id, section_id) VALUES ($1, $2) RETURNING *",
      [faculty_id, section_id]
    );
    return result[0];
  },

  async removeFacultyFromSection(faculty_id, section_id) {
    const result = await query(
      "DELETE FROM faculty_sections WHERE faculty_id = $1 AND section_id = $2 RETURNING *",
      [faculty_id, section_id]
    );
    return result[0];
  },

  async getFacultySections(faculty_id) {
    return await query(
      `
      SELECT s.*, c.name as class_name 
      FROM sections s
      JOIN faculty_sections fs ON s.id = fs.section_id
      JOIN classes c ON s.class_id = c.id
      WHERE fs.faculty_id = $1
      ORDER BY c.name, s.name
    `,
      [faculty_id]
    );
  },

  // ==================== STUDENT NOTICES ====================
  async getStudentNotices(userId) {
    // Get user's class and section
    const user = await module.exports.findUserById(userId);
    if (!user) return [];

    const notices = await query(
      `
      SELECT DISTINCT n.*, u.name as sender_name, u.role as sender_role
      FROM notices n 
      JOIN users u ON n.sent_by = u.id 
      WHERE n.notice_type = 'ALL'
         OR (n.notice_type = 'CLASS' AND n.id IN (
           SELECT notice_id FROM notice_recipients WHERE class_id = $1
         ))
         OR (n.notice_type = 'SECTION' AND n.id IN (
           SELECT notice_id FROM notice_recipients WHERE section_id = $2
         ))
      ORDER BY n.created_at DESC
    `,
      [user.class_id, user.section_id]
    );

    // Get recipients and attachments for each notice
    for (let notice of notices) {
      notice.recipients = await module.exports.getNoticeRecipients(notice.id);
      notice.attachments = await module.exports.getNoticeAttachments(notice.id);
    }

    return notices;
  },

  // ==================== FACULTY NOTICES ====================
  // ==================== FACULTY NOTICES ====================
  async getFacultyNotices(faculty_id) {
    // Get faculty's classes
    const facultyClasses = await module.exports.getFacultyClasses(faculty_id);
    const classIds = facultyClasses.map((c) => c.id);

    let query_text = `
    SELECT DISTINCT n.*, u.name as sender_name, u.role as sender_role
    FROM notices n 
    JOIN users u ON n.sent_by = u.id 
    WHERE n.notice_type = 'ALL' 
       OR n.notice_type = 'FACULTY'
       OR n.sent_by = $1
  `;

    const params = [faculty_id];

    if (classIds.length > 0) {
      params.push(classIds);
      query_text += ` OR (n.notice_type = 'CLASS' AND n.id IN (
      SELECT notice_id FROM notice_recipients WHERE class_id = ANY($${params.length})
    ))`;

      // Get all sections from faculty's classes
      query_text += ` OR (n.notice_type = 'SECTION' AND n.id IN (
      SELECT nr.notice_id 
      FROM notice_recipients nr
      JOIN sections s ON nr.section_id = s.id
      WHERE s.class_id = ANY($${params.length})
    ))`;
    }

    query_text += ` ORDER BY n.created_at DESC`;

    const notices = await module.exports.query(query_text, params);

    // Get recipients and attachments for each notice
    for (let notice of notices) {
      notice.recipients = await module.exports.getNoticeRecipients(notice.id);
      notice.attachments = await module.exports.getNoticeAttachments(notice.id);
    }

    return notices;
  },

  // ==================== STATISTICS QUERIES ====================
  async getUserStats() {
    const [admin, faculty, student] = await Promise.all([
      query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'"),
      query("SELECT COUNT(*) as count FROM users WHERE role = 'faculty'"),
      query("SELECT COUNT(*) as count FROM users WHERE role = 'student'"),
    ]);

    return {
      admin: parseInt(admin[0].count),
      faculty: parseInt(faculty[0].count),
      student: parseInt(student[0].count),
    };
  },

  async getNoticeStats() {
    const [total, all, faculty, class_notices, section_notices] =
      await Promise.all([
        query("SELECT COUNT(*) as count FROM notices"),
        query(
          "SELECT COUNT(*) as count FROM notices WHERE notice_type = 'ALL'"
        ),
        query(
          "SELECT COUNT(*) as count FROM notices WHERE notice_type = 'FACULTY'"
        ),
        query(
          "SELECT COUNT(*) as count FROM notices WHERE notice_type = 'CLASS'"
        ),
        query(
          "SELECT COUNT(*) as count FROM notices WHERE notice_type = 'SECTION'"
        ),
      ]);

    return {
      total: parseInt(total[0].count),
      all: parseInt(all[0].count),
      faculty: parseInt(faculty[0].count),
      class: parseInt(class_notices[0].count),
      section: parseInt(section_notices[0].count),
    };
  },

  async getFacultyByClass(class_id) {
    return await query(
      `
      SELECT u.* 
      FROM users u 
      JOIN faculty_classes fc ON u.id = fc.faculty_id 
      WHERE fc.class_id = $1
    `,
      [class_id]
    );
  },

  // Add these functions to backend/src/models/queries.js
  // Place them after the existing notice queries

  // ==================== NOTICE REPLIES QUERIES ====================

  async createReply(replyData) {
    const { notice_id, sender_id, message, reply_type, parent_reply_id } =
      replyData;
    const result = await query(
      // CHANGED: removed 'this.'
      `INSERT INTO notice_replies (notice_id, sender_id, message, reply_type, parent_reply_id) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [notice_id, sender_id, message, reply_type, parent_reply_id || null]
    );
    return result[0];
  },

  async addReplyRecipient(reply_id, user_id) {
    const result = await query(
      // CHANGED: removed 'this.'
      `INSERT INTO notice_reply_recipients (reply_id, user_id) 
     VALUES ($1, $2) 
     ON CONFLICT (reply_id, user_id) DO NOTHING 
     RETURNING *`,
      [reply_id, user_id]
    );
    return result[0];
  },

  async getNoticeReplies(notice_id, user_id) {
    // ADDED: user_id parameter
    // First get the notice to check who sent it
    const noticeResult = await query(
      `SELECT sent_by FROM notices WHERE id = $1`,
      [notice_id]
    );

    if (noticeResult.length === 0) return [];

    const notice_sender_id = noticeResult[0].sent_by;

    // Get replies where user has permission to view
    const replies = await query(
      `SELECT DISTINCT nr.*, u.name as sender_name, u.role as sender_role, u.email as sender_email
     FROM notice_replies nr
     JOIN users u ON nr.sender_id = u.id
     LEFT JOIN notice_reply_recipients nrr ON nr.id = nrr.reply_id
     WHERE nr.notice_id = $1
     AND (
       nr.sender_id = $2                    -- User sent the reply
       OR $2 = $3                            -- User is the notice sender
       OR nrr.user_id = $2                   -- User is in recipients (REPLY_ALL)
     )
     ORDER BY nr.created_at ASC`,
      [notice_id, user_id, notice_sender_id]
    );

    // Get recipients for each reply
    for (let reply of replies) {
      reply.recipients = await module.exports.getReplyRecipients(reply.id);
    }

    return replies;
  },

  async getReplyById(reply_id) {
    const replies = await query(
      // CHANGED: removed 'this.'
      `SELECT nr.*, u.name as sender_name, u.role as sender_role, u.email as sender_email,
            n.title as notice_title, n.sent_by as notice_sender_id
     FROM notice_replies nr
     JOIN users u ON nr.sender_id = u.id
     JOIN notices n ON nr.notice_id = n.id
     WHERE nr.id = $1`,
      [reply_id]
    );

    if (replies.length === 0) return null;

    const reply = replies[0];
    reply.recipients = await module.exports.getReplyRecipients(reply.id);
    return reply;
  },

  async getReplyRecipients(reply_id) {
    return await query(
      // CHANGED: removed 'this.'
      `SELECT nrr.*, u.name as user_name, u.email as user_email, u.role as user_role
     FROM notice_reply_recipients nrr
     JOIN users u ON nrr.user_id = u.id
     WHERE nrr.reply_id = $1`,
      [reply_id]
    );
  },

  async getUserReplies(user_id) {
    // Get replies sent by user or where user is a recipient
    const replies = await query(
      // CHANGED: removed 'this.'
      `SELECT DISTINCT nr.*, u.name as sender_name, u.role as sender_role,
            n.title as notice_title, n.id as notice_id
     FROM notice_replies nr
     JOIN users u ON nr.sender_id = u.id
     JOIN notices n ON nr.notice_id = n.id
     LEFT JOIN notice_reply_recipients nrr ON nr.id = nrr.reply_id
     WHERE nr.sender_id = $1 OR nrr.user_id = $1
     ORDER BY nr.created_at DESC`,
      [user_id]
    );

    for (let reply of replies) {
      reply.recipients = await module.exports.getReplyRecipients(reply.id);
    }

    return replies;
  },

  async deleteReply(reply_id) {
    const result = await query(
      // CHANGED: removed 'this.'
      `DELETE FROM notice_replies WHERE id = $1 RETURNING *`,
      [reply_id]
    );
    return result[0];
  },

  async updateReply(reply_id, message) {
    const result = await query(
      // CHANGED: removed 'this.'
      `UPDATE notice_replies 
     SET message = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 RETURNING *`,
      [message, reply_id]
    );
    return result[0];
  },

  async markReplyAsRead(reply_id, user_id) {
    await query(
      // CHANGED: removed 'this.'
      `UPDATE notice_reply_recipients 
     SET is_read = TRUE 
     WHERE reply_id = $1 AND user_id = $2`,
      [reply_id, user_id]
    );
  },

  async getUnreadRepliesCount(user_id) {
    const result = await query(
      // CHANGED: removed 'this.'
      `SELECT COUNT(*) as count 
     FROM notice_reply_recipients 
     WHERE user_id = $1 AND is_read = FALSE`,
      [user_id]
    );
    return parseInt(result[0].count);
  },

  // Helper to get all recipients of a notice (for REPLY_ALL)
  async getNoticeRecipientUserIds(notice_id) {
    const notice = await module.exports.getNoticeById(notice_id);
    if (!notice) return [];

    const userIds = new Set();

    // Add the notice sender
    userIds.add(notice.sent_by);

    if (notice.notice_type === "ALL") {
      // Get all users
      const allUsers = await module.exports.getAllUsers();
      allUsers.forEach((user) => userIds.add(user.id));
    } else if (notice.notice_type === "FACULTY") {
      // Get all faculty
      const allUsers = await module.exports.getAllUsers();
      allUsers
        .filter((u) => u.role === "faculty")
        .forEach((user) => userIds.add(user.id));
    } else if (notice.notice_type === "CLASS") {
      // Get users from specified classes
      for (let recipient of notice.recipients) {
        if (recipient.class_id) {
          const classUsers = await query(
            // CHANGED: removed 'this.'
            `SELECT id FROM users WHERE class_id = $1`,
            [recipient.class_id]
          );
          classUsers.forEach((user) => userIds.add(user.id));
        }
      }
    } else if (notice.notice_type === "SECTION") {
      // Get users from specified sections
      for (let recipient of notice.recipients) {
        if (recipient.section_id) {
          const sectionUsers = await query(
            // CHANGED: removed 'this.'
            `SELECT id FROM users WHERE section_id = $1`,
            [recipient.section_id]
          );
          sectionUsers.forEach((user) => userIds.add(user.id));
        }
      }
    }

    return Array.from(userIds);
  },
};

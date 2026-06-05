const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  getAllClasses,
  createClass,
  deleteClass,
  getAllSections,
  getSectionsByClass,
  createSection,
  updateSection,
  deleteSection,
  assignFacultyToClass,
  removeFacultyFromClass,
  assignFacultyToSection,
  removeFacultyFromSection,
  getUserStats,
  getNoticeStats,
  addNoticeRecipient,
  deleteNoticeRecipients,
  addNoticeAttachment,
  getNoticeAttachments,
  deleteNoticeAttachments,
} = require("../models/queries");
const fs = require("fs").promises;
const path = require("path");

const getDashboard = async (req, res) => {
  try {
    const [userStats, noticeStats, totalClasses, totalSections] =
      await Promise.all([
        getUserStats(),
        getNoticeStats(),
        getAllClasses(),
        getAllSections(),
      ]);

    res.json({
      users: userStats,
      notices: noticeStats,
      totalClasses: totalClasses.length,
      totalSections: totalSections.length,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== USER CONTROLLERS ====================
const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: error.message });
  }
};

const createUserController = async (req, res) => {
  try {
    const { name, email, password, role, class_id, section_id } = req.body;
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role,
      class_id: role === "student" ? class_id : null,
      section_id: role === "student" ? section_id : null,
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: "User created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, class_id, section_id } = req.body;

    const user = await updateUser(id, {
      name,
      email,
      role,
      class_id: role === "student" ? class_id : null,
      section_id: role === "student" ? section_id : null,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;

    res.json({
      message: "User updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await deleteUser(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== NOTICE CONTROLLERS ====================
const getAllNoticesController = async (req, res) => {
  try {
    const notices = await getAllNotices();
    res.json({ notices });
  } catch (error) {
    console.error("Get notices error:", error);
    res.status(500).json({ error: error.message });
  }
};

const createNoticeController = async (req, res) => {
  try {
    const { title, message, notice_type, recipients } = req.body;

    // Create the notice
    const notice = await createNotice({
      title,
      message,
      notice_type,
      sent_by: req.user.id,
    });

    // Add recipients if notice type is CLASS or SECTION
    // if (
    //   (notice_type === "CLASS" || notice_type === "SECTION") &&
    //   recipients &&
    //   recipients.length > 0
    // ) {
    //   for (const recipient of recipients) {
    //     await addNoticeRecipient(notice.id, recipient);
    //   }
    // }
    // Add recipients if notice type is CLASS or SECTION
    if (
      (notice_type === "CLASS" || notice_type === "SECTION") &&
      recipients &&
      recipients.length > 0
    ) {
      const recipientsList =
        typeof recipients === "string" ? JSON.parse(recipients) : recipients;

      for (const recipient of recipientsList) {
        await addNoticeRecipient(notice.id, {
          class_id: recipient.class_id || null,
          section_id: recipient.section_id || null,
        });
      }
    }

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await addNoticeAttachment({
          notice_id: notice.id,
          filename: file.filename,
          original_filename: file.originalname,
          file_path: file.path,
          file_type: file.mimetype,
          file_size: file.size,
        });
      }
    }

    // Get the complete notice with recipients and attachments
    const { getNoticeById } = require("../models/queries");
    const completeNotice = await getNoticeById(notice.id);

    res.status(201).json({
      message: "Notice created successfully",
      notice: completeNotice,
    });
  } catch (error) {
    console.error("Create notice error:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateNoticeController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, notice_type, recipients } = req.body;

    const notice = await updateNotice(id, {
      title,
      message,
      notice_type,
    });

    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    // Update recipients
    // await deleteNoticeRecipients(id);

    // if (
    //   (notice_type === "CLASS" || notice_type === "SECTION") &&
    //   recipients &&
    //   recipients.length > 0
    // ) {
    //   for (const recipient of recipients) {
    //     await addNoticeRecipient(id, recipient);
    //   }
    // }

    // Update recipients
    await deleteNoticeRecipients(id);

    if (
      (notice_type === "CLASS" || notice_type === "SECTION") &&
      recipients &&
      recipients.length > 0
    ) {
      const recipientsList =
        typeof recipients === "string" ? JSON.parse(recipients) : recipients;

      for (const recipient of recipientsList) {
        await addNoticeRecipient(id, {
          class_id: recipient.class_id || null,
          section_id: recipient.section_id || null,
        });
      }
    }

    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await addNoticeAttachment({
          notice_id: id,
          filename: file.filename,
          original_filename: file.originalname,
          file_path: file.path,
          file_type: file.mimetype,
          file_size: file.size,
        });
      }
    }

    // Get the complete notice with recipients and attachments
    const { getNoticeById } = require("../models/queries");
    const completeNotice = await getNoticeById(id);

    res.json({
      message: "Notice updated successfully",
      notice: completeNotice,
    });
  } catch (error) {
    console.error("Update notice error:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteNoticeController = async (req, res) => {
  try {
    const { id } = req.params;

    // Get attachments before deleting
    const attachments = await getNoticeAttachments(id);

    // Delete attachment files from disk
    for (const attachment of attachments) {
      try {
        await fs.unlink(attachment.file_path);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }

    const notice = await deleteNotice(id);

    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Delete notice error:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteAttachmentController = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteNoticeAttachment } = require("../models/queries");

    // Get attachment info
    const attachments = await getNoticeAttachments(id);
    const attachment = attachments.find((a) => a.id === id);

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    // Delete file from disk
    try {
      await fs.unlink(attachment.file_path);
    } catch (err) {
      console.error("Error deleting file:", err);
    }

    // Delete from database
    await deleteNoticeAttachment(id);

    res.json({ message: "Attachment deleted successfully" });
  } catch (error) {
    console.error("Delete attachment error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== CLASS CONTROLLERS ====================
const getAllClassesController = async (req, res) => {
  try {
    const classes = await getAllClasses();
    res.json({ classes });
  } catch (error) {
    console.error("Get classes error:", error);
    res.status(500).json({ error: error.message });
  }
};

const createClassController = async (req, res) => {
  try {
    const { name } = req.body;

    const classObj = await createClass(name);

    res.status(201).json({
      message: "Class created successfully",
      class: classObj,
    });
  } catch (error) {
    console.error("Create class error:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteClassController = async (req, res) => {
  try {
    const { id } = req.params;

    const classObj = await deleteClass(id);

    if (!classObj) {
      return res.status(404).json({ error: "Class not found" });
    }

    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Delete class error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== SECTION CONTROLLERS ====================
const getAllSectionsController = async (req, res) => {
  try {
    const sections = await getAllSections();
    res.json({ sections });
  } catch (error) {
    console.error("Get sections error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getSectionsByClassController = async (req, res) => {
  try {
    const { classId } = req.params;
    const sections = await getSectionsByClass(classId);
    res.json({ sections });
  } catch (error) {
    console.error("Get sections by class error:", error);
    res.status(500).json({ error: error.message });
  }
};

const createSectionController = async (req, res) => {
  try {
    const { class_id, name, display_name } = req.body;

    const section = await createSection({
      class_id,
      name,
      display_name: display_name || `Section ${name}`,
    });

    res.status(201).json({
      message: "Section created successfully",
      section,
    });
  } catch (error) {
    console.error("Create section error:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateSectionController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, display_name } = req.body;

    const section = await updateSection(id, { name, display_name });

    if (!section) {
      return res.status(404).json({ error: "Section not found" });
    }

    res.json({
      message: "Section updated successfully",
      section,
    });
  } catch (error) {
    console.error("Update section error:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteSectionController = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await deleteSection(id);

    if (!section) {
      return res.status(404).json({ error: "Section not found" });
    }

    res.json({ message: "Section deleted successfully" });
  } catch (error) {
    console.error("Delete section error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== FACULTY ASSIGNMENT CONTROLLERS ====================
const assignFacultyToClassController = async (req, res) => {
  try {
    const { faculty_id, class_id } = req.body;

    const assignment = await assignFacultyToClass(faculty_id, class_id);

    res.status(201).json({
      message: "Faculty assigned to class successfully",
      assignment,
    });
  } catch (error) {
    console.error("Assign faculty error:", error);
    res.status(500).json({ error: error.message });
  }
};

const removeFacultyFromClassController = async (req, res) => {
  try {
    const { faculty_id, class_id } = req.body;

    const assignment = await removeFacultyFromClass(faculty_id, class_id);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json({ message: "Faculty removed from class successfully" });
  } catch (error) {
    console.error("Remove faculty error:", error);
    res.status(500).json({ error: error.message });
  }
};

const assignFacultyToSectionController = async (req, res) => {
  try {
    const { faculty_id, section_id } = req.body;

    const assignment = await assignFacultyToSection(faculty_id, section_id);

    res.status(201).json({
      message: "Faculty assigned to section successfully",
      assignment,
    });
  } catch (error) {
    console.error("Assign faculty to section error:", error);
    res.status(500).json({ error: error.message });
  }
};

const removeFacultyFromSectionController = async (req, res) => {
  try {
    const { faculty_id, section_id } = req.body;

    const assignment = await removeFacultyFromSection(faculty_id, section_id);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json({ message: "Faculty removed from section successfully" });
  } catch (error) {
    console.error("Remove faculty from section error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboard,
  getAllUsers: getAllUsersController,
  createUser: createUserController,
  updateUser: updateUserController,
  deleteUser: deleteUserController,
  getAllNotices: getAllNoticesController,
  createNotice: createNoticeController,
  updateNotice: updateNoticeController,
  deleteNotice: deleteNoticeController,
  deleteAttachment: deleteAttachmentController,
  getAllClasses: getAllClassesController,
  createClass: createClassController,
  deleteClass: deleteClassController,
  getAllSections: getAllSectionsController,
  getSectionsByClass: getSectionsByClassController,
  createSection: createSectionController,
  updateSection: updateSectionController,
  deleteSection: deleteSectionController,
  assignFacultyToClass: assignFacultyToClassController,
  removeFacultyFromClass: removeFacultyFromClassController,
  assignFacultyToSection: assignFacultyToSectionController,
  removeFacultyFromSection: removeFacultyFromSectionController,
};

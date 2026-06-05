const {
  createNotice,
  updateNotice,
  deleteNotice,
  getFacultyNotices,
  getFacultyClasses,
  getAllClasses,
  getAllUsers,
} = require("../models/queries");

const getDashboard = async (req, res) => {
  try {
    const [myNotices, myClasses, allStudents] = await Promise.all([
      getFacultyNotices(req.user.id),
      getFacultyClasses(req.user.id),
      getAllUsers(),
    ]);

    const students = allStudents.filter((user) => user.role === "student");

    res.json({
      myNotices: myNotices.length,
      myClasses: myClasses.length,
      totalStudents: students.length,
    });
  } catch (error) {
    console.error("Faculty dashboard error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getNotices = async (req, res) => {
  try {
    const notices = await getFacultyNotices(req.user.id);
    res.json({ notices });
  } catch (error) {
    console.error("Get faculty notices error:", error);
    res.status(500).json({ error: error.message });
  }
};

const createNoticeController = async (req, res) => {
  try {
    const { title, message, notice_type, recipients } = req.body;

    // No validation needed - faculty can send to anyone
    const notice = await createNotice({
      title,
      message,
      notice_type,
      sent_by: req.user.id,
    });

    // Add recipients if notice type is CLASS or SECTION
    if (
      (notice_type === "CLASS" || notice_type === "SECTION") &&
      recipients &&
      recipients.length > 0
    ) {
      const recipientsList =
        typeof recipients === "string" ? JSON.parse(recipients) : recipients;

      const { addNoticeRecipient } = require("../models/queries");
      for (const recipient of recipientsList) {
        await addNoticeRecipient(notice.id, {
          class_id: recipient.class_id || null,
          section_id: recipient.section_id || null,
        });
      }
    }

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const { addNoticeAttachment } = require("../models/queries");
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

    // Get the complete notice with recipients
    const { getNoticeById } = require("../models/queries");
    const completeNotice = await getNoticeById(notice.id);

    res.status(201).json({
      message: "Notice created successfully",
      notice: completeNotice,
    });
  } catch (error) {
    console.error("Create faculty notice error:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateNoticeController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, notice_type, recipients } = req.body;

    // First check if the notice exists and was created by this faculty
    const { getNoticeById } = require("../models/queries");
    const existingNotice = await getNoticeById(id);

    if (!existingNotice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    if (existingNotice.sent_by !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only update your own notices" });
    }

    // No validation needed - faculty can send to anyone
    const notice = await updateNotice(id, {
      title,
      message,
      notice_type,
    });

    // Update recipients
    const {
      deleteNoticeRecipients,
      addNoticeRecipient,
    } = require("../models/queries");
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
      const { addNoticeAttachment } = require("../models/queries");
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

    // Get the complete notice with recipients
    const completeNotice = await getNoticeById(id);

    res.json({
      message: "Notice updated successfully",
      notice: completeNotice,
    });
  } catch (error) {
    console.error("Update faculty notice error:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteNoticeController = async (req, res) => {
  try {
    const { id } = req.params;

    // First check if the notice exists and was created by this faculty
    const { getNoticeById } = require("../models/queries");
    const existingNotice = await getNoticeById(id);

    if (!existingNotice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    if (existingNotice.sent_by !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only delete your own notices" });
    }

    const notice = await deleteNotice(id);

    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Delete faculty notice error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getStudents = async (req, res) => {
  try {
    // Get faculty's assigned classes first
    const facultyClasses = await getFacultyClasses(req.user.id);

    if (facultyClasses.length === 0) {
      // If faculty has no assigned classes, return empty array
      return res.json({ students: [] });
    }

    const classIds = facultyClasses.map((cls) => cls.id);

    // Get all users
    const allUsers = await getAllUsers();

    // Filter for students in faculty's classes
    // Note: class_id might be a string in DB, so we need to handle both
    const students = allUsers.filter((user) => {
      if (user.role !== "student") return false;
      if (!user.class_id) return false;

      // Check if user's class_id matches any of the faculty's class IDs
      return classIds.some((classId) => classId === user.class_id);
    });

    res.json({ students });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getMyClasses = async (req, res) => {
  try {
    const classes = await getFacultyClasses(req.user.id);
    res.json({ classes });
  } catch (error) {
    console.error("Get faculty classes error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllClassesController = async (req, res) => {
  try {
    // Return ALL classes, not just faculty's assigned classes
    const classes = await getAllClasses();
    res.json({ classes });
  } catch (error) {
    console.error("Get all classes error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getMySections = async (req, res) => {
  try {
    const {
      getFacultyClasses,
      getSectionsByClass,
    } = require("../models/queries");

    // Get faculty's classes
    const facultyClasses = await getFacultyClasses(req.user.id);
    const classIds = facultyClasses.map((c) => c.id);

    // Get all sections for faculty's classes
    let allSections = [];
    for (const classId of classIds) {
      const sections = await getSectionsByClass(classId);
      allSections = allSections.concat(sections);
    }

    res.json({ sections: allSections });
  } catch (error) {
    console.error("Get faculty sections error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllSectionsController = async (req, res) => {
  try {
    const { getAllSections } = require("../models/queries");
    const sections = await getAllSections();
    res.json({ sections });
  } catch (error) {
    console.error("Get all sections error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboard,
  getNotices,
  createNotice: createNoticeController,
  updateNotice: updateNoticeController,
  deleteNotice: deleteNoticeController,
  getStudents,
  getMyClasses,
  getAllClasses: getAllClassesController,
  getMySections,
  getAllSections: getAllSectionsController, // ADD THIS LINE
};

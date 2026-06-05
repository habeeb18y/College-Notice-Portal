const {
  getStudentNotices,
  findUserById,
  getAllClasses,
  getNoticeById: getNotice,
} = require("../models/queries");

const getDashboard = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const [notices, allClasses] = await Promise.all([
      getStudentNotices(req.user.id),
      getAllClasses(),
    ]);

    // Find student's class name
    const studentClass = allClasses.find((cls) => cls.id === user.class_id);

    res.json({
      availableNotices: notices.length,
      userInfo: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        class_name: studentClass ? studentClass.name : null,
      },
    });
  } catch (error) {
    console.error("Student dashboard error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getNotices = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const notices = await getStudentNotices(req.user.id);
    res.json({ notices });
  } catch (error) {
    console.error("Get student notices error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const notice = await getNotice(id);

    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    // Check if student has access to this notice
    const hasAccess =
      notice.notice_type === "ALL" ||
      (notice.notice_type === "CLASS" && notice.class_id === user.class_id);

    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied to this notice" });
    }

    res.json({ notice });
  } catch (error) {
    console.error("Get notice by ID error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get class name if student has a class
    let className = null;
    if (user.class_id) {
      const allClasses = await getAllClasses();
      const studentClass = allClasses.find((cls) => cls.id === user.class_id);
      className = studentClass ? studentClass.name : null;
    }

    // Don't send password
    const { password, ...userWithoutPassword } = user;

    res.json({
      user: {
        ...userWithoutPassword,
        class_name: className,
      },
    });
  } catch (error) {
    console.error("Get student profile error:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const { updateUser } = require("../models/queries");

    const user = await updateUser(req.user.id, {
      name,
      email,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Don't send password
    const { password, ...userWithoutPassword } = user;

    res.json({
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Update student profile error:", error);
    res.status(500).json({ error: error.message });
  }
};

const getDepartments = async (req, res) => {
  try {
    const classes = await getAllClasses();
    res.json({ classes });
  } catch (error) {
    console.error("Get classes error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboard,
  getNotices,
  getNoticeById,
  getProfile,
  updateProfile,
  getDepartments,
};

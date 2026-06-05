// API call functions
const API = {
  // Make HTTP request
  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const token = Auth.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Only add Authorization header if we have a real token (not cookie-based auth)
    if (token && token !== "cookie-auth") {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  },

  // POST request
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // PUT request
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  },

  // Auth APIs
  async register(userData) {
    return this.post(API_CONFIG.ENDPOINTS.REGISTER, userData);
  },

  async login(credentials) {
    return this.post(API_CONFIG.ENDPOINTS.LOGIN, credentials);
  },

  async getProfile() {
    return this.get(API_CONFIG.ENDPOINTS.PROFILE);
  },

  // ==================== ADMIN APIs ====================
  async getAdminDashboard() {
    return this.get(API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD);
  },

  async getAllUsers() {
    return this.get(API_CONFIG.ENDPOINTS.ADMIN_USERS);
  },

  async createUser(userData) {
    return this.post(API_CONFIG.ENDPOINTS.ADMIN_USERS, userData);
  },

  async updateUser(userId, userData) {
    return this.put(`${API_CONFIG.ENDPOINTS.ADMIN_USERS}/${userId}`, userData);
  },

  async deleteUser(userId) {
    return this.delete(`${API_CONFIG.ENDPOINTS.ADMIN_USERS}/${userId}`);
  },

  async getAllNotices() {
    return this.get(API_CONFIG.ENDPOINTS.ADMIN_NOTICES);
  },

  async createNotice(noticeData) {
    return this.post(API_CONFIG.ENDPOINTS.ADMIN_NOTICES, noticeData);
  },

  async updateNotice(noticeId, noticeData) {
    return this.put(
      `${API_CONFIG.ENDPOINTS.ADMIN_NOTICES}/${noticeId}`,
      noticeData
    );
  },

  async deleteNotice(noticeId) {
    return this.delete(`${API_CONFIG.ENDPOINTS.ADMIN_NOTICES}/${noticeId}`);
  },

  async getAllClasses() {
    return this.get(API_CONFIG.ENDPOINTS.ADMIN_CLASSES);
  },

  async createClass(classData) {
    return this.post(API_CONFIG.ENDPOINTS.ADMIN_CLASSES, classData);
  },

  async deleteClass(classId) {
    return this.delete(`${API_CONFIG.ENDPOINTS.ADMIN_CLASSES}/${classId}`);
  },

  async assignFaculty(facultyId, classId) {
    return this.post(API_CONFIG.ENDPOINTS.ADMIN_ASSIGN_FACULTY, {
      faculty_id: facultyId,
      class_id: classId,
    });
  },

  async removeFaculty(facultyId, classId) {
    return this.delete(API_CONFIG.ENDPOINTS.ADMIN_REMOVE_FACULTY, {
      faculty_id: facultyId,
      class_id: classId,
    });
  },

  // ==================== SECTIONS APIs ====================
  async getAllSections() {
    return this.get("/admin/sections");
  },

  async getSectionsByClass(classId) {
    return this.get(`/admin/sections/class/${classId}`);
  },

  async createSection(sectionData) {
    return this.post("/admin/sections", sectionData);
  },

  async updateSection(sectionId, sectionData) {
    return this.put(`/admin/sections/${sectionId}`, sectionData);
  },

  async deleteSection(sectionId) {
    return this.delete(`/admin/sections/${sectionId}`);
  },

  // ==================== FILE UPLOAD APIs ====================
  async createNoticeWithFiles(formData) {
    const url = `${API_CONFIG.BASE_URL}/admin/notices`;
    const token = Auth.getToken();

    const headers = {};
    if (token && token !== "cookie-auth") {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async updateNoticeWithFiles(noticeId, formData) {
    const url = `${API_CONFIG.BASE_URL}/admin/notices/${noticeId}`;
    const token = Auth.getToken();

    const headers = {};
    if (token && token !== "cookie-auth") {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers,
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async deleteAttachment(attachmentId) {
    return this.delete(`/admin/attachments/${attachmentId}`);
  },

  // ==================== FACULTY SECTION ASSIGNMENTS ====================
  async assignFacultyToSection(facultyId, sectionId) {
    return this.post("/admin/assign-faculty-section", {
      faculty_id: facultyId,
      section_id: sectionId,
    });
  },

  async removeFacultyFromSection(facultyId, sectionId) {
    return this.delete("/admin/remove-faculty-section", {
      faculty_id: facultyId,
      section_id: sectionId,
    });
  },

  // ==================== FACULTY APIs ====================
  // ==================== FACULTY APIs ====================
  async getFacultyDashboard() {
    return this.get(API_CONFIG.ENDPOINTS.FACULTY_DASHBOARD);
  },

  async getFacultyNotices() {
    return this.get(API_CONFIG.ENDPOINTS.FACULTY_NOTICES);
  },

  async createFacultyNotice(noticeData) {
    return this.post(API_CONFIG.ENDPOINTS.FACULTY_NOTICES, noticeData);
  },

  async updateFacultyNotice(noticeId, noticeData) {
    return this.put(
      `${API_CONFIG.ENDPOINTS.FACULTY_NOTICES}/${noticeId}`,
      noticeData
    );
  },

  async deleteFacultyNotice(noticeId) {
    return this.delete(`${API_CONFIG.ENDPOINTS.FACULTY_NOTICES}/${noticeId}`);
  },

  async getFacultyStudents() {
    return this.get(API_CONFIG.ENDPOINTS.FACULTY_STUDENTS);
  },

  async getFacultyDepartments() {
    return this.get("/faculty/classes");
  },

  async getFacultySections() {
    return this.get("/faculty/sections"); // ADD THIS LINE
  },

  async getAllSectionsForFaculty() {
    return this.get("/faculty/all-sections");
  },

  async createFacultyNoticeWithFiles(formData) {
    const url = `${API_CONFIG.BASE_URL}/faculty/notices`;
    const token = Auth.getToken();

    const headers = {};
    if (token && token !== "cookie-auth") {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async updateFacultyNoticeWithFiles(noticeId, formData) {
    const url = `${API_CONFIG.BASE_URL}/faculty/notices/${noticeId}`;
    const token = Auth.getToken();

    const headers = {};
    if (token && token !== "cookie-auth") {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers,
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // ==================== STUDENT APIs ====================
  async getStudentDashboard() {
    return this.get(API_CONFIG.ENDPOINTS.STUDENT_DASHBOARD);
  },

  async getStudentNotices() {
    return this.get(API_CONFIG.ENDPOINTS.STUDENT_NOTICES);
  },

  async getNoticeById(noticeId) {
    return this.get(`${API_CONFIG.ENDPOINTS.STUDENT_NOTICES}/${noticeId}`);
  },

  async getStudentProfile() {
    return this.get(API_CONFIG.ENDPOINTS.STUDENT_PROFILE);
  },

  async updateStudentProfile(profileData) {
    return this.put(API_CONFIG.ENDPOINTS.STUDENT_PROFILE, profileData);
  },

  async getStudentDepartments() {
    return this.get(API_CONFIG.ENDPOINTS.STUDENT_DEPARTMENTS);
  },

  // ==================== REPLY APIs ====================
  async createReply(replyData) {
    return this.post("/replies", replyData);
  },

  async getNoticeReplies(noticeId) {
    return this.get(`/replies/notice/${noticeId}`);
  },

  async getUserReplies() {
    return this.get("/replies/my-replies");
  },

  async updateReply(replyId, message) {
    return this.put(`/replies/${replyId}`, { message });
  },

  async deleteReply(replyId) {
    return this.delete(`/replies/${replyId}`);
  },

  async markReplyAsRead(replyId) {
    return this.post(`/replies/${replyId}/mark-read`, {});
  },
};

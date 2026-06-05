// API Configuration
const API_CONFIG = {
  BASE_URL: "http://localhost:3000/api",
  ENDPOINTS: {
    // Auth
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/me",

    // Admin
    ADMIN_DASHBOARD: "/admin/dashboard",
    ADMIN_USERS: "/admin/users",
    ADMIN_NOTICES: "/admin/notices",
    ADMIN_CLASSES: "/admin/classes",
    ADMIN_ASSIGN_FACULTY: "/admin/assign-faculty",
    ADMIN_REMOVE_FACULTY: "/admin/remove-faculty",

    // Faculty
    FACULTY_DASHBOARD: "/faculty/dashboard",
    FACULTY_NOTICES: "/faculty/notices",
    FACULTY_STUDENTS: "/faculty/students",
    // ✅ updated to match api.js
    FACULTY_DEPARTMENTS: "/faculty/classes",

    // Student
    STUDENT_DASHBOARD: "/student/dashboard",
    STUDENT_NOTICES: "/student/notices",
    STUDENT_PROFILE: "/student/profile",
    STUDENT_DEPARTMENTS: "/student/departments",

    REPLIES: "/replies",
    NOTICE_REPLIES: "/replies/notice",
    MY_REPLIES: "/replies/my-replies",

    // Health
    HEALTH: "/health",
  },
};

// Storage keys
const STORAGE_KEYS = {
  TOKEN: "auth_token",
  USER: "user_data",
};

// Role mappings
const ROLES = {
  ADMIN: "admin",
  FACULTY: "faculty",
  STUDENT: "student",
};

// Notice types
const NOTICE_TYPES = {
  ALL: "ALL",
  FACULTY: "FACULTY",
  CLASS: "CLASS",
};

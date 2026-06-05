// Authentication utilities
const Auth = {
  // Save token and user data
  saveAuth(token, user) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  // Get token
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  // Get user data
  getUser() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Get user role
  getUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  },

  // Check if user has specific role
  hasRole(role) {
    return this.getUserRole() === role;
  },

  // Clear authentication data
  clearAuth() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Logout
  async logout() {
    try {
      await API.post(API_CONFIG.ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearAuth();
      window.location.href = "/index.html";
    }
  },

  // Redirect based on role
  // Redirect based on role
  // Redirect based on role
  // Redirect based on role
  redirectToDashboard() {
    const role = this.getUserRole();

    if (role === "admin") {
      window.location.href = "/pages/admin/dashboard.html";
    } else if (role === "faculty") {
      window.location.href = "/pages/faculty/dashboard.html";
    } else if (role === "student") {
      window.location.href = "/pages/student/dashboard.html";
    } else {
      window.location.href = "/index.html";
    }
  },

  // Check authentication and redirect if needed
  requireAuth(allowedRoles = []) {
    if (!this.isAuthenticated()) {
      window.location.href = "/index.html";
      return false;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(this.getUserRole())) {
      alert("Access denied. Insufficient permissions.");
      this.redirectToDashboard();
      return false;
    }

    return true;
  },
};

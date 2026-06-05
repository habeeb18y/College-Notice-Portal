// utils.js

const Utils = {
  /* ===========================
     DATE & TEXT HELPERS
     =========================== */

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  truncate(text, length = 100) {
    if (!text) return "";
    if (text.length <= length) return text;
    return text.substring(0, length) + "...";
  },

  truncateText(text, maxLength = 50) {
    return this.truncate(text, maxLength);
  },

  escapeHtml(text) {
    if (!text) return "";
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  },

  /* ===========================
     VALIDATION
     =========================== */

  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  isValidPassword(password) {
    return (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  },

  /* ===========================
     BADGES / FORMATTING
     =========================== */

  getRoleBadgeClass(role) {
    const badges = {
      admin: "bg-danger",
      faculty: "bg-primary",
      student: "bg-success",
    };
    return badges[role] || "bg-secondary";
  },

  getNoticeTypeBadgeClass(type) {
    const badges = {
      ALL: "bg-info",
      FACULTY: "bg-warning",
      CLASS: "bg-primary",
    };
    return badges[type] || "bg-secondary";
  },

  formatNoticeType(type) {
    const types = {
      ALL: "All Users",
      FACULTY: "Faculty Only",
      CLASS: "Specific Class",
    };
    return types[type] || type;
  },

  formatRole(role) {
    const roles = {
      admin: "Administrator",
      faculty: "Faculty Member",
      student: "Student",
    };
    return roles[role] || role;
  },

  /* ===========================
     TOAST NOTIFICATIONS
     =========================== */

  showSimpleToast(message, type = "success") {
    let container = document.getElementById("toastContainer");

    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container position-fixed top-0 end-0 p-3";
      container.style.zIndex = "9999";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute("role", "alert");
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${this.escapeHtml(message)}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;

    container.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();

    toast.addEventListener("hidden.bs.toast", () => {
      toast.remove();
    });
  },

  showToast(message, type = "info", title = "Notification") {
    const toastEl = document.getElementById("liveToast");

    if (toastEl) {
      const toastTitle = document.getElementById("toastTitle");
      const toastMessage = document.getElementById("toastMessage");

      if (toastTitle) toastTitle.textContent = title;
      if (toastMessage) toastMessage.textContent = message;

      toastEl.className = `toast bg-${type} text-white`;

      const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
      toast.show();
    } else {
      // Fallback to simple toast (NO recursion)
      this.showSimpleToast(message, type);
    }
  },

  /* ===========================
     LOADING INDICATORS
     =========================== */

  showButtonLoading(button) {
    if (!button) return;
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Loading...`;
  },

  hideButtonLoading(button) {
    if (!button) return;
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || "Submit";
  },

  showGlobalLoading() {
    const spinner = document.getElementById("loadingSpinner");
    if (spinner) spinner.style.display = "block";
  },

  hideGlobalLoading() {
    const spinner = document.getElementById("loadingSpinner");
    if (spinner) spinner.style.display = "none";
  },

  /* ===========================
     FORM ERRORS
     =========================== */

  showFormError(formId, message) {
    const form = document.getElementById(formId);
    if (!form) return;

    let errorDiv = form.querySelector(".form-error");
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.className = "alert alert-danger form-error";
      form.prepend(errorDiv);
    }

    errorDiv.textContent = message;
    errorDiv.style.display = "block";
  },

  hideFormError(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    const errorDiv = form.querySelector(".form-error");
    if (errorDiv) errorDiv.style.display = "none";
  },

  /* ===========================
     CONFIRM & HELPERS
     =========================== */

  // Confirm action
  confirmAction(message) {
    return confirm(message);
  },

  // Alias for confirmAction
  confirm(message) {
    return confirm(message);
  },

  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  },
};

// Aliases for backward compatibility
Utils.showLoading = Utils.showButtonLoading;
Utils.hideLoading = Utils.hideButtonLoading;


// Make globally available
window.Utils = Utils;

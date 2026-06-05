// Reusable UI Components
const Components = {
  // Create navigation bar
  createNavbar(role) {
    const user = Auth.getUser();
    const userName = user ? user.name : "User";

    let navLinks = "";

    if (role === ROLES.ADMIN) {
      navLinks = `
    <li class="nav-item"><a class="nav-link" href="/pages/admin/dashboard.html">Dashboard</a></li>
    <li class="nav-item"><a class="nav-link" href="/pages/admin/users.html">Users</a></li>
    <li class="nav-item"><a class="nav-link" href="/pages/admin/notices.html">Notices</a></li>
    <li class="nav-item"><a class="nav-link" href="/pages/admin/classes.html">Classes</a></li>
    <li class="nav-item"><a class="nav-link" href="/pages/admin/sections.html">Sections</a></li>
    <li class="nav-item"><a class="nav-link" href="/pages/admin/faculty-assignments.html">Assignments</a></li>
  `;
    } else if (role === ROLES.FACULTY) {
      navLinks = `
        <li class="nav-item"><a class="nav-link" href="/pages/faculty/dashboard.html">Dashboard</a></li>
        <li class="nav-item"><a class="nav-link" href="/pages/faculty/notices.html">Notices</a></li>
        <li class="nav-item"><a class="nav-link" href="/pages/faculty/students.html">Students</a></li>
        <li class="nav-item"><a class="nav-link" href="/pages/faculty/classes.html">Classes</a></li>
      `;
    } else if (role === ROLES.STUDENT) {
      navLinks = `
        <li class="nav-item"><a class="nav-link" href="/pages/student/dashboard.html">Dashboard</a></li>
        <li class="nav-item"><a class="nav-link" href="/pages/student/notices.html">Notices</a></li>
        <li class="nav-item"><a class="nav-link" href="/pages/student/profile.html">Profile</a></li>
      `;
    }

    return `
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">Notice Board</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              ${navLinks}
            </ul>
            <ul class="navbar-nav">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                  <i class="fas fa-user-circle"></i> ${userName}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><span class="dropdown-item-text"><strong>Role:</strong> ${role}</span></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item" href="#" onclick="Auth.logout()">Logout</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    `;
  },

  // Create stats card
  createStatsCard(title, value, icon, color = "primary") {
    return `
      <div class="col-md-4 mb-4">
        <div class="card border-${color} shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-muted mb-2">${title}</h6>
                <h2 class="mb-0">${value}</h2>
              </div>
              <div class="text-${color} fs-1">
                <i class="${icon}"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Create notice card
  createNoticeCard(notice) {
    return `
      <div class="card mb-3 shadow-sm">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">${Utils.escapeHtml(notice.title)}</h5>
          <span class="badge ${Utils.getNoticeTypeBadgeClass(
            notice.notice_type
          )}">
            ${notice.notice_type}
          </span>
        </div>
        <div class="card-body">
          <p class="card-text">${Utils.escapeHtml(notice.message)}</p>
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">
              <i class="fas fa-user"></i> ${Utils.escapeHtml(
                notice.sender_name
              )} 
              ${
                notice.class_name
                  ? `<i class="fas fa-graduation-cap ms-2"></i> ${Utils.escapeHtml(
                      notice.class_name
                    )}`
                  : ""
              }
            </small>
            <small class="text-muted">
              <i class="fas fa-calendar"></i> ${Utils.formatDate(
                notice.created_at
              )}
            </small>
          </div>
        </div>
      </div>
    `;
  },

  // Create user table row
  createUserTableRow(user) {
    return `
      <tr>
        <td>${Utils.escapeHtml(user.name)}</td>
        <td>${Utils.escapeHtml(user.email)}</td>
        <td><span class="badge ${Utils.getRoleBadgeClass(user.role)}">${
      user.role
    }</span></td>
        <td>${user.class_name || "-"}</td>
        <td>${Utils.formatDate(user.created_at)}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editUser('${
            user.id
          }')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser('${
            user.id
          }')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  },

  // Create loading spinner
  createLoadingSpinner() {
    return `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
  },

  // Create empty state
  createEmptyState(message, icon = "fas fa-inbox") {
    return `
      <div class="text-center py-5">
        <i class="${icon} fs-1 text-muted mb-3"></i>
        <p class="text-muted">${message}</p>
      </div>
    `;
  },

  // Create modal
  createModal(id, title, body, footer = "") {
    return `
      <div class="modal fade" id="${id}" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              ${body}
            </div>
            ${footer ? `<div class="modal-footer">${footer}</div>` : ""}
          </div>
        </div>
      </div>
    `;
  },
};

// Add logout handler when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      Auth.logout();
    });
  }
});

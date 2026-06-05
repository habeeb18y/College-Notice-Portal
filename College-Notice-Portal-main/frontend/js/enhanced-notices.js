// Enhanced Notices Management JavaScript

Auth.requireAuth([ROLES.ADMIN]);
document.getElementById("navbar").innerHTML = Components.createNavbar(
  ROLES.ADMIN
);

let allNotices = [];
let allClasses = [];
let allSections = [];
let editingNoticeId = null;
let selectedRecipients = [];
let selectedFiles = [];

// Load initial data
async function loadData() {
  try {
    const [noticesData, classesData, sectionsData] = await Promise.all([
      API.getAllNotices(),
      API.getAllClasses(),
      API.getAllSections(),
    ]);

    allNotices = noticesData.notices;
    allClasses = classesData.classes;
    allSections = sectionsData.sections;

    populateSelectors();
    displayNotices(allNotices);
  } catch (error) {
    Utils.showToast("Failed to load data", "danger");
  }
}

function populateSelectors() {
  const classSelector = document.getElementById("classSelector");
  const sectionClassSelector = document.getElementById("sectionClassSelector");

  const classOptions = allClasses
    .map((cls) => `<option value="${cls.id}">${cls.name}</option>`)
    .join("");

  classSelector.innerHTML =
    '<option value="">Choose classes...</option>' + classOptions;
  sectionClassSelector.innerHTML =
    '<option value="">First, select a class...</option>' + classOptions;
}

// Display notices
function displayNotices(notices) {
  const container = document.getElementById("noticesContainer");

  if (notices.length === 0) {
    container.innerHTML = Components.createEmptyState("No notices found");
    return;
  }

  container.innerHTML = notices
    .map((notice) => {
      const recipientsHTML = getRecipientsHTML(notice);
      const attachmentsHTML = getAttachmentsHTML(notice);

      return `
      <div class="card mb-3 shadow-sm">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-1">${Utils.escapeHtml(notice.title)}</h5>
            <small class="text-muted">
              <i class="fas fa-user"></i> ${Utils.escapeHtml(
                notice.sender_name
              )} 
              (${notice.sender_role})
            </small>
          </div>
          <div>
            <span class="badge ${getNoticeTypeBadge(notice.notice_type)}">
              ${getNoticeTypeLabel(notice.notice_type)}
            </span>
          </div>
        </div>
        <div class="card-body">
          <p class="card-text">${Utils.escapeHtml(notice.message)}</p>
          
          ${recipientsHTML}
          ${attachmentsHTML}
          
          <div class="d-flex justify-content-between align-items-center mt-3">
            <small class="text-muted">
              <i class="fas fa-calendar"></i> ${Utils.formatDate(
                notice.created_at
              )}
            </small>
            <div>
              <button class="btn btn-sm btn-warning" onclick="editNotice('${
                notice.id
              }')">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="btn btn-sm btn-danger" onclick="deleteNotice('${
                notice.id
              }')">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

function getRecipientsHTML(notice) {
  if (
    notice.notice_type === "ALL" ||
    notice.notice_type === "FACULTY" ||
    !notice.recipients ||
    notice.recipients.length === 0
  ) {
    return "";
  }

  const recipients = notice.recipients
    .map((r) => {
      if (r.section_id) {
        return `<span class="badge bg-info">${Utils.escapeHtml(
          r.class_name
        )} - ${Utils.escapeHtml(
          r.section_display_name || "Section " + r.section_name
        )}</span>`;
      } else {
        return `<span class="badge bg-primary">${Utils.escapeHtml(
          r.class_name
        )} (All Sections)</span>`;
      }
    })
    .join(" ");

  return `
    <div class="mb-2">
      <strong>Recipients:</strong><br>
      ${recipients}
    </div>
  `;
}

function getAttachmentsHTML(notice) {
  if (!notice.attachments || notice.attachments.length === 0) {
    return "";
  }

  const attachments = notice.attachments
    .map(
      (att) => `
    <div class="attachment-item d-flex justify-content-between align-items-center">
      <div>
        <i class="${getFileIcon(att.file_type)} me-2"></i>
        <a href="${API_CONFIG.BASE_URL.replace("/api", "")}/uploads/${
        att.filename
      }" target="_blank">
          ${Utils.escapeHtml(att.original_filename)}
        </a>
        <small class="text-muted ms-2">(${formatFileSize(
          att.file_size
        )})</small>
      </div>
    </div>
  `
    )
    .join("");

  return `
    <div class="mb-2">
      <strong>Attachments:</strong>
      ${attachments}
    </div>
  `;
}

function getFileIcon(fileType) {
  if (!fileType) return "fas fa-file";
  if (fileType.startsWith("image/")) return "fas fa-file-image text-success";
  if (fileType.includes("pdf")) return "fas fa-file-pdf text-danger";
  if (fileType.includes("word") || fileType.includes("document"))
    return "fas fa-file-word text-primary";
  if (fileType.includes("excel") || fileType.includes("spreadsheet"))
    return "fas fa-file-excel text-success";
  if (fileType.includes("powerpoint") || fileType.includes("presentation"))
    return "fas fa-file-powerpoint text-warning";
  if (fileType.includes("zip") || fileType.includes("rar"))
    return "fas fa-file-archive text-secondary";
  return "fas fa-file";
}

function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function getNoticeTypeBadge(type) {
  const badges = {
    ALL: "bg-info",
    FACULTY: "bg-warning",
    CLASS: "bg-primary",
    SECTION: "bg-success",
  };
  return badges[type] || "bg-secondary";
}

function getNoticeTypeLabel(type) {
  const labels = {
    ALL: "All Users",
    FACULTY: "Faculty Only",
    CLASS: "Class/Year",
    SECTION: "Sections",
  };
  return labels[type] || type;
}

// Handle notice type change
document.getElementById("noticeType").addEventListener("change", (e) => {
  const type = e.target.value;
  const recipientsSection = document.getElementById("recipientsSection");
  const classSelection = document.getElementById("classSelection");
  const sectionSelection = document.getElementById("sectionSelection");

  // Reset recipients
  selectedRecipients = [];
  updateRecipientsDisplay();

  if (type === "CLASS") {
    recipientsSection.style.display = "block";
    classSelection.style.display = "block";
    sectionSelection.style.display = "none";
  } else if (type === "SECTION") {
    recipientsSection.style.display = "block";
    classSelection.style.display = "none";
    sectionSelection.style.display = "block";
  } else {
    recipientsSection.style.display = "none";
    classSelection.style.display = "none";
    sectionSelection.style.display = "none";
  }
});

// Handle section class selector change
document
  .getElementById("sectionClassSelector")
  .addEventListener("change", (e) => {
    const classId = e.target.value;
    const sectionSelector = document.getElementById("sectionSelector");

    if (classId) {
      const sections = allSections.filter((s) => s.class_id === classId);
      sectionSelector.disabled = false;
      sectionSelector.innerHTML =
        '<option value="">Then, select a section...</option>' +
        sections
          .map(
            (s) =>
              `<option value="${s.id}">${
                s.display_name || "Section " + s.name
              }</option>`
          )
          .join("");
    } else {
      sectionSelector.disabled = true;
      sectionSelector.innerHTML =
        '<option value="">Then, select a section...</option>';
    }
  });

// Add class recipient
window.addClassRecipient = function () {
  const classId = document.getElementById("classSelector").value;
  if (!classId) {
    Utils.showToast("Please select a class", "warning");
    return;
  }

  // Check if already added
  if (selectedRecipients.some((r) => r.class_id === classId && !r.section_id)) {
    Utils.showToast("This class is already added", "warning");
    return;
  }

  const className = allClasses.find((c) => c.id === classId).name;
  selectedRecipients.push({ class_id: classId, class_name: className });
  updateRecipientsDisplay();
  document.getElementById("classSelector").value = "";
};

// Add section recipient
window.addSectionRecipient = function () {
  const sectionId = document.getElementById("sectionSelector").value;
  if (!sectionId) {
    Utils.showToast("Please select a section", "warning");
    return;
  }

  // Check if already added
  if (selectedRecipients.some((r) => r.section_id === sectionId)) {
    Utils.showToast("This section is already added", "warning");
    return;
  }

  const section = allSections.find((s) => s.id === sectionId);
  const className = allClasses.find((c) => c.id === section.class_id).name;

  selectedRecipients.push({
    section_id: sectionId,
    class_id: section.class_id,
    class_name: className,
    section_name: section.name,
    section_display_name: section.display_name,
  });

  updateRecipientsDisplay();
  document.getElementById("sectionClassSelector").value = "";
  document.getElementById("sectionSelector").value = "";
  document.getElementById("sectionSelector").disabled = true;
};

// Update recipients display
function updateRecipientsDisplay() {
  const container = document.getElementById("selectedRecipients");

  if (selectedRecipients.length === 0) {
    container.innerHTML =
      '<p class="text-muted">No recipients selected yet</p>';
    return;
  }

  container.innerHTML = selectedRecipients
    .map(
      (r, index) => `
    <span class="recipient-item">
      ${
        r.section_id
          ? `${r.class_name} - ${
              r.section_display_name || "Section " + r.section_name
            }`
          : `${r.class_name} (All Sections)`
      }
      <i class="fas fa-times remove-recipient" onclick="removeRecipient(${index})"></i>
    </span>
  `
    )
    .join("");
}

// Remove recipient
window.removeRecipient = function (index) {
  selectedRecipients.splice(index, 1);
  updateRecipientsDisplay();
};

// Handle file selection
document.getElementById("noticeAttachments").addEventListener("change", (e) => {
  const files = Array.from(e.target.files);

  if (files.length > 5) {
    Utils.showToast("Maximum 5 files allowed", "warning");
    e.target.value = "";
    return;
  }

  selectedFiles = files;
  displayFilePreview();
});

function displayFilePreview() {
  const container = document.getElementById("filePreview");

  if (selectedFiles.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = selectedFiles
    .map(
      (file, index) => `
    <div class="file-preview-item">
      <button type="button" class="remove-file" onclick="removeFile(${index})">
        <i class="fas fa-times"></i>
      </button>
      <i class="${getFileIconByName(file.name)} fa-2x mb-2"></i>
      <div><small>${file.name}</small></div>
      <div><small class="text-muted">${formatFileSize(file.size)}</small></div>
    </div>
  `
    )
    .join("");
}

function getFileIconByName(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  const iconMap = {
    jpg: "fas fa-file-image text-success",
    jpeg: "fas fa-file-image text-success",
    png: "fas fa-file-image text-success",
    gif: "fas fa-file-image text-success",
    pdf: "fas fa-file-pdf text-danger",
    doc: "fas fa-file-word text-primary",
    docx: "fas fa-file-word text-primary",
    xls: "fas fa-file-excel text-success",
    xlsx: "fas fa-file-excel text-success",
    ppt: "fas fa-file-powerpoint text-warning",
    pptx: "fas fa-file-powerpoint text-warning",
    zip: "fas fa-file-archive text-secondary",
    rar: "fas fa-file-archive text-secondary",
  };
  return iconMap[ext] || "fas fa-file";
}

window.removeFile = function (index) {
  selectedFiles.splice(index, 1);
  displayFilePreview();

  // Update file input
  const input = document.getElementById("noticeAttachments");
  const dt = new DataTransfer();
  selectedFiles.forEach((file) => dt.items.add(file));
  input.files = dt.files;
};

// Open create modal
document.getElementById("createNoticeBtn").addEventListener("click", () => {
  editingNoticeId = null;
  selectedRecipients = [];
  selectedFiles = [];
  document.getElementById("modalTitle").textContent = "Create Notice";
  document.getElementById("noticeForm").reset();
  document.getElementById("recipientsSection").style.display = "none";
  document.getElementById("existingAttachments").style.display = "none";
  document.getElementById("filePreview").innerHTML = "";
  updateRecipientsDisplay();
});

// Edit notice
window.editNotice = async function (noticeId) {
  editingNoticeId = noticeId;
  const notice = allNotices.find((n) => n.id === noticeId);

  if (!notice) return;

  document.getElementById("modalTitle").textContent = "Edit Notice";
  document.getElementById("noticeId").value = notice.id;
  document.getElementById("noticeTitle").value = notice.title;
  document.getElementById("noticeMessage").value = notice.message;
  document.getElementById("noticeType").value = notice.notice_type;

  // Load recipients
  selectedRecipients = notice.recipients || [];

  // Trigger notice type change
  const event = new Event("change");
  document.getElementById("noticeType").dispatchEvent(event);
  updateRecipientsDisplay();

  // Show existing attachments
  if (notice.attachments && notice.attachments.length > 0) {
    document.getElementById("existingAttachments").style.display = "block";
    document.getElementById("existingAttachmentsList").innerHTML =
      notice.attachments
        .map(
          (att) => `
      <div class="attachment-item d-flex justify-content-between align-items-center">
        <div>
          <i class="${getFileIcon(att.file_type)} me-2"></i>
          ${Utils.escapeHtml(att.original_filename)}
          <small class="text-muted ms-2">(${formatFileSize(
            att.file_size
          )})</small>
        </div>
        <button type="button" class="btn btn-sm btn-danger" onclick="deleteAttachment('${
          att.id
        }')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `
        )
        .join("");
  }

  selectedFiles = [];
  document.getElementById("filePreview").innerHTML = "";

  new bootstrap.Modal(document.getElementById("noticeModal")).show();
};

// Delete attachment
window.deleteAttachment = async function (attachmentId) {
  if (!(await Utils.confirm("Delete this attachment?"))) return;

  try {
    await API.deleteAttachment(attachmentId);
    Utils.showToast("Attachment deleted", "success");
    loadData();
    if (editingNoticeId) {
      editNotice(editingNoticeId);
    }
  } catch (error) {
    Utils.showToast("Failed to delete attachment", "danger");
  }
};

// Delete notice
window.deleteNotice = async function (noticeId) {
  if (!(await Utils.confirm("Are you sure you want to delete this notice?")))
    return;

  try {
    await API.deleteNotice(noticeId);
    Utils.showToast("Notice deleted successfully", "success");
    loadData();
  } catch (error) {
    Utils.showToast(error.message || "Failed to delete notice", "danger");
  }
};

// Submit form
document.getElementById("noticeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const type = document.getElementById("noticeType").value;

  // Validate recipients for CLASS and SECTION types
  if (
    (type === "CLASS" || type === "SECTION") &&
    selectedRecipients.length === 0
  ) {
    Utils.showToast("Please select at least one recipient", "warning");
    return;
  }

  const formData = new FormData();
  formData.append("title", document.getElementById("noticeTitle").value);
  formData.append("message", document.getElementById("noticeMessage").value);
  formData.append("notice_type", type);
  //   formData.append("recipients", JSON.stringify(selectedRecipients));
  // Transform recipients to match backend expectation
  const recipients = selectedRecipients.map((r) => ({
    class_id: r.section_id ? null : r.class_id,
    section_id: r.section_id || null,
  }));
  formData.append("recipients", JSON.stringify(recipients));

  // Add files
  selectedFiles.forEach((file) => {
    formData.append("attachments", file);
  });

  try {
    if (editingNoticeId) {
      await API.updateNoticeWithFiles(editingNoticeId, formData);
      Utils.showToast("Notice updated successfully", "success");
    } else {
      await API.createNoticeWithFiles(formData);
      Utils.showToast("Notice created successfully", "success");
    }

    bootstrap.Modal.getInstance(document.getElementById("noticeModal")).hide();
    loadData();
  } catch (error) {
    Utils.showToast(error.message || "Operation failed", "danger");
  }
});

// Search and filter
document
  .getElementById("searchInput")
  .addEventListener("input", Utils.debounce(filterNotices, 300));
document.getElementById("typeFilter").addEventListener("change", filterNotices);

function filterNotices() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const typeFilter = document.getElementById("typeFilter").value;

  const filtered = allNotices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search) ||
      n.message.toLowerCase().includes(search);
    const matchesType = !typeFilter || n.notice_type === typeFilter;
    return matchesSearch && matchesType;
  });

  displayNotices(filtered);
}

// Initialize
loadData();

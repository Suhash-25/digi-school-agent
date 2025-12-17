// ApiService is now available globally

// ===============================
// DOM ELEMENTS
// ===============================
const contentList = document.getElementById("contentList");
const addContentBtn = document.getElementById("addContentBtn");
const modal = document.getElementById("contentModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const contentForm = document.getElementById("contentForm");
const modalTitle = document.getElementById("modalTitle");

// Delete modal elements
const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

let editContentId = "";
let deleteContentId = "";

// ===============================
// INITIALIZE
// ===============================
document.addEventListener("DOMContentLoaded", loadContents);

// ===============================
// FETCH AND RENDER CONTENTS
// ===============================
async function loadContents() {
  contentList.innerHTML = `<div class="loading-animation"><div class="spinner"></div><p>Loading your content...</p></div>`;
  try {
    const response = await fetch('http://localhost:8082/schools/');
    const contents = await response.json();
    updateStats(contents);
    renderContents(contents);
  } catch (error) {
    console.error("Error fetching contents:", error);
    contentList.innerHTML = `<p class="error-text">Failed to connect to backend. Error: ${error.message}</p>`;
  }
}

function updateStats(contents) {
  const totalContent = contents.length;
  const homeworkCount = contents.filter(c => c.content_type.toLowerCase() === 'homework').length;
  const notesCount = contents.filter(c => c.content_type.toLowerCase().includes('note')).length;
  const announcementCount = contents.filter(c => c.content_type.toLowerCase() === 'announcement').length;
  
  document.getElementById('totalContent').textContent = totalContent;
  document.getElementById('homeworkCount').textContent = homeworkCount;
  document.getElementById('notesCount').textContent = notesCount;
  document.getElementById('announcementCount').textContent = announcementCount;
}

function renderContents(contents = []) {
  if (!contents.length) {
    contentList.innerHTML = `<p>No contents found. Add a new one!</p>`;
    return;
  }

  contentList.innerHTML = contents
    .map(
      (c) => `
      <div class="content-card">
        <div class="content-info">
          <h3>${escapeHtml(c.title)} (${escapeHtml(c.content_type)})</h3>
          <p><strong>Teacher ID:</strong> ${escapeHtml(c.teacher_id)}</p>
          <p><strong>Class:</strong> ${escapeHtml(c.class_name)}</p>
          ${c.subject ? `<p><strong>Subject:</strong> ${escapeHtml(c.subject)}</p>` : ""}
          ${c.description ? `<p><strong>Description:</strong> ${escapeHtml(c.description)}</p>` : ""}
          ${
            c.attachment_urls && c.attachment_urls.length
              ? `<p><strong>Attachments:</strong> ${c.attachment_urls.map(url => `<a href="${escapeAttr(url)}" target="_blank">${escapeHtml(url)}</a>`).join(", ")}</p>`
              : ""
          }
          <p><strong>Uploaded:</strong> ${escapeHtml(c.date_uploaded)}</p>
        </div>
        <div class="content-actions">
          <button
            class="btn-edit"
            data-action="edit"
            data-id="${c.content_id}"
            data-teacher_id="${escapeAttr(c.teacher_id)}"
            data-class_name="${escapeAttr(c.class_name)}"
            data-subject="${escapeAttr(c.subject || "")}"
            data-content_type="${escapeAttr(c.content_type)}"
            data-title="${escapeAttr(c.title)}"
            data-description="${escapeAttr(c.description || "")}"
            data-attachment_urls="${escapeAttr((c.attachment_urls || []).join(","))}"
          >
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn-delete" data-action="delete" data-id="${c.content_id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `
    )
    .join("");
}

// ===============================
// MODAL HANDLERS
// ===============================
addContentBtn.addEventListener("click", () => openModal());
closeModalBtn.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
  if (e.target === deleteModal) deleteModal.style.display = "none";
});

function openModal(content = null) {
  modal.style.display = "flex";
  if (content) {
    modalTitle.textContent = "Edit Content";
    contentForm.teacher_id.value = content.teacher_id;
    contentForm.class_name.value = content.class_name;
    contentForm.subject.value = content.subject || "";
    contentForm.content_type.value = content.content_type;
    contentForm.title.value = content.title;
    contentForm.description.value = content.description || "";
    contentForm.attachment_urls.value = (content.attachment_urls || []).join(",");
  } else {
    modalTitle.textContent = "Add New Content";
    contentForm.reset();
  }
}

function closeModal() {
  modal.style.display = "none";
  editContentId = "";
}

// ===============================
// FORM SUBMISSION
// ===============================
contentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const contentData = {
    teacher_id: contentForm.teacher_id.value,
    class_name: contentForm.class_name.value,
    subject: contentForm.subject.value,
    content_type: contentForm.content_type.value,
    title: contentForm.title.value,
    description: contentForm.description.value,
    attachment_urls: contentForm.attachment_urls.value
      ? contentForm.attachment_urls.value.split(",").map((u) => u.trim())
      : [],
  };

  try {
    if (editContentId) {
      await ApiService.put(`/schools/${editContentId}`, contentData);
    } else {
      await ApiService.post("/schools/", contentData);
    }
    closeModal();
    loadContents();
  } catch (error) {
    console.error("Error saving content:", error);
  }
});

// ===============================
// EDIT / DELETE HANDLERS
// ===============================
contentList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const { action, id } = btn.dataset;

  if (action === "edit") {
    const data = {
      teacher_id: btn.dataset.teacher_id,
      class_name: btn.dataset.class_name,
      subject: btn.dataset.subject,
      content_type: btn.dataset.content_type,
      title: btn.dataset.title,
      description: btn.dataset.description,
      attachment_urls: btn.dataset.attachment_urls.split(",").filter(Boolean),
    };
    editContent(id, data);
  } else if (action === "delete") {
    openDeleteModal(id);
  }
});

function editContent(id, data) {
  editContentId = id;
  openModal(data);
}

// ===============================
// CUSTOM DELETE MODAL
// ===============================
function openDeleteModal(id) {
  deleteContentId = id;
  deleteModal.style.display = "flex";
}

cancelDeleteBtn.addEventListener("click", () => {
  deleteModal.style.display = "none";
  deleteContentId = "";
});

confirmDeleteBtn.addEventListener("click", async () => {
  if (!deleteContentId) return;
  try {
    await ApiService.delete(`/schools/${deleteContentId}`);
    deleteModal.style.display = "none";
    deleteContentId = "";
    loadContents();
  } catch (error) {
    console.error("Error deleting content:", error);
  }
});

// ===============================
// UTILITY FUNCTIONS
// ===============================
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(str = "") {
  return String(str).replaceAll('"', "&quot;");
}

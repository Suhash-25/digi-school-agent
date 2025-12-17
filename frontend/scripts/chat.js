// ApiService is available globally
const AgentName = "agent";
let activeSessionId = "";

document.addEventListener("DOMContentLoaded", () => {
  initChat();
});

function initChat() {
  const newSessionButton = document.getElementById("new-session");
  newSessionButton.addEventListener("click", createSession);
  listSessions();
}

// DOM elements
const messagesEl = document.getElementById("messages");
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const fileInput = document.getElementById("file-input");
const uploadList = document.getElementById("upload-list");
const sessionsListWrapper = document.getElementById("sessions-list");

function listSessions() {
  // Simple session management
  activeSessionId = "default-session";
  createSessionElement("default-session");
}

function createSessionElement(id) {
  const li = document.createElement("li");
  li.setAttribute("id", `id-${id}`);
  li.setAttribute("class", "session-item");
  const deleteIcon = document.createElement("i");
  deleteIcon.setAttribute("class", "fa fa-trash delete-session");
  deleteIcon.onclick = (event) => deleteSession(event, id);
  const spanEl = document.createElement("span");
  spanEl.innerHTML = id;
  if (activeSessionId === id) {
    const existingSessions =
      sessionsListWrapper.querySelectorAll(".session-item");
    if (existingSessions.length) {
      for (let j = 0; j < existingSessions.length; j++) {
        existingSessions[j].classList.remove("active");
      }
    }
    li.classList.add("active");
    updateActiveSession(id);
  }
  li.onclick = () => updateActiveSession(id);
  li.appendChild(spanEl);
  li.appendChild(deleteIcon);
  sessionsListWrapper.appendChild(li);
}

function createSession() {
  // Clear messages for new session
  messagesEl.innerHTML = "";
  appendMessage({ parts: [{ text: "Hello! I'm your Digi School Agent. I can help you with homework, announcements, and notes. What would you like to know?" }] }, "model");
}

function deleteSession(event, id) {
  event.stopPropagation();
  ApiService.delete(`/apps/${AgentName}/users/user/sessions/${id}`)
    .then(() => {
      const session = document.getElementById(`id-${id}`);
      const wasActive = session.classList.contains("active");
      if (wasActive) {
        const firstSession = document.querySelector(".session-item");
        firstSession.classList.add("active");
        activeSession = firstSession.getAttribute("id");
      }
      session.parentNode.removeChild(session);
    })
    .catch((error) => console.error(error));
}

function updateActiveSession(id) {
  ApiService.get(`/apps/${AgentName}/users/user/sessions/${id}`)
    .then((sessionResponse) => {
      const existingSessions =
        sessionsListWrapper.querySelectorAll(".session-item");
      if (existingSessions.length) {
        for (let j = 0; j < existingSessions.length; j++) {
          existingSessions[j].classList.remove("active");
        }
      }
      const listEl = document.getElementById(`id-${id}`);
      activeSessionId = id;
      listEl.classList.add("active");
      messagesEl.innerHTML = "";
      renderEvents(sessionResponse.events);
    })
    .catch((error) => console.error(error));
}

function renderEvents(events) {
  for (let i = 0; i < events.length; i++) {
    if (events[i].content) {
      appendMessage(events[i].content, events[i].content.role);
    }
  }
}

// Helpers
function appendMessage(content, who = "model") {
  const el = document.createElement("div");
  if (content.parts) {
    for (let i = 0; i < content.parts.length; i++) {
      const part = content.parts[i];
      if (part.functionResponse) {
        el.className = `message model function`;
        el.innerHTML = `<i class="fa fa-check"></i> ${part.functionResponse.name}`;
      } else {
        el.className = `message ${who}`;
        if (part.text) {
          el.innerHTML = marked.parse(part.text);
        }
        if (part.functionCall) {
          el.classList.add("function");
          el.innerHTML = `<i class="fa fa-bolt"></i> ${part.functionCall.name}`;
        }
        if (part.inlineData) {
          const mediaEl = createMediaElement(part.inlineData);
          if (mediaEl) {
            el.appendChild(mediaEl);
          }
        }
      }
    }
  }
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return el;
}

function createMediaElement({ data, mimeType, displayName }) {
  const wrapper = document.createElement("div");
  wrapper.className = "message-media";
  const encrpytedData = data.replace(/_/g, "/").replace(/-/g, "+");
  if (mimeType.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = `data:${mimeType};base64,${encrpytedData}`;
    img.alt = displayName;
    img.loading = "lazy";
    wrapper.appendChild(img);
  } else {
    // For non-image files, show a download link
    const link = document.createElement("a");
    link.href = `data:${mimeType};base64,${encrpytedData}`;
    link.download = displayName;
    link.innerHTML = `<i class="fa fa-download"></i> ${displayName}`;
    wrapper.appendChild(link);
  }

  return wrapper;
}

function setSending(isSending) {
  sendBtn.disabled = isSending;
  input.disabled = isSending;
}

// File handling
let currentFile = null;
const filePreview = document.createElement("div");
filePreview.className = "file-preview";
form.insertBefore(filePreview, form.firstChild);

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Extract the base64 data from the DataURL
      const base64Data = reader.result.split(",")[1];
      resolve({
        data: base64Data,
        displayName: file.name,
        mimeType: file.type,
      });
    };
    reader.onerror = (error) => reject(error);
  });
}

function showFilePreview(file) {
  filePreview.innerHTML = "";
  if (!file) return;

  const wrapper = document.createElement("div");
  wrapper.className = "preview-wrapper";

  if (file.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.className = "message-media preview";
    const reader = new FileReader();
    reader.onload = (e) => (img.src = e.target.result);
    reader.readAsDataURL(file);
    wrapper.appendChild(img);
  } else {
    const fileInfo = document.createElement("div");
    fileInfo.className = "file-info";
    fileInfo.innerHTML = `<i class="fa fa-file"></i> ${file.name}`;
    wrapper.appendChild(fileInfo);
  }

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-preview";
  removeBtn.innerHTML = '<i class="fa fa-times"></i>';
  removeBtn.onclick = clearFilePreview;
  wrapper.appendChild(removeBtn);

  filePreview.appendChild(wrapper);
}

function clearFilePreview() {
  filePreview.innerHTML = "";
  currentFile = null;
  fileInput.value = "";
}

async function sendMessage(text, attachedFile = null) {
  if (!text) return;

  setSending(true);
  appendMessage({ parts: [{ text }] }, "user");

  try {
    const allContent = await fetch('http://localhost:8082/schools/').then(r => r.json());
    const query = text.toLowerCase();
    let response = "Hello! I'm your Digi School Agent. Ask me anything about your school content!";
    
    // GREETINGS AND BASIC RESPONSES
    if (query.match(/^(hi+|hello|hey|good morning|good afternoon)$/)) {
      response = "Hello! I'm your Digi School Agent. I can help you with:\n\n• Show homework, notes, or assignments\n• Filter by dates (November 5th, November 16th)\n• Filter by class (Grade 5, Grade 6, B.E)\n• Update, remove, or add content\n\nWhat would you like to know?";
      appendMessage({ parts: [{ text: response }] }, "model");
      setSending(false);
      return;
    }
    
    if (query.includes('help') || query.includes('what can you do')) {
      response = "I can help you with:\n\n📚 **Show Content:**\n- 'show homework'\n- 'show notes on November 5th'\n- 'show B.E assignments'\n\n⚙️ **Manage Content:**\n- 'update title of [old] to [new]'\n- 'remove [content name]'\n- 'upload notes for [class]'\n\nJust ask me naturally!";
      appendMessage({ parts: [{ text: response }] }, "model");
      setSending(false);
      return;
    }
    
    // CRUD OPERATIONS FIRST (before filtering)
    if (query.includes('update') && query.includes('title')) {
      let itemToUpdate = null;
      let newTitle = '';
      
      // Smart parsing - look for common patterns
      if (query.includes('earth') && query.includes('globe')) {
        itemToUpdate = allContent.find(c => c.title.toLowerCase().includes('earth'));
        newTitle = 'globe';
      } else if (query.includes('social') && query.includes('math')) {
        itemToUpdate = allContent.find(c => c.title.toLowerCase().includes('social'));
        newTitle = 'math';
      } else {
        // Try to extract from 'to' pattern
        const words = text.split(' ');
        const toIndex = words.findIndex(w => w.toLowerCase() === 'to');
        
        if (toIndex > -1) {
          newTitle = words.slice(toIndex + 1).join(' ').replace(/[\[\]]/g, '');
          
          // Find item by searching for any title mentioned
          for (const item of allContent) {
            if (query.includes(item.title.toLowerCase())) {
              itemToUpdate = item;
              break;
            }
          }
        }
      }
      
      if (itemToUpdate && newTitle) {
        try {
          const updateResponse = await fetch(`http://localhost:8082/schools/${itemToUpdate.content_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle })
          });
          if (updateResponse.ok) {
            response = `✅ Updated "${itemToUpdate.title}" to "${newTitle}". Refresh your dashboard!`;
          } else {
            response = "Failed to update. Please try again.";
          }
        } catch (err) {
          response = "Error: " + err.message;
        }
      } else {
        response = "I understand you want to update a title. Just say: 'update earth to globe' or 'change social title to math'";
      }
    }
    else if (query.includes('remove') || query.includes('delete')) {
      // Find item to remove
      let itemToRemove = null;
      
      // Look for specific titles or keywords
      for (const item of allContent) {
        if (query.includes(item.title.toLowerCase()) || 
            (query.includes('announcement') && item.content_type === 'announcement') ||
            (query.includes('homework') && item.content_type.toLowerCase() === 'homework')) {
          itemToRemove = item;
          break;
        }
      }
      
      if (itemToRemove) {
        try {
          const deleteResponse = await fetch(`http://localhost:8082/schools/${itemToRemove.content_id}`, {
            method: 'DELETE'
          });
          if (deleteResponse.ok) {
            response = `✅ Removed "${itemToRemove.title}". Refresh your dashboard!`;
          } else {
            response = "Failed to remove. Please try again.";
          }
        } catch (err) {
          response = "Error: " + err.message;
        }
      } else {
        response = "Could not find the item to remove. Please be more specific.";
      }
    }
    else if (query.includes('upload') || query.includes('add')) {
      // Extract details for new content
      let className = 'General';
      let subject = 'General';
      let contentType = 'notes';
      
      if (query.includes('b.e')) className = 'B.E';
      if (query.includes('grade 5')) className = 'Grade 5';
      if (query.includes('grade 6')) className = 'Grade 6';
      
      if (query.includes('math')) subject = 'Math';
      if (query.includes('science')) subject = 'Science';
      if (query.includes('english')) subject = 'English';
      if (query.includes('computer')) subject = 'Computer Science';
      
      if (query.includes('homework')) contentType = 'homework';
      if (query.includes('assignment')) contentType = 'assignment';
      
      try {
        const newContent = {
          teacher_id: 'CHAT001',
          class_name: className,
          subject: subject,
          content_type: contentType,
          title: `New ${subject} ${contentType}`,
          description: 'Added via chat interface'
        };
        
        const uploadResponse = await fetch('http://localhost:8082/schools/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newContent)
        });
        
        if (uploadResponse.ok) {
          response = `✅ Added new ${contentType} for ${className} ${subject}. Refresh your dashboard!`;
        } else {
          response = "Failed to add content. Please try again.";
        }
      } catch (err) {
        response = "Error: " + err.message;
      }
    }
    else {
      // SMART CONTENT FILTERING
      let filteredContent = allContent;
      
      // Filter by content type
      if (query.includes('homework')) {
        filteredContent = allContent.filter(c => c.content_type.toLowerCase() === 'homework');
      } else if (query.includes('notes') || query.includes('note')) {
        filteredContent = allContent.filter(c => c.content_type.toLowerCase().includes('note'));
      } else if (query.includes('announcement')) {
        filteredContent = allContent.filter(c => c.content_type.toLowerCase() === 'announcement');
      } else if (query.includes('assignment')) {
        filteredContent = allContent.filter(c => c.content_type.toLowerCase() === 'assignment');
      }
      
      // Filter by date
      if (query.includes('november 5') || query.includes('nov 5')) {
        filteredContent = filteredContent.filter(c => c.date_uploaded === '2025-11-05');
      } else if (query.includes('november 16') || query.includes('nov 16')) {
        filteredContent = filteredContent.filter(c => c.date_uploaded === '2025-11-16');
      }
      
      // Filter by class
      if (query.includes('grade 5')) {
        filteredContent = filteredContent.filter(c => c.class_name.toLowerCase().includes('grade 5'));
      } else if (query.includes('grade 6')) {
        filteredContent = filteredContent.filter(c => c.class_name.toLowerCase().includes('grade 6'));
      } else if (query.includes('b.e')) {
        filteredContent = filteredContent.filter(c => c.class_name.toLowerCase().includes('b.e'));
      }
      
      // DISPLAY RESULTS
      if (filteredContent.length > 0) {
        const contentType = query.includes('homework') ? 'homework' : 
                           query.includes('notes') ? 'notes' : 
                           query.includes('announcement') ? 'announcements' : 'content';
        
        response = `Found ${filteredContent.length} ${contentType}:\n\n` + 
          filteredContent.map(c => {
            const icon = c.content_type.toLowerCase().includes('homework') ? '📚' : 
                        c.content_type.toLowerCase().includes('note') ? '📝' : 
                        c.content_type.toLowerCase() === 'announcement' ? '📢' : '📄';
            return `${icon} ${c.subject}: ${c.title}\n   Class: ${c.class_name}\n   Teacher: ${c.teacher_id}\n   Date: ${c.date_uploaded}\n   Description: ${c.description || 'No description'}`;
          }).join('\n\n');
      } else {
        const requestedType = query.includes('homework') ? 'homework' : 
                             query.includes('notes') ? 'notes' : 
                             query.includes('announcement') ? 'announcements' : 'content';
        const requestedDate = query.includes('november 5') ? 'November 5th' : 
                             query.includes('november 16') ? 'November 16th' : '';
        
        if (requestedDate) {
          response = `No ${requestedType} available for ${requestedDate}.`;
        } else {
          response = `No ${requestedType} available in the database.`;
        }
      }
    }

    appendMessage({ parts: [{ text: response }] }, "model");
  } catch (err) {
    appendMessage({ parts: [{ text: "Error: " + err.message }] }, "model");
  } finally {
    setSending(false);
  }
}

// File input handler
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    currentFile = file;
    showFilePreview(file);
  }
});

// Form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  input.value = "";
  await sendMessage(text, currentFile);
});

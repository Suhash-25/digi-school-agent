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
    const existingSessions = sessionsListWrapper.querySelectorAll(".session-item");
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
  messagesEl.innerHTML = "";
  appendMessage({ parts: [{ text: "Hello! I'm your Digi School Agent. Ask me anything!" }] }, "model");
}

function deleteSession(event, id) {
  event.stopPropagation();
}

function updateActiveSession(id) {
  activeSessionId = id;
  messagesEl.innerHTML = "";
  appendMessage({ parts: [{ text: "Hello! I'm your Digi School Agent. Ask me anything!" }] }, "model");
}

function renderEvents(events) {
  for (let i = 0; i < events.length; i++) {
    if (events[i].content) {
      appendMessage(events[i].content, events[i].content.role);
    }
  }
}

function appendMessage(content, who = "model") {
  const el = document.createElement("div");
  if (content.parts) {
    for (let i = 0; i < content.parts.length; i++) {
      const part = content.parts[i];
      el.className = `message ${who}`;
      if (part.text) {
        if (part.text.includes('<div class=')) {
          el.innerHTML = part.text;
        } else {
          el.innerHTML = marked.parse(part.text);
        }
      }
    }
  }
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return el;
}

function setSending(isSending) {
  sendBtn.disabled = isSending;
  input.disabled = isSending;
}

async function sendMessage(text, attachedFile = null) {
  if (!text) return;

  setSending(true);
  appendMessage({ parts: [{ text }] }, "user");

  try {
    const allContent = await fetch('http://localhost:8082/schools/').then(r => r.json());
    const query = text.toLowerCase();
    let response = "I'm your Digi School Agent. How can I help you?";
    
    // GREETINGS
    if (query.match(/^(hi+|hello|hey)$/)) {
      response = formatGreeting();
    }
    // UPDATE OPERATIONS
    else if (query.includes('update') && (query.includes('title') || query.includes('change'))) {
      let itemToUpdate = null;
      let newTitle = '';
      
      // Find what to update
      for (const item of allContent) {
        if (query.includes(item.title.toLowerCase())) {
          itemToUpdate = item;
          break;
        }
      }
      
      // Extract new title
      if (query.includes(' to ')) {
        newTitle = query.split(' to ')[1].trim();
      }
      
      if (itemToUpdate && newTitle) {
        try {
          const updateResponse = await fetch(`http://localhost:8082/schools/${itemToUpdate.content_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle })
          });
          if (updateResponse.ok) {
            response = formatSuccess('Perfect!', `Updated "${itemToUpdate.title}" to "${newTitle}"`);
          } else {
            response = formatError('That didn\'t work. Could you rephrase your request?');
          }
        } catch (err) {
          response = formatError(`Error: ${err.message}`);
        }
      } else {
        response = formatError("Please specify what to update. Example: 'update earth to globe'");
      }
    }
    // REMOVE OPERATIONS
    else if (query.includes('remove') || query.includes('delete')) {
      let itemToRemove = null;
      
      for (const item of allContent) {
        if (query.includes(item.title.toLowerCase())) {
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
            response = `
              <div style="background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; padding: 1rem; border-radius: 8px; text-align: center;">
                <div style="font-weight: 600; margin-bottom: 0.5rem;">Successfully Removed!</div>
                <div>"${itemToRemove.title}"</div>
                <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.8;">Refresh your dashboard to see the changes</div>
              </div>
            `;
          } else {
            response = formatError('Couldn\'t remove that. Could you be more specific about what to delete?');
          }
        } catch (err) {
          response = formatError(`Error: ${err.message}`);
        }
      } else {
        response = formatError("Please specify what to remove. Example: 'remove servers'");
      }
    }
    // ANALYTICS QUERIES
    else if (query.includes('how many') || query.includes('total') || query.includes('count') || query.includes('which subject') || query.includes('most uploaded')) {
      // Total content count
      if (query.includes('total content') || (query.includes('how many') && query.includes('content'))) {
        const totalCount = allContent.length;
        const homeworkCount = allContent.filter(c => c.content_type.toLowerCase() === 'homework').length;
        const notesCount = allContent.filter(c => c.content_type.toLowerCase().includes('note')).length;
        const announcementCount = allContent.filter(c => c.content_type.toLowerCase() === 'announcement').length;
        const assignmentCount = allContent.filter(c => c.content_type.toLowerCase() === 'assignment').length;
        
        response = `
          <div class="analytics-container">
            <div class="analytics-header">Analytics Report</div>
            <div class="stat-card">
              <span class="stat-label">Total Content</span>
              <span class="stat-value">${totalCount}</span>
            </div>
            <div class="stats-section">
              <h4 class="section-title">Content Breakdown</h4>
              <div class="stat-item">
                <span>Homework</span>
                <span class="count">${homeworkCount}</span>
              </div>
              <div class="stat-item">
                <span>Notes</span>
                <span class="count">${notesCount}</span>
              </div>
              <div class="stat-item">
                <span>Announcements</span>
                <span class="count">${announcementCount}</span>
              </div>
              <div class="stat-item">
                <span>Assignments</span>
                <span class="count">${assignmentCount}</span>
              </div>
            </div>
          </div>
        `;
      }
      // Subject with most materials
      else if (query.includes('which subject') || query.includes('most uploaded')) {
        const subjectCounts = {};
        allContent.forEach(c => {
          const subject = c.subject || 'Unknown';
          subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
        });
        
        const sortedSubjects = Object.entries(subjectCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5);
        
        if (sortedSubjects.length > 0) {
          const topSubject = sortedSubjects[0];
          response = `
            <div class="analytics-container">
              <div class="analytics-header">Subject Analytics Report</div>
              <div class="stat-card">
                <span class="stat-label">Top Subject</span>
                <span class="stat-value">${topSubject[0]} (${topSubject[1]})</span>
              </div>
              <div class="stats-section">
                <h4 class="section-title">All Subjects Ranking</h4>
                ${sortedSubjects.map(([subject, count], index) => `
                  <div class="stat-item">
                    <span>${index + 1}. ${subject}</span>
                    <span class="count">${count}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        } else {
          response = `<div class="no-results">No subject data available for analysis</div>`;
        }
      }
      // General count queries
      else if (query.includes('how many')) {
        if (query.includes('homework')) {
          const count = allContent.filter(c => c.content_type.toLowerCase() === 'homework').length;
          const classCounts = [...new Set(allContent.filter(c => c.content_type.toLowerCase() === 'homework').map(c => c.class_name))].map(className => {
            const classCount = allContent.filter(c => c.content_type.toLowerCase() === 'homework' && c.class_name === className).length;
            return { className, classCount };
          });
          
          response = `
            <div class="analytics-container">
              <div class="analytics-header">Homework Analytics</div>
              <div class="stat-card">
                <span class="stat-label">Total Homework</span>
                <span class="stat-value">${count}</span>
              </div>
              <div class="stats-section">
                <h4 class="section-title">By Class</h4>
                ${classCounts.map(({className, classCount}) => `
                  <div class="stat-item">
                    <span>${className}</span>
                    <span class="count">${classCount}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        } else if (query.includes('notes')) {
          const count = allContent.filter(c => c.content_type.toLowerCase().includes('note')).length;
          const subjectCounts = [...new Set(allContent.filter(c => c.content_type.toLowerCase().includes('note')).map(c => c.subject))].map(subject => {
            const subjectCount = allContent.filter(c => c.content_type.toLowerCase().includes('note') && c.subject === subject).length;
            return { subject, subjectCount };
          });
          
          response = `
            <div class="analytics-container">
              <div class="analytics-header">Notes Analytics</div>
              <div class="stat-card">
                <span class="stat-label">Total Notes</span>
                <span class="stat-value">${count}</span>
              </div>
              <div class="stats-section">
                <h4 class="section-title">By Subject</h4>
                ${subjectCounts.map(({subject, subjectCount}) => `
                  <div class="stat-item">
                    <span>${subject}</span>
                    <span class="count">${subjectCount}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        } else {
          response = `
            <div class="analytics-container">
              <div class="analytics-header">General Analytics</div>
              <div class="stat-card">
                <span class="stat-label">Total Content</span>
                <span class="stat-value">${allContent.length}</span>
              </div>
              <div class="help-section">
                <h4 class="help-section-title">Ask me specific questions like:</h4>
                <div class="help-examples">
                  <div class="help-example">"How many homework entries are there?"</div>
                  <div class="help-example">"How many notes for Grade 5?"</div>
                  <div class="help-example">"Which subject has the most materials?"</div>
                </div>
              </div>
            </div>
          `;
        }
      }
    }
    // MULTI-MODAL QUERIES - Department Analytics
    else if (query.includes('department') && (query.includes('most notes') || query.includes('uploaded the most notes'))) {
      try {
        const deptAnalytics = await fetch('http://localhost:8082/schools/analytics/departments').then(r => r.json());
        const sortedByNotes = deptAnalytics.sort((a, b) => b.notes_count - a.notes_count);
        
        if (sortedByNotes.length > 0) {
          const topDept = sortedByNotes[0];
          response = `
            <div class="analytics-container">
              <div class="analytics-header">Department Notes Report</div>
              <div class="stat-card">
                <span class="stat-label">Top Department</span>
                <span class="stat-value">${topDept.department} (${topDept.notes_count})</span>
              </div>
              <div class="stats-section">
                <h4 class="section-title">All Departments Ranking</h4>
                ${sortedByNotes.map((dept, index) => `
                  <div class="stat-item">
                    <span>${index + 1}. ${dept.department}</span>
                    <span class="count">${dept.notes_count} notes</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        } else {
          response = `<div class="no-results">No department data available for notes analysis</div>`;
        }
      } catch (err) {
        response = formatError(`Error fetching department analytics: ${err.message}`);
      }
    }
    else if (query.includes('science department') && query.includes('uploads')) {
      try {
        const deptAnalytics = await fetch('http://localhost:8082/schools/analytics/departments').then(r => r.json());
        const scienceDept = deptAnalytics.find(d => d.department.toLowerCase() === 'science');
        
        if (scienceDept) {
          const totalUploads = deptAnalytics.reduce((sum, d) => sum + d.total_uploads, 0);
          const percentage = Math.round((scienceDept.total_uploads / totalUploads) * 100);
          
          response = `
            <div class="analytics-container">
              <div class="analytics-header">Science Department Report</div>
              <div class="stat-card">
                <span class="stat-label">Total Uploads</span>
                <span class="stat-value">${scienceDept.total_uploads}</span>
              </div>
              <div class="stats-section">
                <h4 class="section-title">Content Breakdown</h4>
                <div class="stat-item">
                  <span>Notes</span>
                  <span class="count">${scienceDept.notes_count}</span>
                </div>
                <div class="stat-item">
                  <span>Other Content</span>
                  <span class="count">${scienceDept.total_uploads - scienceDept.notes_count}</span>
                </div>
                <div class="stat-item">
                  <span>Share of Total</span>
                  <span class="count">${percentage}%</span>
                </div>
              </div>
            </div>
          `;
        } else {
          response = `<div class="no-results">No upload data found for Science department</div>`;
        }
      } catch (err) {
        response = formatError(`Error fetching Science department data: ${err.message}`);
      }
    }
    // AUDITING QUERIES
    else if (query.includes('teacher') && (query.includes('recent') || query.includes('most recent') || query.includes('latest'))) {
      if (allContent.length > 0) {
        const sortedByDate = allContent.sort((a, b) => new Date(b.date_uploaded) - new Date(a.date_uploaded));
        const mostRecent = sortedByDate[0];
        response = `
          <div class="analytics-container">
            <div class="analytics-header">Auditing Report - Recent Uploads</div>
            <div class="stat-card">
              <span class="stat-label">Most Recent Upload</span>
              <span class="stat-value">Teacher ${mostRecent.teacher_id}</span>
            </div>
            <div class="stats-section">
              <h4 class="section-title">Details</h4>
              <div class="stat-item"><span>Content</span><span>"${mostRecent.title}"</span></div>
              <div class="stat-item"><span>Subject</span><span>${mostRecent.subject}</span></div>
              <div class="stat-item"><span>Class</span><span>${mostRecent.class_name}</span></div>
              <div class="stat-item"><span>Type</span><span>${mostRecent.content_type}</span></div>
              <div class="stat-item"><span>Date</span><span>${mostRecent.date_uploaded}</span></div>
            </div>
            <div class="stats-section">
              <h4 class="section-title">Recent Activity</h4>
              ${sortedByDate.slice(0, 3).map((c, i) => `
                <div class="stat-item">
                  <span>${i + 1}. ${c.teacher_id} - "${c.title}"</span>
                  <span class="count">${c.date_uploaded}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        response = `<div class="no-results">No upload records found for auditing</div>`;
      }
    }
    else if (query.includes('teacher') && query.includes('homework') && query.includes('week')) {
      const currentDate = new Date();
      const weekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const thisWeekHomework = allContent.filter(c => {
        const uploadDate = new Date(c.date_uploaded);
        return c.content_type.toLowerCase() === 'homework' && uploadDate >= weekAgo;
      });
      
      const teachersThisWeek = [...new Set(thisWeekHomework.map(c => c.teacher_id))];
      
      if (teachersThisWeek.length > 0) {
        response = `
          <div class="analytics-container">
            <div class="analytics-header">Weekly Homework Report</div>
            <div class="stat-card">
              <span class="stat-label">Teachers This Week</span>
              <span class="stat-value">${teachersThisWeek.length}</span>
            </div>
            <div class="stats-section">
              <h4 class="section-title">Teacher List</h4>
              ${teachersThisWeek.map(teacherId => {
                const teacherHomework = thisWeekHomework.filter(c => c.teacher_id === teacherId);
                return `
                  <div class="stat-item">
                    <span>Teacher ${teacherId}</span>
                    <span class="count">${teacherHomework.length} homework</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      } else {
        response = `
          <div class="analytics-container">
            <div class="analytics-header">Weekly Homework Report</div>
            <div class="no-results">No teachers uploaded homework in the past week</div>
            <div style="text-align: center; margin-top: 0.5rem; font-size: 0.9rem; color: #713F12;">Try checking for a longer period or different content types</div>
          </div>
        `;
      }
    }
    else if (query.includes('class') && (query.includes('most upload') || query.includes('received most'))) {
      const classCounts = {};
      allContent.forEach(c => {
        const className = c.class_name || 'Unknown';
        classCounts[className] = (classCounts[className] || 0) + 1;
      });
      
      const sortedClasses = Object.entries(classCounts)
        .sort(([,a], [,b]) => b - a);
      
      if (sortedClasses.length > 0) {
        const topClass = sortedClasses[0];
        response = `
          <div class="analytics-container">
            <div class="analytics-header">Class Upload Statistics</div>
            <div class="stat-card">
              <span class="stat-label">Most Active Class</span>
              <span class="stat-value">${topClass[0]} (${topClass[1]})</span>
            </div>
            <div class="stats-section">
              <h4 class="section-title">All Classes Ranking</h4>
              ${sortedClasses.map(([className, count], index) => `
                <div class="stat-item">
                  <span>${index + 1}. ${className}</span>
                  <span class="count">${count} uploads</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        response = `<div class="no-results">No class data available for auditing analysis</div>`;
      }
    }
    // ADD/UPLOAD OPERATIONS
    else if ((query.includes('upload') || query.includes('add')) && !query.includes('how many') && !query.includes('total') && !query.includes('which subject')) {
      // Check if user provided complete details
      const hasTeacherId = /teacher[\s:]+([a-zA-Z0-9]+)/i.test(query);
      const hasTitle = /title[\s:]+([^,]+)/i.test(query) || /"([^"]+)"/i.test(query);
      
      if (!hasTeacherId || !hasTitle) {
        response = `
          <div class="help-card">
            <div class="help-header">I'd love to help you upload content!</div>
            <div class="help-sections">
              <div class="help-section">
                <h4 class="help-section-title">Required Information</h4>
                <div class="help-examples">
                  <div class="help-example">Teacher ID (e.g., T001, MATH101)</div>
                  <div class="help-example">Title (what should I call this content?)</div>
                  <div class="help-example">Class (Grade 5, B.E, etc.)</div>
                  <div class="help-example">Subject (Math, Science, etc.)</div>
                  <div class="help-example">Content Type (notes, homework, assignment)</div>
                </div>
              </div>
              <div class="help-section">
                <h4 class="help-section-title">Example</h4>
                <div class="help-examples">
                  <div class="help-example">"Upload notes with teacher T001, title 'Algebra Basics', for Grade 5 Math class"</div>
                </div>
              </div>
              <div class="help-section">
                <h4 class="help-section-title">Quick Templates</h4>
                <div class="help-examples">
                  <div class="help-example">"Upload homework for B.E Data Science"</div>
                  <div class="help-example">"Add notes titled 'Physics Laws' for Grade 6"</div>
                </div>
              </div>
            </div>
            <div class="help-footer">What details can you share with me?</div>
          </div>
        `;
      } else {
        // Extract and create content
        let className = 'General';
        let subject = 'General';
        let contentType = 'notes';
        let teacherId = 'CHAT001';
        let title = 'New Content';
        
        // Smart extraction
        const teacherMatch = query.match(/teacher[\s:]+([a-zA-Z0-9]+)/i);
        if (teacherMatch) teacherId = teacherMatch[1];
        
        const titleMatch = query.match(/title[\s:]+["']?([^,"']+)["']?/i) || query.match(/["']([^"']+)["']/i);
        if (titleMatch) title = titleMatch[1].trim();
        
        if (query.includes('b.e')) className = 'B.E';
        if (query.includes('grade 5')) className = 'Grade 5';
        if (query.includes('grade 6')) className = 'Grade 6';
        
        if (query.includes('math')) subject = 'Math';
        if (query.includes('science')) subject = 'Science';
        if (query.includes('english')) subject = 'English';
        
        if (query.includes('homework')) contentType = 'homework';
        if (query.includes('assignment')) contentType = 'assignment';
        
        try {
          const newContent = {
            teacher_id: teacherId,
            class_name: className,
            subject: subject,
            content_type: contentType,
            title: title,
            description: 'Added via intelligent chat assistant'
          };
          
          const uploadResponse = await fetch('http://localhost:8082/schools/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newContent)
          });
          
          if (uploadResponse.ok) {
            response = formatSuccess('Success!', `Created "${title}" for ${className} ${subject}`);
          } else {
            response = formatError('Something went wrong. Could you repeat the details?');
          }
        } catch (err) {
          response = formatError(`Error: ${err.message}<br><br>Try rephrasing your request!`);
        }
      }
    }
    // SHOW CONTENT
    else {
      let filteredContent = allContent;
      
      // Filter by type
      if (query.includes('homework')) {
        filteredContent = allContent.filter(c => c.content_type.toLowerCase() === 'homework');
      } else if (query.includes('notes') || query.includes('note')) {
        filteredContent = allContent.filter(c => c.content_type.toLowerCase().includes('note'));
      } else if (query.includes('assignment')) {
        filteredContent = allContent.filter(c => c.content_type.toLowerCase() === 'assignment');
      } else if (query.includes('announcement')) {
        filteredContent = allContent.filter(c => c.content_type.toLowerCase() === 'announcement');
      }
      
      // Filter by date
      if (query.includes('november 5')) {
        filteredContent = filteredContent.filter(c => c.date_uploaded === '2025-11-05');
      } else if (query.includes('november 16')) {
        filteredContent = filteredContent.filter(c => c.date_uploaded === '2025-11-16');
      }
      
      // Filter by class
      if (query.includes('grade 5')) {
        filteredContent = filteredContent.filter(c => c.class_name.includes('Grade 5'));
      } else if (query.includes('grade 6')) {
        filteredContent = filteredContent.filter(c => c.class_name.includes('Grade 6'));
      } else if (query.includes('b.e')) {
        filteredContent = filteredContent.filter(c => c.class_name.includes('B.E'));
      }
      
      if (filteredContent.length > 0) {
        let contentType = 'content';
        
        if (query.includes('homework')) contentType = 'homework assignments';
        else if (query.includes('notes')) contentType = 'notes';
        else if (query.includes('announcement')) contentType = 'announcements';
        else if (query.includes('assignment')) contentType = 'assignments';
        
        response = `
          <div class="creative-header-section" style="margin-bottom: 1.5rem;">
            <div class="section-title">
              <i class="fas fa-search"></i>
              Found ${filteredContent.length} ${contentType}
            </div>
          </div>
          ${formatContentCards(filteredContent)}
        `;
      } else {
        const requestedType = query.includes('homework') ? 'homework' : 
                             query.includes('notes') ? 'notes' : 
                             query.includes('announcement') ? 'announcements' : 'content';
        
        response = `
          <div class="no-results">
            <div style="margin-bottom: 1rem;">I couldn't find any ${requestedType}</div>
            <div style="font-size: 0.9rem; color: #6B7280;">
              Try asking:<br>
              • "show homework"<br>
              • "show notes on November 5th"<br>
              • "show B.E assignments"<br><br>
              Or I can help you add new content!
            </div>
          </div>
        `;
      }
    }

    appendMessage({ parts: [{ text: response }] }, "model");
  } catch (err) {
    appendMessage({ parts: [{ text: formatError(`Error: ${err.message}`) }] }, "model");
  } finally {
    setSending(false);
  }
}

// Form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  input.value = "";
  await sendMessage(text);
});
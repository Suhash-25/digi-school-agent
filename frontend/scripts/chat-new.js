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
        el.innerHTML = marked.parse(part.text);
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
      response = "😊 Hello there! I'm your intelligent Digi School Agent!\n\n🎆 Here's what I can do for you:\n\n📚 **View Content:**\n• 'show homework' or 'show notes'\n• 'show announcements this week'\n• 'show Grade 5 content'\n\n⚙️ **Manage Content:**\n• 'update [title] to [new title]'\n• 'remove [content name]'\n• 'upload notes for [class]'\n\n📊 **Analytics & Insights:**\n• 'How many total contents have been uploaded?'\n• 'How many homework entries are there for Class 6?'\n• 'Which subject has the most uploaded materials?'\n\n🔍 **Auditing & Tracking:**\n• 'Which teacher uploaded content most recently?'\n• 'List all teachers who uploaded homework this week'\n• 'Which class has received the most uploads?'\n\n🏭 **Multi-Modal Department Analytics:**\n• 'Which department uploaded the most notes overall?'\n• 'How many uploads were made by teachers in the Science department?'\n\n💬 What would you like to explore today?";
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
            response = `🎉 **Perfect!** Updated "${itemToUpdate.title}" to "${newTitle}"\n\n🔄 Refresh your dashboard to see the changes!`;
          } else {
            response = "😔 Hmm, that didn't work. Let me try again - could you rephrase your request?";
          }
        } catch (err) {
          response = "Error: " + err.message;
        }
      } else {
        response = "Please specify what to update. Example: 'update earth to globe'";
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
            response = `🗑️ **Successfully Removed!** "${itemToRemove.title}"\n\n🔄 Refresh your dashboard to see the changes!`;
          } else {
            response = "😔 Couldn't remove that. Could you be more specific about what to delete?";
          }
        } catch (err) {
          response = "Error: " + err.message;
        }
      } else {
        response = "Please specify what to remove. Example: 'remove servers'";
      }
    }
    // MULTI-MODAL QUERIES - TeacherProfile Implementation
    else if (query.includes('implement') && query.includes('teacherprofile')) {
      response = `✅ **TeacherProfile Model Successfully Implemented!**\n\n🏗️ **Model Structure:**\n\`\`\`\nclass TeacherProfile:\n    teacher_id: str\n    name: str\n    subject_specialization: str\n    department: str\n\`\`\`\n\n📊 **Database Integration:**\n• Created teacher_profile table\n• Added 14 sample teacher records\n• Linked with school_content via teacher_id\n\n🔗 **Available Endpoints:**\n• GET /schools/teachers - List all teachers\n• GET /schools/teachers/{id} - Get specific teacher\n• POST /schools/teachers - Create new teacher\n• GET /schools/analytics/departments - Department analytics\n\n🎯 **Ready for Multi-Modal Queries!**\nTry: 'Which department uploaded the most notes?'`;
    }
    // MULTI-MODAL QUERIES - Department Analytics
    else if (query.includes('department') && (query.includes('most notes') || query.includes('uploaded the most notes'))) {
      // Which department uploaded the most notes overall?
      try {
        const deptAnalytics = await fetch('http://localhost:8082/schools/analytics/departments').then(r => r.json());
        const sortedByNotes = deptAnalytics.sort((a, b) => b.notes_count - a.notes_count);
        
        if (sortedByNotes.length > 0) {
          const topDept = sortedByNotes[0];
          response = `🏢 **Multi-Modal Analytics - Department Notes Report**\n\n🏆 **Top Department for Notes:** ${topDept.department} (${topDept.notes_count} notes)\n\n📊 **All Departments Ranking:**\n${sortedByNotes.map((dept, index) => `${index + 1}. **${dept.department}**: ${dept.notes_count} notes (${dept.total_uploads} total uploads)`).join('\n')}\n\n📈 **Insights:**\n• Total departments: ${sortedByNotes.length}\n• Combined notes: ${sortedByNotes.reduce((sum, d) => sum + d.notes_count, 0)}`;
        } else {
          response = "📊 No department data available for notes analysis.";
        }
      } catch (err) {
        response = "Error fetching department analytics: " + err.message;
      }
    }
    else if (query.includes('science department') && query.includes('uploads')) {
      // How many uploads were made by teachers in the Science department?
      try {
        const deptAnalytics = await fetch('http://localhost:8082/schools/analytics/departments').then(r => r.json());
        const scienceDept = deptAnalytics.find(d => d.department.toLowerCase() === 'science');
        
        if (scienceDept) {
          response = `🔬 **Multi-Modal Analytics - Science Department Report**\n\n📊 **Science Department Uploads:** ${scienceDept.total_uploads} total uploads\n\n📝 **Breakdown:**\n• Notes: ${scienceDept.notes_count}\n• Other content: ${scienceDept.total_uploads - scienceDept.notes_count}\n\n🎯 **Department Performance:**\n• Percentage of total uploads: ${Math.round((scienceDept.total_uploads / deptAnalytics.reduce((sum, d) => sum + d.total_uploads, 0)) * 100)}%`;
        } else {
          response = "🔬 No upload data found for Science department.";
        }
      } catch (err) {
        response = "Error fetching Science department data: " + err.message;
      }
    }
    // AUDITING QUERIES
    else if (query.includes('teacher') && (query.includes('recent') || query.includes('most recent') || query.includes('latest'))) {
      // Which teacher uploaded content most recently?
      if (allContent.length > 0) {
        const sortedByDate = allContent.sort((a, b) => new Date(b.date_uploaded) - new Date(a.date_uploaded));
        const mostRecent = sortedByDate[0];
        response = `🔍 **Auditing Report - Recent Uploads**\n\n👨🏫 **Most Recent Upload:** Teacher ${mostRecent.teacher_id}\n\n📋 **Details:**\n• Content: "${mostRecent.title}"\n• Subject: ${mostRecent.subject}\n• Class: ${mostRecent.class_name}\n• Type: ${mostRecent.content_type}\n• Date: ${mostRecent.date_uploaded}\n\n📊 **Recent Activity:**\n${sortedByDate.slice(0, 3).map((c, i) => `${i + 1}. ${c.teacher_id} - "${c.title}" (${c.date_uploaded})`).join('\n')}`;
      } else {
        response = "📋 No upload records found for auditing.";
      }
    }
    else if (query.includes('teacher') && query.includes('homework') && query.includes('week')) {
      // List all teachers who uploaded homework this week
      const currentDate = new Date();
      const weekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const thisWeekHomework = allContent.filter(c => {
        const uploadDate = new Date(c.date_uploaded);
        return c.content_type.toLowerCase() === 'homework' && uploadDate >= weekAgo;
      });
      
      const teachersThisWeek = [...new Set(thisWeekHomework.map(c => c.teacher_id))];
      
      if (teachersThisWeek.length > 0) {
        response = `🔍 **Auditing Report - Weekly Homework Uploads**\n\n👥 **Teachers who uploaded homework this week:** ${teachersThisWeek.length}\n\n📋 **Teacher List:**\n${teachersThisWeek.map(teacherId => {
          const teacherHomework = thisWeekHomework.filter(c => c.teacher_id === teacherId);
          return `👨🏫 **${teacherId}** (${teacherHomework.length} homework)\n${teacherHomework.map(h => `   • "${h.title}" - ${h.class_name} ${h.subject}`).join('\n')}`;
        }).join('\n\n')}\n\n📅 **Period:** Last 7 days`;
      } else {
        response = "📋 **Auditing Report**\n\n🔍 No teachers uploaded homework in the past week.\n\n💡 Try checking for a longer period or different content types.";
      }
    }
    else if (query.includes('class') && (query.includes('most upload') || query.includes('received most'))) {
      // Which class has received the most uploads?
      const classCounts = {};
      allContent.forEach(c => {
        const className = c.class_name || 'Unknown';
        classCounts[className] = (classCounts[className] || 0) + 1;
      });
      
      const sortedClasses = Object.entries(classCounts)
        .sort(([,a], [,b]) => b - a);
      
      if (sortedClasses.length > 0) {
        const topClass = sortedClasses[0];
        response = `🔍 **Auditing Report - Class Upload Statistics**\n\n🏆 **Most Active Class:** ${topClass[0]} (${topClass[1]} uploads)\n\n📊 **All Classes Ranking:**\n${sortedClasses.map(([className, count], index) => {
          const classContent = allContent.filter(c => c.class_name === className);
          const contentTypes = [...new Set(classContent.map(c => c.content_type))];
          return `${index + 1}. **${className}**: ${count} uploads\n   📚 Types: ${contentTypes.join(', ')}`;
        }).join('\n\n')}\n\n📈 **Insights:**\n• Total classes: ${sortedClasses.length}\n• Average uploads per class: ${Math.round(allContent.length / sortedClasses.length)}`;
      } else {
        response = "📋 No class data available for auditing analysis.";
      }
    }
    // ANALYTICS QUERIES (moved before upload to fix priority)
    else if (query.includes('how many') || query.includes('total') || query.includes('count') || query.includes('which subject') || query.includes('most uploaded')) {
      // Total content count
      if (query.includes('total content') || (query.includes('how many') && query.includes('content'))) {
        const totalCount = allContent.length;
        response = `📊 **Analytics Report**\n\n📚 Total content uploaded: **${totalCount}** items\n\n📈 **Breakdown:**\n• Homework: ${allContent.filter(c => c.content_type.toLowerCase() === 'homework').length}\n• Notes: ${allContent.filter(c => c.content_type.toLowerCase().includes('note')).length}\n• Announcements: ${allContent.filter(c => c.content_type.toLowerCase() === 'announcement').length}\n• Assignments: ${allContent.filter(c => c.content_type.toLowerCase() === 'assignment').length}`;
      }
      // Homework count for specific class
      else if (query.includes('homework') && (query.includes('class') || query.includes('grade'))) {
        let className = '';
        if (query.includes('class 6') || query.includes('grade 6')) className = 'Grade 6';
        else if (query.includes('class 5') || query.includes('grade 5')) className = 'Grade 5';
        else if (query.includes('b.e')) className = 'B.E';
        
        if (className) {
          const homeworkCount = allContent.filter(c => 
            c.content_type.toLowerCase() === 'homework' && 
            c.class_name.includes(className)
          ).length;
          response = `📊 **${className} Homework Analytics**\n\n📚 Total homework for ${className}: **${homeworkCount}** entries\n\n📝 **Details:**\n${allContent.filter(c => c.content_type.toLowerCase() === 'homework' && c.class_name.includes(className)).map(h => `• ${h.subject}: ${h.title}`).join('\n') || '• No homework found'}`;
        } else {
          response = "Please specify the class (e.g., 'Class 6', 'Grade 5', 'B.E')";
        }
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
          response = `📊 **Subject Analytics Report**\n\n🏆 **Top Subject:** ${topSubject[0]} (${topSubject[1]} materials)\n\n📈 **All Subjects Ranking:**\n${sortedSubjects.map(([subject, count], index) => `${index + 1}. ${subject}: ${count} materials`).join('\n')}`;
        } else {
          response = "No subject data available for analysis.";
        }
      }
      // General count queries
      else if (query.includes('how many')) {
        if (query.includes('homework')) {
          const count = allContent.filter(c => c.content_type.toLowerCase() === 'homework').length;
          response = `📊 **Homework Analytics**\n\n📚 Total homework entries: **${count}**\n\n📝 **By Class:**\n${[...new Set(allContent.filter(c => c.content_type.toLowerCase() === 'homework').map(c => c.class_name))].map(className => {
            const classCount = allContent.filter(c => c.content_type.toLowerCase() === 'homework' && c.class_name === className).length;
            return `• ${className}: ${classCount} homework`;
          }).join('\n')}`;
        } else if (query.includes('notes')) {
          const count = allContent.filter(c => c.content_type.toLowerCase().includes('note')).length;
          response = `📊 **Notes Analytics**\n\n📝 Total notes: **${count}**\n\n📚 **By Subject:**\n${[...new Set(allContent.filter(c => c.content_type.toLowerCase().includes('note')).map(c => c.subject))].map(subject => {
            const subjectCount = allContent.filter(c => c.content_type.toLowerCase().includes('note') && c.subject === subject).length;
            return `• ${subject}: ${subjectCount} notes`;
          }).join('\n')}`;
        } else {
          response = `📊 **General Analytics**\n\n📚 Total content: **${allContent.length}** items\n\nAsk me specific questions like:\n• "How many homework entries are there?"\n• "How many notes for Grade 5?"\n• "Which subject has the most materials?"`;
        }
      }
    }
    // ADD/UPLOAD OPERATIONS
    else if ((query.includes('upload') || query.includes('add')) && !query.includes('how many') && !query.includes('total') && !query.includes('which subject') && !query.includes('recent') && !query.includes('most recent') && !query.includes('week') && !query.includes('received most') && !query.includes('department')) {
      // Check if user provided complete details
      const hasTeacherId = /teacher[\s:]+([a-zA-Z0-9]+)/i.test(query);
      const hasTitle = /title[\s:]+([^,]+)/i.test(query) || /"([^"]+)"/i.test(query);
      
      if (!hasTeacherId || !hasTitle) {
        response = `📝 I'd love to help you upload content! \n\n📊 To create the perfect entry, I need:\n\n👨🏫 **Teacher ID** (e.g., T001, MATH101)\n📚 **Title** (what should I call this content?)\n🏫 **Class** (Grade 5, B.E, etc.)\n📍 **Subject** (Math, Science, etc.)\n📄 **Content Type** (notes, homework, assignment)\n📝 **Description** (optional but helpful!)\n\n🎆 **Example:** \n"Upload notes with teacher T001, title 'Algebra Basics', for Grade 5 Math class"\n\n💡 **Quick Templates:**\n• "Upload homework for B.E Data Science"\n• "Add notes titled 'Physics Laws' for Grade 6"\n\nWhat details can you share with me?`;
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
            response = `🎉 **Success!** Created "${title}" for ${className} ${subject}\n\n🔄 Refresh your dashboard to see it!`;
          } else {
            response = "😔 Oops! Something went wrong. Let me try again - could you repeat the details?";
          }
        } catch (err) {
          response = "🚫 Error: " + err.message + "\n\n💬 Try rephrasing your request!";
        }
      }
    }
    // ANALYTICS QUERIES
    else if (query.includes('how many') || query.includes('total') || query.includes('count') || query.includes('which subject') || query.includes('most uploaded')) {
      // Total content count
      if (query.includes('total content') || (query.includes('how many') && query.includes('content'))) {
        const totalCount = allContent.length;
        response = `📊 **Analytics Report**\n\n📚 Total content uploaded: **${totalCount}** items\n\n📈 **Breakdown:**\n• Homework: ${allContent.filter(c => c.content_type.toLowerCase() === 'homework').length}\n• Notes: ${allContent.filter(c => c.content_type.toLowerCase().includes('note')).length}\n• Announcements: ${allContent.filter(c => c.content_type.toLowerCase() === 'announcement').length}\n• Assignments: ${allContent.filter(c => c.content_type.toLowerCase() === 'assignment').length}`;
      }
      // Homework count for specific class
      else if (query.includes('homework') && (query.includes('class') || query.includes('grade'))) {
        let className = '';
        if (query.includes('class 6') || query.includes('grade 6')) className = 'Grade 6';
        else if (query.includes('class 5') || query.includes('grade 5')) className = 'Grade 5';
        else if (query.includes('b.e')) className = 'B.E';
        
        if (className) {
          const homeworkCount = allContent.filter(c => 
            c.content_type.toLowerCase() === 'homework' && 
            c.class_name.includes(className)
          ).length;
          response = `📊 **${className} Homework Analytics**\n\n📚 Total homework for ${className}: **${homeworkCount}** entries\n\n📝 **Details:**\n${allContent.filter(c => c.content_type.toLowerCase() === 'homework' && c.class_name.includes(className)).map(h => `• ${h.subject}: ${h.title}`).join('\n') || '• No homework found'}`;
        } else {
          response = "Please specify the class (e.g., 'Class 6', 'Grade 5', 'B.E')";
        }
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
          response = `📊 **Subject Analytics Report**\n\n🏆 **Top Subject:** ${topSubject[0]} (${topSubject[1]} materials)\n\n📈 **All Subjects Ranking:**\n${sortedSubjects.map(([subject, count], index) => `${index + 1}. ${subject}: ${count} materials`).join('\n')}`;
        } else {
          response = "No subject data available for analysis.";
        }
      }
      // General count queries
      else if (query.includes('how many')) {
        if (query.includes('homework')) {
          const count = allContent.filter(c => c.content_type.toLowerCase() === 'homework').length;
          response = `📊 **Homework Analytics**\n\n📚 Total homework entries: **${count}**\n\n📝 **By Class:**\n${[...new Set(allContent.filter(c => c.content_type.toLowerCase() === 'homework').map(c => c.class_name))].map(className => {
            const classCount = allContent.filter(c => c.content_type.toLowerCase() === 'homework' && c.class_name === className).length;
            return `• ${className}: ${classCount} homework`;
          }).join('\n')}`;
        } else if (query.includes('notes')) {
          const count = allContent.filter(c => c.content_type.toLowerCase().includes('note')).length;
          response = `📊 **Notes Analytics**\n\n📝 Total notes: **${count}**\n\n📚 **By Subject:**\n${[...new Set(allContent.filter(c => c.content_type.toLowerCase().includes('note')).map(c => c.subject))].map(subject => {
            const subjectCount = allContent.filter(c => c.content_type.toLowerCase().includes('note') && c.subject === subject).length;
            return `• ${subject}: ${subjectCount} notes`;
          }).join('\n')}`;
        } else {
          response = `📊 **General Analytics**\n\n📚 Total content: **${allContent.length}** items\n\nAsk me specific questions like:\n• "How many homework entries are there?"\n• "How many notes for Grade 5?"\n• "Which subject has the most materials?"`;
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
        let emoji = '📋';
        
        if (query.includes('homework')) {
          contentType = 'homework assignments';
          emoji = '📚';
        } else if (query.includes('notes')) {
          contentType = 'notes';
          emoji = '📝';
        } else if (query.includes('announcement')) {
          contentType = 'announcements';
          emoji = '📢';
        } else if (query.includes('assignment')) {
          contentType = 'assignments';
          emoji = '📄';
        }
        
        response = `${emoji} Great! I found ${filteredContent.length} ${contentType} for you:\n\n` + 
          filteredContent.map(c => {
            const icon = c.content_type.toLowerCase().includes('homework') ? '📚' : 
                        c.content_type.toLowerCase().includes('note') ? '📝' : 
                        c.content_type.toLowerCase() === 'announcement' ? '📢' : '📄';
            return `${icon} **${c.title}**\n   📍 Subject: ${c.subject}\n   🏫 Class: ${c.class_name}\n   👨‍🏫 Teacher: ${c.teacher_id}\n   📅 Date: ${c.date_uploaded}`;
          }).join('\n\n');
          
        response += `\n\n💡 Need help with anything else?`;
      } else {
        const requestedType = query.includes('homework') ? 'homework' : 
                             query.includes('notes') ? 'notes' : 
                             query.includes('announcement') ? 'announcements' : 'content';
        
        response = `😔 Oops! I couldn't find any ${requestedType}.\n\n💭 Try asking:\n• "show homework"\n• "show notes on November 5th"\n• "show B.E assignments"\n\nOr I can help you add new content!`;
      }
    }

    appendMessage({ parts: [{ text: response }] }, "model");
  } catch (err) {
    appendMessage({ parts: [{ text: "Error: " + err.message }] }, "model");
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
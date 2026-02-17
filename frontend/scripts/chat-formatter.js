// Format content items as structured cards
function formatContentCards(items) {
  if (!items || items.length === 0) {
    return `<div class="no-results">No content found</div>`;
  }
  
  return `
    <div class="content-grid">
      ${items.map(item => `
        <div class="content-card">
          <div class="content-header">
            <h3 class="content-title">${item.title}</h3>
            <span class="content-type">${item.content_type}</span>
          </div>
          <div class="content-meta">
            <div class="meta-row">
              <span class="meta-label">Subject</span>
              <span class="meta-value">${item.subject}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Class</span>
              <span class="meta-value">${item.class_name}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Teacher</span>
              <span class="meta-value">${item.teacher_id}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Date</span>
              <span class="meta-value">${item.date_uploaded}</span>
            </div>
          </div>
          <div class="content-description">${item.description}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// Format analytics data
function formatAnalytics(data) {
  if (!data) return `<div class="no-results">No analytics data available</div>`;
  
  let result = `<div class="analytics-container">`;
  result += `<div class="analytics-header">Analytics Report</div>`;
  
  if (data.total_count !== undefined) {
    result += `<div class="stat-card"><span class="stat-label">Total Count</span><span class="stat-value">${data.total_count}</span></div>`;
  }
  
  if (data.breakdown) {
    result += `<div class="stats-section"><h4 class="section-title">Content Breakdown</h4>`;
    Object.entries(data.breakdown).forEach(([key, value]) => {
      result += `<div class="stat-item"><span>${key}</span><span class="count">${value}</span></div>`;
    });
    result += `</div>`;
  }
  
  if (data.subject_stats && data.subject_stats.length > 0) {
    result += `<div class="stats-section"><h4 class="section-title">Subject Statistics</h4>`;
    data.subject_stats.forEach(stat => {
      result += `<div class="stat-item"><span>${stat.subject}</span><span class="count">${stat.count}</span></div>`;
    });
    result += `</div>`;
  }
  
  result += `</div>`;
  return result;
}

// Format success message
function formatSuccess(message, details = '') {
  return `
    <div style="background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534; padding: 1rem; border-radius: 8px; text-align: center;">
      <div style="font-weight: 600; margin-bottom: 0.5rem;">${message}</div>
      ${details ? `<div>${details}</div>` : ''}
      <div style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.8;">Refresh your dashboard to see the changes</div>
    </div>
  `;
}

// Format error message
function formatError(message) {
  return `<div class="error-card">${message}</div>`;
}

// Format greeting
function formatGreeting() {
  return `
    <div class="greeting-card">
      <div class="greeting-header">Hello! I'm your intelligent Digi School Agent</div>
      <div class="capabilities-list">
        <div class="capability-item">
          <span class="capability-icon">📚</span>
          <span>View and manage school content (homework, notes, announcements)</span>
        </div>
        <div class="capability-item">
          <span class="capability-icon">📊</span>
          <span>Analytics and insights on content statistics</span>
        </div>
        <div class="capability-item">
          <span class="capability-icon">🔍</span>
          <span>Auditing and tracking teacher activities</span>
        </div>
        <div class="capability-item">
          <span class="capability-icon">🏫</span>
          <span>Multi-modal department analytics</span>
        </div>
      </div>
      <div class="greeting-footer">What would you like to explore today?</div>
    </div>
  `;
}

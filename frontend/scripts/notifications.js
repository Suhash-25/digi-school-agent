// Smart Notifications System
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.init();
    }

    init() {
        this.createNotificationContainer();
        this.startRealTimeMonitoring();
        this.showWelcomeNotification();
    }

    createNotificationContainer() {
        if (document.getElementById('notification-container')) return;
        
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);

        // Add notification styles
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            }
            .notification {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 1rem;
                margin-bottom: 10px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                transform: translateX(100%);
                animation: slideIn 0.3s ease forwards;
                position: relative;
                overflow: hidden;
            }
            .notification::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 4px;
                height: 100%;
                background: #fff;
            }
            .notification.success::before { background: #4CAF50; }
            .notification.warning::before { background: #FF9800; }
            .notification.error::before { background: #F44336; }
            .notification.info::before { background: #2196F3; }
            
            .notification-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }
            .notification-title {
                font-weight: bold;
                font-size: 1rem;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 1.2rem;
                opacity: 0.7;
            }
            .notification-close:hover { opacity: 1; }
            
            .notification-body {
                font-size: 0.9rem;
                line-height: 1.4;
            }
            .notification-time {
                font-size: 0.8rem;
                opacity: 0.8;
                margin-top: 0.5rem;
            }
            
            @keyframes slideIn {
                to { transform: translateX(0); }
            }
            @keyframes slideOut {
                to { transform: translateX(100%); }
            }
            
            .notification-bell {
                position: fixed;
                top: 20px;
                right: 430px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                z-index: 9999;
                transition: transform 0.2s ease;
            }
            .notification-bell:hover {
                transform: scale(1.1);
            }
            .notification-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #FF4444;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 0.8rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
        document.head.appendChild(style);

        // Add notification bell
        const bell = document.createElement('button');
        bell.className = 'notification-bell';
        bell.innerHTML = '<i class="fa-solid fa-bell"></i><span class="notification-badge" id="notification-count">0</span>';
        bell.onclick = () => this.showNotificationHistory();
        document.body.appendChild(bell);
    }

    show(title, message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now(),
            title,
            message,
            type,
            timestamp: new Date()
        };

        this.notifications.unshift(notification);
        this.updateBadgeCount();

        const container = document.getElementById('notification-container');
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification ${type}`;
        notificationEl.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">
                    <i class="fa-solid fa-${this.getIcon(type)}"></i> ${title}
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="notification-body">${message}</div>
            <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
        `;

        container.appendChild(notificationEl);

        // Auto remove after duration
        setTimeout(() => {
            if (notificationEl.parentNode) {
                notificationEl.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => notificationEl.remove(), 300);
            }
        }, duration);

        return notification;
    }

    getIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle',
            info: 'info-circle'
        };
        return icons[type] || 'bell';
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    updateBadgeCount() {
        const badge = document.getElementById('notification-count');
        if (badge) {
            badge.textContent = this.notifications.length;
            badge.style.display = this.notifications.length > 0 ? 'flex' : 'none';
        }
    }

    showWelcomeNotification() {
        setTimeout(() => {
            this.show(
                'Welcome to Digi School Hub!',
                'Your intelligent school management system is ready. All 5 challenges are active!',
                'success',
                7000
            );
        }, 1000);
    }

    startRealTimeMonitoring() {
        // Monitor for new content
        setInterval(async () => {
            try {
                const response = await fetch('http://localhost:8082/schools/');
                const content = await response.json();
                
                // Check for new uploads (simplified check)
                if (content.length > this.lastContentCount) {
                    this.show(
                        'New Content Added!',
                        `${content.length - (this.lastContentCount || 0)} new items uploaded`,
                        'info'
                    );
                }
                this.lastContentCount = content.length;
            } catch (error) {
                // Silent fail for demo
            }
        }, 30000); // Check every 30 seconds

        // System status notifications
        this.monitorSystemHealth();
    }

    monitorSystemHealth() {
        setInterval(async () => {
            try {
                const start = Date.now();
                await fetch('http://localhost:8082/schools/');
                const responseTime = Date.now() - start;
                
                if (responseTime > 2000) {
                    this.show(
                        'System Performance',
                        'Backend response time is slower than usual',
                        'warning'
                    );
                }
            } catch (error) {
                this.show(
                    'Connection Issue',
                    'Unable to connect to backend server',
                    'error'
                );
            }
        }, 60000); // Check every minute
    }

    showNotificationHistory() {
        // Create modal for notification history
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 10001; display: flex;
            align-items: center; justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 10px; max-width: 500px; max-height: 70vh; overflow-y: auto;">
                <h3>Notification History</h3>
                <div id="notification-history">
                    ${this.notifications.map(n => `
                        <div style="padding: 1rem; border-bottom: 1px solid #eee;">
                            <strong>${n.title}</strong><br>
                            <small>${n.message}</small><br>
                            <small style="color: #666;">${n.timestamp.toLocaleString()}</small>
                        </div>
                    `).join('')}
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="margin-top: 1rem; padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 5px;">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    // Public methods for integration
    success(title, message) { return this.show(title, message, 'success'); }
    warning(title, message) { return this.show(title, message, 'warning'); }
    error(title, message) { return this.show(title, message, 'error'); }
    info(title, message) { return this.show(title, message, 'info'); }
}

// Initialize notification system
const notifications = new NotificationSystem();

// Make it globally available
window.showNotification = (title, message, type) => notifications.show(title, message, type);
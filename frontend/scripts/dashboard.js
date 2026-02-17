document.addEventListener('DOMContentLoaded', () => {
    console.log("Dashboard: Initializing...");
    fetchDashboardData();

    // Optional: Auto-refresh data every 60 seconds
    setInterval(fetchDashboardData, 60000);
});

async function fetchDashboardData() {
    try {
        // 1. Fetch data from your new Python Backend
        const response = await fetch('http://localhost:8000/dashboard/stats');
        const data = await response.json();

        // 2. Update Greeting & User Info
        updateHeader(data);

        // 3. Update the "Next Class" Widget
        updateNextClass(data.next_class);

        // 4. Update the "Assignments" Widget
        updateAssignments(data.assignments);

        // 5. Update the Chart (Visuals)
        updateChart(data.stats);

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    }
}

function updateHeader(data) {
    const headerTitle = document.querySelector('.header-text h1');
    if (headerTitle) {
        headerTitle.innerHTML = `${data.greeting}, ${data.user_name}! 👋`;
    }
}

function updateNextClass(nextClass) {
    // Select elements (Assumes standard structure from previous HTML)
    const container = document.querySelector('.card:nth-child(3)'); 
    if (container) {
        container.querySelector('h2').textContent = nextClass.subject;
        container.querySelector('p:nth-of-type(1)').textContent = nextClass.time;
        container.querySelector('p:nth-of-type(2)').innerHTML = `<i class="fas fa-video"></i> ${nextClass.room}`;
    }
}

function updateAssignments(assignments) {
    const list = document.querySelector('.card:nth-child(4) ul');
    if (list) {
        list.innerHTML = ''; // Clear current static list
        assignments.forEach(task => {
            const color = task.status === 'urgent' ? '#ff6b6b' : 'var(--accent-color)';
            const bg = task.status === 'urgent' ? 'rgba(255,107,107,0.1)' : 'rgba(0, 210, 255, 0.1)';
            
            const li = document.createElement('li');
            li.style.cssText = "display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--glass-border);";
            li.innerHTML = `
                <span>${task.title}</span>
                <span style="color: ${color}; font-size: 0.85rem; background: ${bg}; padding: 2px 8px; border-radius: 4px;">${task.due}</span>
            `;
            list.appendChild(li);
        });
    }
}

// Global Chart Instance to allow updating
let progressChartInstance = null;

function updateChart(stats) {
    const ctx = document.getElementById('progressChart').getContext('2d');

    // If chart exists, destroy it before creating new one to avoid glitches
    if (progressChartInstance) {
        progressChartInstance.destroy();
    }

    progressChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'To Do'],
            datasets: [{
                data: [stats.completed, stats.in_progress, stats.todo],
                backgroundColor: [
                    'rgba(0, 210, 255, 0.8)',   // Cyan
                    'rgba(255, 154, 158, 0.8)', // Pink
                    'rgba(255, 255, 255, 0.1)'  // Faded
                ],
                borderColor: 'transparent',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateScale: true,
                animateRotate: true
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    bodyFont: { family: 'Poppins' }
                }
            },
            cutout: '75%'
        }
    });
}
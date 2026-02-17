// Advanced Analytics with Chart.js
class AdvancedAnalytics {
    constructor() {
        this.charts = {};
        this.loadChartJS();
    }

    loadChartJS() {
        if (!document.getElementById('chartjs-script')) {
            const script = document.createElement('script');
            script.id = 'chartjs-script';
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => this.initializeCharts();
            document.head.appendChild(script);
        }
    }

    async initializeCharts() {
        const data = await this.fetchAnalyticsData();
        this.createContentTypeChart(data);
        this.createSubjectChart(data);
        this.createTeacherProductivityChart(data);
        this.createUploadTrendsChart(data);
    }

    async fetchAnalyticsData() {
        try {
            const [content, teachers, departments] = await Promise.all([
                fetch('http://localhost:8082/schools/').then(r => r.json()),
                fetch('http://localhost:8082/schools/teachers').then(r => r.json()),
                fetch('http://localhost:8082/schools/analytics/departments').then(r => r.json())
            ]);
            return { content, teachers, departments };
        } catch (error) {
            console.error('Analytics data fetch error:', error);
            return { content: [], teachers: [], departments: [] };
        }
    }

    createContentTypeChart(data) {
        const ctx = document.getElementById('contentTypeChart');
        if (!ctx) return;

        const contentTypes = {};
        data.content.forEach(item => {
            contentTypes[item.content_type] = (contentTypes[item.content_type] || 0) + 1;
        });

        this.charts.contentType = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(contentTypes),
                datasets: [{
                    data: Object.values(contentTypes),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Content Distribution' }
                }
            }
        });
    }

    createSubjectChart(data) {
        const ctx = document.getElementById('subjectChart');
        if (!ctx) return;

        const subjects = {};
        data.content.forEach(item => {
            subjects[item.subject] = (subjects[item.subject] || 0) + 1;
        });

        const sortedSubjects = Object.entries(subjects)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6);

        this.charts.subject = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedSubjects.map(([subject]) => subject),
                datasets: [{
                    label: 'Content Count',
                    data: sortedSubjects.map(([,count]) => count),
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Subject Popularity' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    createTeacherProductivityChart(data) {
        const ctx = document.getElementById('teacherChart');
        if (!ctx) return;

        const teacherCounts = {};
        data.content.forEach(item => {
            teacherCounts[item.teacher_id] = (teacherCounts[item.teacher_id] || 0) + 1;
        });

        const topTeachers = Object.entries(teacherCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        this.charts.teacher = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: topTeachers.map(([teacher]) => teacher),
                datasets: [{
                    label: 'Uploads',
                    data: topTeachers.map(([,count]) => count),
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Top 5 Most Active Teachers' }
                },
                scales: {
                    x: { beginAtZero: true }
                }
            }
        });
    }

    createUploadTrendsChart(data) {
        const ctx = document.getElementById('trendsChart');
        if (!ctx) return;

        const dateCounts = {};
        data.content.forEach(item => {
            dateCounts[item.date_uploaded] = (dateCounts[item.date_uploaded] || 0) + 1;
        });

        const sortedDates = Object.entries(dateCounts).sort();

        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDates.map(([date]) => date),
                datasets: [{
                    label: 'Daily Uploads',
                    data: sortedDates.map(([,count]) => count),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Upload Trends Over Time' }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    refreshCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.initializeCharts();
    }
}

// Initialize analytics
const analytics = new AdvancedAnalytics();
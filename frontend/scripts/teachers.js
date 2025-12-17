// Teacher Management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const addTeacherBtn = document.getElementById('addTeacherBtn');
    const viewTeachersBtn = document.getElementById('viewTeachersBtn');
    const teacherModal = document.getElementById('teacherModal');
    const teacherForm = document.getElementById('teacherForm');
    const closeTeacherModalBtn = document.getElementById('closeTeacherModalBtn');
    const teachersList = document.getElementById('teachersList');
    const contentList = document.getElementById('contentList');

    // Add Teacher Button
    addTeacherBtn.addEventListener('click', () => {
        teacherModal.style.display = 'block';
        document.getElementById('teacherModalTitle').textContent = 'Add New Teacher';
        teacherForm.reset();
    });

    // Close Teacher Modal
    closeTeacherModalBtn.addEventListener('click', () => {
        teacherModal.style.display = 'none';
    });

    // View Teachers Button
    viewTeachersBtn.addEventListener('click', () => {
        if (teachersList.style.display === 'none') {
            loadTeachers();
            teachersList.style.display = 'block';
            contentList.style.display = 'none';
            viewTeachersBtn.innerHTML = '<i class="fa-solid fa-layer-group"></i> <span>View Content</span>';
        } else {
            teachersList.style.display = 'none';
            contentList.style.display = 'block';
            viewTeachersBtn.innerHTML = '<i class="fa-solid fa-users"></i> <span>View Teachers</span>';
        }
    });

    // Teacher Form Submit
    teacherForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(teacherForm);
        const teacherData = {
            teacher_id: formData.get('teacher_id'),
            name: formData.get('name'),
            subject_specialization: formData.get('subject_specialization'),
            department: formData.get('department')
        };

        try {
            const response = await fetch('http://localhost:8082/schools/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teacherData)
            });

            if (response.ok) {
                teacherModal.style.display = 'none';
                alert('Teacher added successfully!');
                if (teachersList.style.display !== 'none') {
                    loadTeachers();
                }
            } else {
                alert('Error adding teacher');
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });

    // Load Teachers
    async function loadTeachers() {
        try {
            const response = await fetch('http://localhost:8082/schools/teachers');
            const teachers = await response.json();
            
            teachersList.innerHTML = '';
            
            if (teachers.length === 0) {
                teachersList.innerHTML = '<p class="no-content">No teachers found.</p>';
                return;
            }

            teachers.forEach(teacher => {
                const teacherCard = document.createElement('div');
                teacherCard.className = 'content-card teacher-card';
                teacherCard.innerHTML = `
                    <div class="card-header">
                        <h3><i class="fa-solid fa-user"></i> ${teacher.name}</h3>
                        <span class="content-type teacher-badge">${teacher.department}</span>
                    </div>
                    <div class="card-body">
                        <p><strong>ID:</strong> ${teacher.teacher_id}</p>
                        <p><strong>Specialization:</strong> ${teacher.subject_specialization}</p>
                        <p><strong>Department:</strong> ${teacher.department}</p>
                    </div>
                `;
                teachersList.appendChild(teacherCard);
            });
        } catch (error) {
            teachersList.innerHTML = '<p class="error">Error loading teachers: ' + error.message + '</p>';
        }
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === teacherModal) {
            teacherModal.style.display = 'none';
        }
    });
});
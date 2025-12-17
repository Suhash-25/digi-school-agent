import sqlite3
import json
from datetime import date
from typing import List, Optional
from models.data_model import SchoolContent, TeacherProfile

class SQLiteDB:
    """Simple synchronous SQLite helper for DigiSchoolAgent with auto-increment ID."""

    def __init__(self, db_path: str = "digischool.db"):
        self.db_path = db_path
        self._init_tables()

    def connect(self):
        """Create a SQLite connection with row access by column names."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def _init_tables(self):
        """Initialize the school_content and teacher_profile tables."""
        with self.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS school_content (
                    content_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    teacher_id TEXT NOT NULL,
                    class_name TEXT NOT NULL,
                    subject TEXT,
                    date_uploaded TEXT NOT NULL,
                    content_type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT,
                    attachment_urls TEXT
                );
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS teacher_profile (
                    teacher_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    subject_specialization TEXT NOT NULL,
                    department TEXT NOT NULL
                );
            """)
            conn.commit()
            self._insert_sample_teachers()

    def execute(self, query: str, params: tuple = ()):
        """Run insert, update, or delete SQL commands."""
        with self.connect() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            conn.commit()
            return cursor.lastrowid

    def fetch_all(self, query: str, params: tuple = ()) -> List[dict]:
        """Fetch multiple rows as list of dicts."""
        with self.connect() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def fetch_one(self, query: str, params: tuple = ()) -> Optional[dict]:
        """Fetch single row as dict."""
        with self.connect() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            row = cursor.fetchone()
            return dict(row) if row else None

    # ----------------- Convenience methods for SchoolContent -----------------

    def insert_content(self, content: SchoolContent) -> int:
        """Insert a new content record. Returns the auto-generated ID."""
        return self.execute("""
            INSERT INTO school_content (
                teacher_id, class_name, subject,
                date_uploaded, content_type, title, description, attachment_urls
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            content.teacher_id,
            content.class_name,
            content.subject,
            content.date_uploaded.isoformat(),
            content.content_type,
            content.title,
            content.description,
            json.dumps(content.attachment_urls) if content.attachment_urls else None
        ))

    def get_all_contents(self) -> List[SchoolContent]:
        rows = self.fetch_all("SELECT * FROM school_content")
        contents = []
        for row in rows:
            # Convert date string from DB to date object
            row_date = row["date_uploaded"]
            if isinstance(row_date, str):
                row_date = date.fromisoformat(row_date)
            contents.append(SchoolContent(
                content_id=row["content_id"],
                teacher_id=row["teacher_id"],
                class_name=row["class_name"],
                subject=row["subject"],
                date_uploaded=row_date,
                content_type=row["content_type"],
                title=row["title"],
                description=row["description"],
                attachment_urls=json.loads(row["attachment_urls"]) if row["attachment_urls"] else []
            ))
        return contents

    def get_content_by_id(self, content_id: int) -> Optional[SchoolContent]:
        row = self.fetch_one("SELECT * FROM school_content WHERE content_id=?", (content_id,))
        if row:
            row_date = row["date_uploaded"]
            if isinstance(row_date, str):
                row_date = date.fromisoformat(row_date)
            return SchoolContent(
                content_id=row["content_id"],
                teacher_id=row["teacher_id"],
                class_name=row["class_name"],
                subject=row["subject"],
                date_uploaded=row_date,
                content_type=row["content_type"],
                title=row["title"],
                description=row["description"],
                attachment_urls=json.loads(row["attachment_urls"]) if row["attachment_urls"] else []
            )
        return None

    def update_content(self, content_id: int, update_data: dict) -> Optional[SchoolContent]:
        existing = self.get_content_by_id(content_id)
        if not existing:
            return None
        updated = existing.copy(update=update_data)
        if isinstance(updated.date_uploaded, str):
            updated.date_uploaded = date.fromisoformat(updated.date_uploaded)
        self.execute("""
            UPDATE school_content SET
                teacher_id=?, class_name=?, subject=?,
                date_uploaded=?, content_type=?, title=?, description=?, attachment_urls=?
            WHERE content_id=?
        """, (
            updated.teacher_id,
            updated.class_name,
            updated.subject,
            updated.date_uploaded.isoformat(),
            updated.content_type,
            updated.title,
            updated.description,
            json.dumps(updated.attachment_urls) if updated.attachment_urls else None,
            content_id
        ))
        return updated

    def delete_content(self, content_id: int) -> bool:
        with self.connect() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM school_content WHERE content_id=?", (content_id,))
            conn.commit()
            return cursor.rowcount > 0  # True if a row was actually deleted

    def _insert_sample_teachers(self):
        """Insert sample teacher data if table is empty."""
        existing = self.fetch_all("SELECT COUNT(*) as count FROM teacher_profile")
        if existing[0]['count'] == 0:
            teachers = [
                ('t101', 'John Smith', 'Mathematics', 'Science'),
                ('t102', 'Sarah Johnson', 'Biology', 'Science'),
                ('t003', 'Mike Wilson', 'Computer Science', 'Science'),
                ('cc002', 'Lisa Brown', 'Physics', 'Science'),
                ('DS003', 'David Lee', 'Data Science', 'Engineering'),
                ('DH007', 'Emma Davis', 'Physical Education', 'Sports'),
                ('VP005', 'Robert Taylor', 'Sports Management', 'Sports'),
                ('f001', 'Alice Green', 'Mathematics', 'Science'),
                ('T001', 'Mark Anderson', 'Algebra', 'Mathematics'),
                ('T002', 'Jane Miller', 'Literature', 'English'),
                ('T003', 'Chris Wilson', 'Geometry', 'Mathematics'),
                ('T004', 'Mary Garcia', 'General Studies', 'General'),
                ('T005', 'Paul Martinez', 'Literature', 'English'),
                ('T006', 'Linda Rodriguez', 'Shakespeare Studies', 'English')
            ]
            for teacher in teachers:
                self.execute(
                    "INSERT OR IGNORE INTO teacher_profile (teacher_id, name, subject_specialization, department) VALUES (?, ?, ?, ?)",
                    teacher
                )

    def get_all_teachers(self) -> List[TeacherProfile]:
        rows = self.fetch_all("SELECT * FROM teacher_profile")
        return [TeacherProfile(**row) for row in rows]

    def get_teacher_by_id(self, teacher_id: str) -> Optional[TeacherProfile]:
        row = self.fetch_one("SELECT * FROM teacher_profile WHERE teacher_id=?", (teacher_id,))
        return TeacherProfile(**row) if row else None

    def get_department_analytics(self) -> dict:
        """Get analytics data by department."""
        # Get content counts by department
        query = """
            SELECT tp.department, COUNT(sc.content_id) as total_uploads,
                   SUM(CASE WHEN LOWER(sc.content_type) LIKE '%note%' THEN 1 ELSE 0 END) as notes_count
            FROM teacher_profile tp
            LEFT JOIN school_content sc ON tp.teacher_id = sc.teacher_id
            GROUP BY tp.department
            ORDER BY total_uploads DESC
        """
        return self.fetch_all(query)

# ----------------- Initialize database -----------------
db = SQLiteDB("digischool.db")

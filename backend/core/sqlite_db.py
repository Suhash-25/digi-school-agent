import sqlite3
import json
from datetime import date
from typing import List, Optional
from models.data_model import SchoolContent

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
        """Initialize the school_content table with auto-increment ID."""
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
            conn.commit()

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

# ----------------- Initialize database -----------------
db = SQLiteDB("digischool.db")

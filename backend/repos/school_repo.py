from typing import List, Optional
from models.data_model import SchoolContent
from core.sqlite_db import db

class SchoolContentRepo:

    def create(content: SchoolContent) -> SchoolContent:
        content_id = db.insert_content(content)
        content.content_id = content_id
        return content


    def get_all() -> List[SchoolContent]:
        return db.get_all_contents()


    def get_by_id(content_id: int) -> Optional[SchoolContent]:
        return db.get_content_by_id(content_id)


    def update(content_id: int, update_data: dict) -> Optional[SchoolContent]:
        return db.update_content(content_id, update_data)


    def delete(content_id: int) -> bool:
        return db.delete_content(content_id)

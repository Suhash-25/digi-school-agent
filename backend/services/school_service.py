from typing import List, Optional
from models.data_model import SchoolContent
from repos.school_repo import SchoolContentRepo
from fastapi.encoders import jsonable_encoder

def create_content(content: SchoolContent) -> SchoolContent:
    return SchoolContentRepo.create(content)


def get_all_contents() -> List[SchoolContent]:
    contents = SchoolContentRepo.get_all()
    response = jsonable_encoder(contents)
    return response


def get_content_by_id(content_id: int) -> Optional[SchoolContent]:
    return SchoolContentRepo.get_by_id(content_id)


def update_content(content_id: int, update_data: dict) -> Optional[SchoolContent]:
    return SchoolContentRepo.update(content_id, update_data)


def delete_content(content_id: int) -> bool:
    return SchoolContentRepo.delete(content_id)

import json
import ast
from services import school_service

def get_contents() ->  dict:
    return school_service.get_all_contents()
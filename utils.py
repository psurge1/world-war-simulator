from enum import Enum
import json

class constants(Enum):
    MIN_LAT = -90
    MAX_LAT = 90
    MIN_LONG = -180
    MAX_LONG = 180
    COORD_SCALING_MAGNITUDE = 10**5


def scale(scale_min, scale_max, value_min, value_max, value):
    return (value - value_min) / (value_max - value_min) * (scale_max - scale_min) + scale_min

def read_json_as_dict(file_path: str):
    file_contents = ""
    with open(file_path, 'r') as f:
        file_contents = f.read()
    return json.loads(file_contents)
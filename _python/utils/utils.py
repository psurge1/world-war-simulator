from enum import Enum
import json

class constants(Enum):
    MIN_LAT = -90
    MAX_LAT = 90
    MIN_LONG = -180
    MAX_LONG = 180
    COORD_SCALING_MAGNITUDE = 10**5
    PIXEL_WIDTH = 2
    OCEAN_COLOR = (29,162,216)


def scale(scale_min, scale_max, value_min, value_max, value):
    """ Akin to the cpp map function.
    """
    return (value - value_min) / (value_max - value_min) * (scale_max - scale_min) + scale_min

def read_json_as_dict(file_path: str):
    """ Read json from a file and convert it into a python dict.
    """
    file_contents = ""
    with open(file_path, 'r') as f:
        file_contents = f.read()
    return json.loads(file_contents)
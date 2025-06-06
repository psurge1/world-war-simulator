"""
This file is entirely for testing purposes.
Not for use in production.
"""

from models.pixel import Pixel

def init_world_matrix(width: int, height: int, obj_type: type, **kwargs):
    """ Testing initializing the world matrix of Pixel objects
    """
    world_matrix: list[list[type]] = list()
    for _ in range(height):
        row = []
        for _ in range(width):
            row.append(obj_type(**kwargs))
        world_matrix.append(row)
    return world_matrix


if __name__ == '__main__':
    w = init_world_matrix(2, 2, Pixel)
    print(w)
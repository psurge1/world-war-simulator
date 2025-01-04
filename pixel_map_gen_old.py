from PIL import Image, ImageDraw
from random import randint

from utils import constants
import utils
from filter import filter as fl


def gen_map_old(json_path: str, pixel_size: int, width: int = 1000) -> Image:
    map_details = utils.read_json_as_dict(json_path)
    
    # longitudinal degree difference between points
    # user_details = map_details["settings"]["editor.pixelTemplate"]["userData"]
    # block_width = abs(float(user_details["point1"]["longitude"]) - float(user_details["point2"]["longitude"]))
    # print(block_width)

    poly_series = map_details["data"]["editor.polygonSeries"]
    country_abbreviation_dict = dict()
    for country in poly_series:
        country_abbreviation_dict[country["id"]] = country["name"]

    num_points = 0
    duplicate_count = 0
    country_points: dict[str, list[dict[str, str]]] = dict()
    country_color_code: dict[str, tuple[int]] = dict()

    lonlatwidth = constants.MAX_LONG.value - constants.MIN_LONG.value
    lonlatheight = constants.MAX_LAT.value - constants.MIN_LAT.value
    height = int(width * lonlatheight/lonlatwidth)
    
    fl.reset_points()
    for country_abbreviation in country_abbreviation_dict.keys():
        s = map_details["data"].get(f"editor.pixelCountrySeries.{country_abbreviation}", "")
        if country_abbreviation not in country_points.keys():
            country_points[country_abbreviation] = list()
        for point in s:
            num_points += 1
            x, y = (float(point['longitude']), float(point['latitude']))
            scaled_x = int(utils.scale(0, width, 0, 2 * constants.MAX_LONG.value * constants.COORD_SCALING_MAGNITUDE.value, (x + constants.MAX_LONG.value) * constants.COORD_SCALING_MAGNITUDE.value))
            scaled_y = int(utils.scale(0, height, 0, 2 * constants.MAX_LAT.value * constants.COORD_SCALING_MAGNITUDE.value, (-y + constants.MAX_LAT.value) * constants.COORD_SCALING_MAGNITUDE.value))
            map_x, map_y = fl.grid_scale(scaled_x, scaled_y, x_offset=pixel_size, y_offset=pixel_size)
            if map_x != -1:
                country_points[country_abbreviation].append((map_x, map_y))
            else:
                duplicate_count +=1
        
        country_color_code[country_abbreviation] = (randint(0, 255), randint(0, 255), randint(0, 255))
    
    print(f"Number of Points: {num_points}")
    print(f"Number of Duplicate Points: {duplicate_count}")
    print(f"Number of remaining points: {fl.get_num_points()}")
    
    return create_img_old(country_points, country_color_code, pixel_size, width, height)
    

def create_img_old(points: dict[str, list[tuple[int, int]]], country_color_code: dict[str, tuple[int]], pixel_size: int, width: int, height: int) -> Image:
    image = Image.new("RGB", (width, height))
    image1 = ImageDraw.Draw(image)

    for country in points.keys():
        for x, y in points[country]:
            color = country_color_code[country]
            shape = [(x, y), (x + pixel_size, y + pixel_size)]
            image1.rectangle(shape, fill = color)

    return image


def save_map_old(json_path: str, pixel_width: int, save_path: str, extension: str = "png"):
    img = gen_map_old(json_path, pixel_width)
    img = img.save(f"{save_path}.{extension}")
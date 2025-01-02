
import json
from PIL import Image, ImageDraw

from utils import constants, scale
from random import randint



def gen_map(json_path: str, pixel_size: int) -> Image:
    file_contents = ""
    with open(json_path, 'r') as f:
        file_contents = f.read()
    
    map_details = json.loads(file_contents)
    
    user_details = map_details["settings"]["editor.pixelTemplate"]["userData"]
    block_width = abs(float(user_details["point1"]["longitude"]) - float(user_details["point2"]["longitude"]))
    # print(block_width)

    poly_series = map_details["data"]["editor.polygonSeries"]
    country_abbreviation_dict = dict()
    for country in poly_series:
        country_abbreviation_dict[country["id"]] = country["name"]

    # print(country_abbreviation_dict)
    num_points = 0
    country_points: dict[str, list[dict[str, str]]] = dict()
    country_color_code: dict[str, tuple[int]] = dict()
    for country_abbreviation in country_abbreviation_dict.keys():
        s = map_details["data"].get(f"editor.pixelCountrySeries.{country_abbreviation}", "")
        if country_abbreviation not in country_points.keys():
            country_points[country_abbreviation] = list()
        for point in s:
            num_points+=1
            country_points[country_abbreviation].append((float(point['longitude']), float(point['latitude'])))
        
        country_color_code[country_abbreviation] = (randint(0, 255), randint(0, 255), randint(0, 255))
        # print(country_abbreviation_dict[country_abbreviation], s)
    print(f"Number of Points: {num_points}")
    
    return create_img(country_points, country_color_code, pixel_size, block_width)
    


gridded_points: dict[int, set[int]] = dict()
def reset_points():
    global gridded_points
    gridded_points = dict()

def grid_scale(x_value, y_value, x_offset=1, y_offset=1):
    global gridded_points
    x_v = x_value // x_offset * x_offset
    y_v = y_value // y_offset * y_offset

    if x_value % x_offset >= x_offset / 2:
        x_v += x_offset
    if y_value % y_offset >= y_offset / 2:
        y_v += y_offset

    if x_v not in gridded_points:
        gridded_points[x_v] = set()
    if y_v not in gridded_points[x_v]:
        gridded_points[x_v].add(y_v)
        return (x_v, y_v)
    else:
        return (-1, -1)



from PIL import Image, ImageDraw
def create_img(points: dict[str, list[tuple[int, int]]], country_color_code: dict[str, tuple[int]], pixel_size: int, block_width: float) -> Image:
    lonlatwidth = constants.MAX_LONG.value - constants.MIN_LONG.value
    lonlatheight = constants.MAX_LAT.value - constants.MIN_LAT.value

    width = 1000
    height = int(width * lonlatheight/lonlatwidth)

    image = Image.new("RGB", (width, height))
    image1 = ImageDraw.Draw(image)

    # Set the color of each pixel
    # points2 = []
    # outofboundspoints = []

    reset_points()
    
    duplicate_count = 0
    for country in points.keys():
        # if country == "CA":
        #     continue
        for x, y in points[country]:
            scaled_x = int(scale(0, width, 0, 2 * constants.MAX_LONG.value * constants.COORD_SCALING_MAGNITUDE.value, (x + constants.MAX_LONG.value) * constants.COORD_SCALING_MAGNITUDE.value))
            scaled_y = int(scale(0, height, 0, 2 * constants.MAX_LAT.value * constants.COORD_SCALING_MAGNITUDE.value, (-y + constants.MAX_LAT.value) * constants.COORD_SCALING_MAGNITUDE.value))
            map_x, map_y = grid_scale(scaled_x, scaled_y, x_offset=pixel_size, y_offset=pixel_size)
            
            color = country_color_code[country]
            
            if map_x != -1:
                # image.putpixel((scaled_x, scaled_y), color)
                shape = [(map_x, map_y), (map_x + pixel_size, map_y + pixel_size)]
                image1.rectangle(shape, fill = color, outline=(0,255,0))
            else:
                duplicate_count += 1

            # print(f"{x}, {y} becomes {scaled_x}, {scaled_y}")
            # points2.append((scaled_x, scaled_y))
        #     if (scaled_x > width) or (scaled_y > height):
        #         outofboundspoints.append((scaled_x, scaled_y))

    # print(outofboundspoints)
    # print(len(outofboundspoints))
    num_final_points = 0
    for key in gridded_points.keys():
        num_final_points += len(gridded_points[key])


    print(f"width: {width}, height: {height}")
    print(f"number of duplicate points removed: {duplicate_count}")
    print(f"number of remaining points: {num_final_points}")


    # print(len(points))

    return image



def save_map(json_path: str, pixel_width: int, save_path: str, extension: str = "png"):
    img = gen_map(json_path, pixel_width)
    img = img.save(f"{save_path}.png")



if __name__ == '__main__':
    # save_map("assets/maps_4.json", 4, "maps/map_4_pixwidth_4")
    # save_map("assets/maps_3.json", 4, "maps/map_3_pixwidth_4")
    # save_map("assets/maps_3.json", 3, "maps/map_3_pixwidth_3")
    # save_map("assets/maps_2.json", 4, "maps/map_2_pixwidth_4")
    # save_map("assets/maps_2.json", 3, "maps/map_2_pixwidth_3")
    # save_map("assets/maps_2.json", 2, "maps/map_2_pixwidth_2")
    save_map("assets/maps_2.json", 2, "map_2_pixwidth_2")
from PIL import Image, ImageDraw
from random import randint

from models.pixel import Pixel
from utils.utils import *
from utils.filter import filter
from models.country import Country

# from past_tries.pixel_map_gen_old import save_map_old

import pygame



water = Country("", "", constants.OCEAN_COLOR.value, 0, 0)


def init_world_matrix(width: int, height: int):
    world_matrix: list[list[type]] = list()
    for y in range(height):
        row = []
        for x in range(width):
            row.append(Pixel(x, y, country=water))
        world_matrix.append(row)
    return world_matrix

def apply_adjacency(matrix: list[list[Pixel]]):
    for y in range(len(matrix)):
        for x in range(len(matrix[y])):
            curr_pixel = matrix[y][x]
            if y != 0:
                curr_pixel.add_adjacent_pixel(matrix[y-1][x])
            if y != len(matrix) - 1:
                curr_pixel.add_adjacent_pixel(matrix[y+1][x])
            if x != 0:
                curr_pixel.add_adjacent_pixel(matrix[y][x-1])
            if x != len(matrix[y]) - 1:
                curr_pixel.add_adjacent_pixel(matrix[y][x+1])

def gen_map(json_path: str, pixel_size: int, width: int = 1000) -> tuple[list[list[Pixel]], dict[str, Country], dict[str, tuple[str, str]], Image]:
    lonlatwidth = constants.MAX_LONG.value - constants.MIN_LONG.value
    lonlatheight = constants.MAX_LAT.value - constants.MIN_LAT.value
    height = int(width * lonlatheight/lonlatwidth)

    map_details = read_json_as_dict(json_path)
    poly_series = map_details["data"]["editor.polygonSeries"]
    country_abbreviation_dict: dict[str, str] = dict()
    for country in poly_series:
        country_abbreviation_dict[country["id"]] = country["name"]


    num_points = 0
    duplicate_count = 0
    num_countries = 0
    num_countries_flag = False

    country_points: dict[str, tuple[str, str]] = dict()
    country_color_code: dict[str, tuple[int]] = dict()

    # changed to smaller grid
    world_map_matrix: list[list[Pixel]] = init_world_matrix(width // pixel_size + 1, height // pixel_size + 1)
    # world_map_matrix: list[list[Pixel]] = init_world_matrix(width, height)
    # print(f"height: {len(world_map_matrix)} vs. {height}")
    # print(f"width: {len(world_map_matrix[0])} vs. {width}")

    countries:dict[str, Country] = dict()
    for country_abbreviation in country_abbreviation_dict.keys():
        countries[country_abbreviation] = Country(
            country_abbreviation_dict[country_abbreviation],
            country_abbreviation,
            (randint(0, 255), randint(0, 255), randint(0, 255)),
            )
        country_color_code[country_abbreviation] = countries[country_abbreviation].color
    
    filter.reset_points()
    for country_abbreviation in country_abbreviation_dict.keys():
        s = map_details["data"].get(f"editor.pixelCountrySeries.{country_abbreviation}", "")
        if country_abbreviation not in country_points.keys():
            country_points[country_abbreviation] = list()
        num_countries_flag = True
        for point in s:
            if num_countries_flag:
                num_countries += 1
                num_countries_flag = False
            num_points += 1
            x, y = (float(point['longitude']), float(point['latitude']))
            scaled_x = int(scale(0, width, 0, 2 * constants.MAX_LONG.value * constants.COORD_SCALING_MAGNITUDE.value, (x + constants.MAX_LONG.value) * constants.COORD_SCALING_MAGNITUDE.value))
            scaled_y = int(scale(0, height, 0, 2 * constants.MAX_LAT.value * constants.COORD_SCALING_MAGNITUDE.value, (-y + constants.MAX_LAT.value) * constants.COORD_SCALING_MAGNITUDE.value))
            map_x, map_y = filter.grid_scale(scaled_x, scaled_y, x_offset=pixel_size, y_offset=pixel_size)

            if map_x != -1:
                # changed to smaller grid
                country_points[country_abbreviation].append((map_x // pixel_size, map_y // pixel_size))
                world_map_matrix[map_y // pixel_size][map_x // pixel_size] = Pixel(
                    map_x // pixel_size, 
                    map_y // pixel_size, 
                    countries[country_abbreviation],
                    cooldown=countries[country_abbreviation].power // 100
                    # cooldown=5
                    )
            else:
                duplicate_count +=1
    
    apply_adjacency(world_map_matrix)
    
    return (world_map_matrix, countries, country_points, create_img(world_map_matrix, pixel_size, width, height)[0])


def create_img(world_map_matrix: list[list[Pixel]], pixel_size: int, width: int, height: int) -> tuple[Image, list[list[Pixel]]]:
    image = Image.new("RGB", (width, height))
    image1 = ImageDraw.Draw(image)

    for row in range(len(world_map_matrix)):
        for col in range(len(world_map_matrix[row])):
            pix = world_map_matrix[row][col]
            color = pix.country.color
            # if pix.country_abbreviation in conquered:
            #     color = country_color_code[conquered[pix.country_abbreviation]]
            # changed to smaller grid
            # shape = [(pix.x, pix.y), (pix.x + pixel_size, pix.y + pixel_size)]
            # image1.rectangle(shape, fill = pix.color)
            shape = [(pixel_size * pix.x, pixel_size * pix.y), (pixel_size * pix.x + pixel_size, pixel_size * pix.y + pixel_size)]
            image1.rectangle(shape, fill = color)
    
    return (image, world_map_matrix)


def save_map(json_path: str, pixel_width: int, save_path: str, extension: str = "png") -> tuple[list[list[Pixel]], dict[str, Country], dict[str, tuple[str, str]], Image]:
    map_data = gen_map(json_path, pixel_width)
    map_data[3].save(f"{save_path}.{extension}")
    return map_data


def dfs(x: int, y: int, country: str, matrix: list[list[Pixel]], visited_coords: set[Pixel]):
    stack = list()
    stack.append((x, y))
    num_pixels = 1
    while len(stack) > 0:
        sx, sy = stack.pop()
        if sy >= len(matrix) or sy < 0:
            continue
        if sx >= len(matrix[0]) or sx < 0:
            continue
        if (sx, sy) in visited_coords:
            continue
        if matrix[sy][sx].country_abbreviation != country:
            continue
        num_pixels += 1
        # print(f"num_pixels: {num_pixels}")
        # print(f"x: {sx}, y: {sy}")
        matrix[sy][sx].color = constants.OCEAN_COLOR.value
        visited_coords.add((sx, sy))

        stack.append((sx + 1, sy))
        stack.append((sx - 1, sy))
        stack.append((sx, sy + 1))
        stack.append((sx, sy - 1))



# TODO: Each slot in matrix should represent a rectangle with #PIXEL_WIDTH width/height
# Each slot essentially represents PIXEL_WIDTH*PIXEL_WIDTH many pixels acting as one
# Right now, the matrix represents every single pixel, even though resolution can be smaller than every pixel
if __name__ == '__main__':
    # save_map_old("assets/maps_4.json", 4, "maps/map_4_pixwidth_4")
    # save_map_old("assets/maps_3.json", 4, "maps/map_3_pixwidth_4")
    # save_map_old("assets/maps_3.json", 3, "maps/map_3_pixwidth_3")
    # save_map_old("assets/maps_2.json", 4, "maps/map_2_pixwidth_4")
    # save_map_old("assets/maps_2.json", 3, "maps/map_2_pixwidth_3")
    # save_map_old("assets/maps_2.json", 2, "maps/map_2_pixwidth_2")
    # save_map_old("assets/maps_2.json", 2, "map_2_pixwidth_2")




    world_map_data = save_map("assets/maps_2.json", constants.PIXEL_WIDTH.value, "map")
    world_map_matrix, countries, country_points, world_image = world_map_data
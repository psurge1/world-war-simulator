from utils.pixel_map_gen import gen_map, save_map, apply_adjacency
from utils.utils import constants
from models.country import Country
from models.pixel import Pixel
from models.boat import Boat
from models.directions import Direction
from sys import argv

from utils.filter import filter

import pygame

import random

# import multiprocessing # processes
# import threading # threads

conquered_count = 0
matrix_one_is_main = True

def abs(v: int):
    if v < 0:
        return -v
    return v


def time_step(new_map:list[list[Pixel]], old_map:list[list[Pixel]], countries:dict[str, Country], boats:list[Boat]) -> None:
    """ Cellular automata function.
        Applies a set of CA rules to a world map matrix.

        Ruleset 1:
            1) If water, maintain water state and skip the rest of the steps
            2) Increase the power of this cell by the amount of adjacent cells of the same country
            3) Increase the power of this cell by the country's power
                - Determined by:
                    - number of pixels, population, military power, economy, etc.
            4) Optional:
                - Cannot be attacked by allied country pixels
                - Can conquer water (territorial waters)
            5) Recieve attacks form adjacent cells
                - If power goes below zero, change country allegiance to most powerful attacker
    """

    # O(Countries)
    for country in countries.keys():
        num_conflicts = len(countries[country].conflicts)
        countries[country].conflicts_tracker = 1 if num_conflicts < 1 else num_conflicts
        countries[country].conflicts = set()
    
    # Iterate over every pixel
    # O(W*H)
    for y in range(len(old_map)):
        for x in range(len(old_map[y])):
            original_pixel = old_map[y][x]
            original_pixel.cooldown -= 1

            if original_pixel.cooldown > 0:
                new_map[y][x].updateWith(original_pixel)
                continue
            else:
                original_pixel.cooldown = original_pixel.cooldown_cap

            # print("Cooldown Cap: ", original_pixel.cooldown_cap)
            # Apply ruleset to pixel
            country_ref = original_pixel.country
            if country_ref is None or country_ref.abbreviation == "":
                # 1) If water
                new_map[y][x].updateWith(original_pixel)
            else:
                # TODO: Instead of subtracting by the number of conflicts, subtract by a factor of the total amount of emeny power
                # (so that it is proprtional to the strength of opponents)
                power_divisor = country_ref.conflicts_tracker if country_ref.conflicts_tracker > 0 else 1
                power = country_ref.power - power_divisor
                if power <= 0:
                    power = 1

                # country_ref.power *= 0.99
                ds = [Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT]
                for pix in original_pixel.adjacent_pixels:
                    pix_country_ref = pix.country
                    if pix_country_ref is None or pix_country_ref.abbreviation == "":
                        if original_pixel.can_build_boat and random.randint(1, 1000) == 1:
                            boats.append(Boat(original_pixel.country, random.choice(ds), power, pix.x, pix.y, 50))
                            original_pixel.can_build_boat = False
                        continue
                    if country_ref.abbreviation == pix_country_ref.abbreviation:
                        power += country_ref.connection_power
                
                is_conquered = False
                pixl_choice = None
                for pix in original_pixel.adjacent_pixels:
                    pix_country_ref = pix.country
                    if pix_country_ref is None or pix_country_ref.abbreviation == "":
                        continue
                    if country_ref.abbreviation != pix_country_ref.abbreviation:
                        power -= pix_country_ref.power
                        if power <= 0:
                            pixl_choice = pix
                            break
                            

                if pixl_choice != None:
                    power_diff = country_ref.power - pixl_choice.country.power
                    abs_power_diff = abs(power_diff)
                    if random.randint(0, abs_power_diff) > abs_power_diff // 2:
                        country_ref.power -= 1
                        if country_ref.power < 1:
                            country_ref.power = 1
                        pixl_choice.country.power += 1
                        
                        new_map[y][x].country = pixl_choice.country
                        global conquered_count
                        conquered_count += 1
                    else:
                        new_map[y][x].updateWith(original_pixel)
                else:
                    new_map[y][x].updateWith(original_pixel)
    
    x_inc = [0, 1, 0, -1]
    y_inc = [-1, 0, 1, 0]
    for b in boats:
        b.x += x_inc[b.direction.value - 1]
        b.y += y_inc[b.direction.value - 1]
        if b.y < len(new_map) and b.x < len(new_map[b.y]):
            pixel_occupied_by_boat = new_map[b.y][b.x]
            abbv = pixel_occupied_by_boat.country.abbreviation
            if abbv == "":
                b.lifespan -= 1
            elif abbv == b.country.abbreviation:
                b.lifespan = 0
            else:
                # another country
                # pass
                new_map[b.y][b.x].country = b.country
                b.lifespan = 0
        else:
            b.lifespan = 0
    boats[:] = [b for b in boats if b.lifespan > 0]


def draw_map(screen, new_world_map_matrix, boats, draw_water=True, old_world_map_matrix=None):
    if old_world_map_matrix != None:
        assert len(old_world_map_matrix) == len(new_world_map_matrix)
        assert len(old_world_map_matrix) > 0
        assert len(old_world_map_matrix[0]) == len(new_world_map_matrix[0])

    rect = pygame.Rect(0, 0, game_pixel_width, game_pixel_width)
    
    for y in range(len(new_world_map_matrix)):
        for x in range(len(new_world_map_matrix[y])):
            pxl = new_world_map_matrix[y][x]

            if not draw_water and (pxl.country is None or pxl.country.abbreviation == ""):
                continue
            # elif old_world_map_matrix != None and pxl.country == old_world_map_matrix[y][x].country:
            #     continue

            rect.x = pxl.x * game_pixel_width
            rect.y = pxl.y * game_pixel_width
            pygame.draw.rect(
                screen,
                (0, 0, 0) if pxl.country is None else pxl.country.color,
                rect
                )
    
    for b in boats:
        if b.lifespan > 0:
            rect.x = b.x * game_pixel_width
            rect.y = b.y * game_pixel_width
            pygame.draw.rect(
                screen,
                (255, 255, 255),
                # Boat.color(),
                rect
                )

# if __name__ != '__main__':
#     matrix = []
#     with open('data.csv', 'r') as f:
#         for _ in range(21):
#             row = []
#             for _ in range(41):
#                 row.append(None)
#             matrix.append(row)
        
#         lines = f.readlines()
#         for line in lines:
#             l = line.strip().split(",")
#             print(l)
#             x = int(l[0])
#             y = int(l[1])
#             pix_x = int(l[2])
#             pix_y = int(l[3])
#             # print(x, pix_x)
#             # print(y, pix_y)
#             # assert x == pix_x
#             # assert y == pix_y
#             r = int(l[4])
#             g = int(l[5])
#             b = int(l[6])

#             matrix[y][x] = (r, g, b)
#     pygame.init()
#     game_pixel_width = 25
#     screen = pygame.display.set_mode((41 * game_pixel_width, 21 * game_pixel_width))
#     clock = pygame.time.Clock()
#     running = True
#     while running:
#         for event in pygame.event.get():
#             # print(event)
#             if event.type == pygame.QUIT:
#                 running = False
        
#         rect = pygame.Rect(0, 0, game_pixel_width, game_pixel_width)
#         for y in range(len(matrix)):
#             for x in range(len(matrix[y])):
#                 pxl = matrix[y][x]

#                 rect.x = x * game_pixel_width
#                 rect.y = y * game_pixel_width
#                 pygame.draw.rect(
#                     screen,
#                     (0, 0, 0) if pxl is None else pxl,
#                     rect
#                     )

#         pygame.display.flip()
#         clock.tick(60)


if __name__ == '__main__':
    if (len(argv) == 2):
        pixel_width = int(argv[1])
        map_choice = 2
    elif (len(argv) == 3):
        pixel_width = int(argv[1])
        map_choice = int(argv[2])
        if (map_choice not in {2, 3, 4, 8, 25}):
            print("map choice must be one of: 2, 3, 4, 8, 25")
            map_choice = 2
    else:
        pixel_width = 2
        map_choice = 2
    
    
    # result = save_map(f"../public/assets/maps_{map_choice}.json", pixel_width, f"map")
    result = gen_map(f"../public/assets/maps_{map_choice}.json", pixel_width)
    world_map_matrix_one = result[0]
    countries = result[1]
    # country_points = result[2]
    world_image = result[2]

    print("number of duplicate pixels: ", filter.get_num_duplicates())
    
    width = len(world_map_matrix_one[0])
    height = len(world_map_matrix_one)
    print(f"WIDTH: {width}")
    print(f"HEIGHT: {height}")
    game_pixel_width = 3

    # print(world_map_matrix[height//4][width//4])
    # print(world_map_matrix[0][0])

    # world_image.show()

    ### TODO: power should update (more power as more land is conquered), the fewer the number of conflicts, the more power a country has
    powers = dict()
    # powers["India"] = 5000
    # powers["Japan"] = 12500
    for country in countries.keys():
        if countries[country].name in powers.keys():
            countries[country].power = powers[countries[country].name]
        else:
            # countries[country].power = len(country_points[country])
            # countries[country].power = (random.randint(0, len(country_points[country])) + 1)
            # countries[country].power = random.randint(0, 1000)
            countries[country].power = 100 + random.randint(0, 25)
            # countries[country].power = abs(1000 - random.randint(0, len(country_points[country])))

    # for country in countries.keys():
    #     print(f"{country}: {countries[country].power}")

    world_map_matrix_two: list[list[Pixel | None]] = [[ None for _ in range(len(world_map_matrix_one[i]))] for i in range(len(world_map_matrix_one))]
    for y in range(len(world_map_matrix_one)):
        for x in range(len(world_map_matrix_one[y])):
            world_map_matrix_two[y][x] = Pixel.copyPixel(world_map_matrix_one[y][x])
    apply_adjacency(world_map_matrix_two)

    boats: list[Boat] = []


    pygame.init()
    screen = pygame.display.set_mode((width * game_pixel_width, height * game_pixel_width))
    clock = pygame.time.Clock()

    draw_map(screen, world_map_matrix_one, boats, False)
    # new_world_map_matrix = world_map_matrix

    running = True
    pause = False

    
    while running:
        for event in pygame.event.get():
            # print(event)
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                pause = not pause

        if not pause:
            if matrix_one_is_main:
                time_step(world_map_matrix_two, world_map_matrix_one, countries, boats)
                screen.fill((0, 0, 0))
                draw_map(screen, world_map_matrix_two, boats, False, old_world_map_matrix=world_map_matrix_one)
                matrix_one_is_main = False
            else:
                time_step(world_map_matrix_one, world_map_matrix_two, countries, boats)
                screen.fill((0, 0, 0))
                draw_map(screen, world_map_matrix_one, boats, False, old_world_map_matrix=world_map_matrix_two)
                matrix_one_is_main = True

        
        # print(f"CONQUERED: {conquered_count}")

        pygame.display.flip()
        clock.tick(60)
        print(f"FPS: {clock.get_fps():.2f}")
        # print(len(world_map_matrix), len(world_map_matrix[0]))
        
    pygame.quit()
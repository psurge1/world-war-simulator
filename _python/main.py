import asyncio

# from utils.pixel_map_gen import gen_map, save_map, apply_adjacency
# from utils.utils import constants
# from models.country import Country
# from models.pixel import Pixel
# from desktop import draw_map, time_step

# import pygame
# import random

# Try to declare all your globals at once to facilitate compilation later.
COUNT_DOWN = 3
PIXEL_WIDTH = 2
MAP_CHOICE = 2


# Do init here
# Load any assets right now to avoid lag at runtime or network errors.

# conquered_count = 0
# matrix_one_is_main = True

# def abs(v: int):
#     if v < 0:
#         return -v
#     return v

# result = gen_map(f"../assets/maps_{MAP_CHOICE}.json", PIXEL_WIDTH)
# world_map_matrix_one = result[0]
# countries = result[1]
# country_points = result[2]
# world_image = result[3]

# width = len(world_map_matrix_one[0])
# height = len(world_map_matrix_one)
# game_pixel_width = 3

# for country in countries.keys():
#     countries[country].power = (random.randint(0, len(country_points[country])) + 1)

# world_map_matrix_two: list[list[Pixel | None]] = [[ None for _ in range(len(world_map_matrix_one[i]))] for i in range(len(world_map_matrix_one))]
# for y in range(len(world_map_matrix_one)):
#     for x in range(len(world_map_matrix_one[y])):
#         world_map_matrix_two[y][x] = Pixel.copyPixel(world_map_matrix_one[y][x])
# apply_adjacency(world_map_matrix_two)

# pygame.init()
# screen = pygame.display.set_mode((width * game_pixel_width, height * game_pixel_width))
# clock = pygame.time.Clock()

# draw_map(screen, world_map_matrix_one, True)


async def main():
    global COUNT_DOWN

    # avoid this kind declaration, prefer the way above
    COUNT_DOWN = 3

    while True:

        # Do your rendering here, note that it's NOT an infinite loop,
        # and it is fired only when VSYNC occurs
        # Usually 1/60 or more times per seconds on desktop
        # could be less on some mobile devices

        print(f"""

            Hello[{COUNT_DOWN}] from Python

""")
        # pygame.display.update() should go right next line
        # if matrix_one_is_main:
        #     time_step(world_map_matrix_two, world_map_matrix_one, countries)
        #     draw_map(screen, world_map_matrix_two, False, old_world_map_matrix=world_map_matrix_one)
        #     matrix_one_is_main = False
        # else:
        #     time_step(world_map_matrix_one, world_map_matrix_two, countries)
        #     draw_map(screen, world_map_matrix_one, False, old_world_map_matrix=world_map_matrix_two)
        #     matrix_one_is_main = True
        # # print(f"CONQUERED: {conquered_count}")
        # pygame.display.flip()
        # clock.tick(60)
        # print(f"FPS: {clock.get_fps():.2f}")


        await asyncio.sleep(0)  # Very important, and keep it 0

        if not COUNT_DOWN:
            return

        COUNT_DOWN = COUNT_DOWN - 1

# This is the program entry point:
asyncio.run(main())

# Do not add anything from here, especially sys.exit/pygame.quit
# asyncio.run is non-blocking on pygame-wasm and code would be executed
# right before program start main()

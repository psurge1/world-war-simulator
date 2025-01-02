from PIL import Image, ImageDraw
from utils import constants, scale

def gen_elevation_map(map_dict):
    width = constants.MAX_LONG.value - constants.MIN_LONG.value
    height = constants.MAX_LAT.value - constants.MIN_LAT.value
    image = Image.new("RGB", (width + 1, height + 1))
    image1 = ImageDraw.Draw(image)

    for lon in range(-180, 181, 4):
        for lat in range(-90, 91, 4):
            elevation = map_dict[lat][lon]
            print(f"lon: {lon}, lat: {lat}, elevation: {elevation}")
            x = lon + constants.MAX_LONG.value
            y = -lat + constants.MAX_LAT.value
            color = (28, 163, 236)
            if elevation > 0:
                scaled_value = int(scale(0, 255, 0, 5783, elevation))
                color = (0, 150, (255 - scaled_value) // 2)
            elif elevation < 0:
                color = (255, 0, 0)
            # image.putpixel((x, y), color)
            shape = [(x, y), (x + 3, y + 3)]
            image1.rectangle(shape, fill = color)
    image.show()

def processfile(file_name):
    lines = []
    with open(file_name, 'r') as f:
        lines = f.readlines()
    
    world_map: dict[int, dict[int, int]] = dict()
    max_el = 0
    for line in lines:
        line_args = line.split(", ")
        longitude = int(line_args[0].split(": ")[1].strip())
        latitude = int(line_args[1].split(": ")[1].strip())
        elevation = int(float(line_args[2].split(": ")[1].strip()))
        if elevation > max_el:
            max_el = elevation
        if latitude not in world_map.keys():
            world_map[latitude] = dict()
        world_map[latitude][longitude] = elevation
    
    gen_elevation_map(world_map)

if __name__ == '__main__':
    processfile("misc/testfile.txt")
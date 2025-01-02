from enum import Enum
from PIL import Image

class constants(Enum):
    MIN_LAT = -90
    MAX_LAT = 90
    MIN_LONG = -180
    MAX_LONG = 180
    COORD_SCALING_MAGNITUDE = 10**5


# import elevation
def gen_elevation_map():
    width = constants.MAX_LONG.value - constants.MIN_LONG.value
    height = constants.MAX_LAT.value - constants.MIN_LAT.value
    image = Image.new("RGB", (width, height))

    for lon in range(-180, 181, 2):
        for lat in range(-90, 91, 2):
            elevation = get_elevation(float(lat), float(lon))
            print(f"lon: {lon}, lat: {lat}, elevation: {elevation}")
            # color = (lon, lat, 0)
            # image.putpixel((lon + constants.MAX_LONG.value, -lat + constants.MAX_LAT.value), color)


import requests
def get_elevation(lat, lon):
    url = f"https://api.open-elevation.com/api/v1/lookup?locations={lat},{lon}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        elevation = data["results"][0]["elevation"]
        return elevation
    else:
        print(f"API request failed: lat= {lat}, lon= {lon}")
        return -1

def create_map(min_lat, max_lat, minlon, maxlon, lat_resolution = 1, lon_resolution = 1):
    world_map = []
    for lon in range(minlon, maxlon + 1, lon_resolution):
        column = []
        for lat in range(min_lat, max_lat + 1, lat_resolution):
            el = get_elevation(lat, lon)
            print(f"lon: {lon}, lat: {lat}, elevation: {el}")
            column.append(el)
        world_map.append(column)
    return world_map


def save_map(filename):
    world_map = create_map(
        constants.MIN_LAT.value,
        constants.MAX_LAT.value,
        44,
        constants.MAX_LONG.value,
        lat_resolution=4,
        lon_resolution=4
        )
    # world_map = create_map(
    #     constants.MIN_LAT.value,
    #     constants.MAX_LAT.value,
    #     constants.MIN_LONG.value,
    #     constants.MAX_LONG.value,
    #     lat_resolution=4,
    #     lon_resolution=4
    #     )
    # print(world_map)
    # # world_map = [[1, 2], [3, 4]]
    # file_save = {
    #     "map" : world_map,
    #     "width" : len(world_map),
    #     }
    # file_save["height"] = 0 if file_save["width"] == 0 else len(world_map[0])
    
    # with open(filename, 'w') as f:
    #     json.dump(file_save, f)



if __name__ == '__main__':
    # gen_map("maps_3.json")
    # gen_elevation_map()
    # gen2()
    # world_map = create_map(38, 40, 89, 91)
    # print(world_map)
    save_map("assets/newmap.json")
    
    
// from PIL import Image, ImageDraw
// from random import randint

// from models.pixel import Pixel
// from utils.utils import *
// from utils.filter import filter
// from models.country import Country

// # from past_tries.pixel_map_gen_old import save_map_old

// import pygame

import Country from "../models/Country";
import Pixel from "../models/Pixel";

import Constants, {scale, readJsonAsDict} from "./Utils";



const water = new Country("", "", Constants.OCEAN_COLOR, 0, 0)


export function initWorldMatrix(width: number, height: number): Pixel[][] {
    let worldMatrix: Pixel[][] = [];
    for (let y = 0; y < height; ++y) {
        let row: Pixel[] = [];
        for (let x = 0; x < width; ++x) {
            row.push(new Pixel(x, y, water));
        }
        worldMatrix.push(row);
    }
    return worldMatrix;
}

export function applyAdjacency(matrix: Pixel[][]): void {
    for (let y = 0, a = matrix.length; y < a; ++y) {
        for (let x = 0, b = matrix[y].length; x < b; ++x) {
            let currPixel = matrix[y][x];
            if (y != 0)
                currPixel.addAdjacentPixel(matrix[y-1][x]);
            if (y != a - 1)
                currPixel.addAdjacentPixel(matrix[y+1][x]);
            if (x != 0)
                currPixel.addAdjacentPixel(matrix[y][x-1]);
            if (x != b - 1)
                currPixel.addAdjacentPixel(matrix[y][x+1]);
        }
    }
}

export function genMap(jsonPath: string, pixelSize: number, width: number = 1000): {world_map_matrix_one: Pixel[][], countries: Map<string, Country>} {
    
    let lonlatwidth = Constants.MAX_LONG - Constants.MIN_LONG;
    let lonlatheight = Constants.MAX_LAT - Constants.MIN_LAT;
    let height = Math.round(width * lonlatheight/lonlatwidth);

    let mapDetails = readJsonAsDict(jsonPath);
    // let poly_series = mapDetails.data.editor.polygonSeries;
    // let country_abbreviation_dict: Map<string, string> = new Map();

    /*
    for country in poly_series:
        country_abbreviation_dict[country["id"]] = country["name"]


    let num_points = 0;
    let duplicate_count = 0;
    let num_countries = 0;
    let num_countries_flag = false;

    country_points: dict[str, tuple[str, str]] = dict()
    country_color_code: dict[str, tuple[int]] = dict()

    // changed to smaller grid
    world_map_matrix: list[list[Pixel]] = init_world_matrix(width // pixel_size + 1, height // pixel_size + 1)
    // world_map_matrix: list[list[Pixel]] = init_world_matrix(width, height)
    // print(f"height: {len(world_map_matrix)} vs. {height}")
    // print(f"width: {len(world_map_matrix[0])} vs. {width}")

    let countries:dict[str, Country] = dict()
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
            scaled_x = int(scale(0, width, 0, 2 * Constants.MAX_LONG * Constants.COORD_SCALING_MAGNITUDE, (x + Constants.MAX_LONG) * Constants.COORD_SCALING_MAGNITUDE))
            scaled_y = int(scale(0, height, 0, 2 * Constants.MAX_LAT * Constants.COORD_SCALING_MAGNITUDE, (-y + Constants.MAX_LAT) * Constants.COORD_SCALING_MAGNITUDE))
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
    */
}

/*
function create_img(world_map_matrix: list[list[Pixel]], pixel_size: number, width: number, height: number) -> tuple[Image, list[list[Pixel]]]: {
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
}
*/
/*
export function save_map(json_path: string, pixel_width: number, save_path: string, extension: string = "png"): {Pixel[][], Map<string, Country>, Map<string, string[]>} {
    map_data = gen_map(json_path, pixel_width)
    map_data[3].save(f"{save_path}.{extension}")
    return map_data
}
*/


function dfs(x: number, y: number, country: string, matrix: Pixel[][], visitedCoords: Set<number[]>) {
    let stack: number[][] = []
    stack.push([x, y])
    let num_pixels = 1
    while (stack.length > 0) {
        let l = stack.pop();
        if (l === undefined)
            continue;

        let sx = l[0];
        let sy = l[1];

        if (sy >= matrix.length || sy < 0)
            continue;
        if (sx >= matrix[0].length || sx < 0)
            continue;
        if (visitedCoords.has([sx, sy]))
            continue;
        if (matrix[sy][sx].country?.abbreviation != country)
            continue;

        num_pixels += 1;
        matrix[sy][sx].country.color = Constants.OCEAN_COLOR
        visitedCoords.add([sx, sy])

        stack.push([sx + 1, sy])
        stack.push([sx - 1, sy])
        stack.push([sx, sy + 1])
        stack.push([sx, sy - 1])
    }
}

// TODO: Each slot in matrix should represent a rectangle with #PIXEL_WIDTH width/height
// Each slot essentially represents PIXEL_WIDTH*PIXEL_WIDTH many pixels acting as one
// Right now, the matrix represents every single pixel, even though resolution can be smaller than every pixel
let main = false;
if (main) {
    // save_map_old("assets/maps_4.json", 4, "maps/map_4_pixwidth_4")
    // save_map_old("assets/maps_3.json", 4, "maps/map_3_pixwidth_4")
    // save_map_old("assets/maps_3.json", 3, "maps/map_3_pixwidth_3")
    // save_map_old("assets/maps_2.json", 4, "maps/map_2_pixwidth_4")
    // save_map_old("assets/maps_2.json", 3, "maps/map_2_pixwidth_3")
    // save_map_old("assets/maps_2.json", 2, "maps/map_2_pixwidth_2")
    // save_map_old("assets/maps_2.json", 2, "map_2_pixwidth_2")




    // let world_map_data = save_map("assets/maps_2.json", Constants.PIXEL_WIDTH, "map")
    // let world_map_matrix, countries, country_points, world_image = world_map_data

    
}
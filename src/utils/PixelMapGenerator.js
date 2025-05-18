import Country from "../models/Country.js";
import Pixel from "../models/Pixel.js";

import Filter from "./Filter.js"
import Constants, {scale, readJsonAsDict, randomInRange} from "./Utils.js";



const water = new Country("", "", Constants.OCEAN_COLOR, 0, 0)


export function initWorldMatrix(width, height) {
    let worldMatrix = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) {
            row.push(new Pixel(x, y, water));
        }
        worldMatrix.push(row);
    }
    return worldMatrix;
}

export function applyAdjacency(matrix) {
    for (let y = 0, a = matrix.length; y < a; ++y) {
        for (let x = 0, b = matrix[y].length; x < b; ++x) {
            let currPixel = matrix[y][x];
            if (y != 0) {
                currPixel.addAdjacentPixel(matrix[y-1][x]);
            }
            if (y != a - 1) {
                currPixel.addAdjacentPixel(matrix[y+1][x]);
            }
            if (x != 0) {;
                currPixel.addAdjacentPixel(matrix[y][x-1]);
            }
            if (x != b - 1) {
                currPixel.addAdjacentPixel(matrix[y][x+1]);
            }
        }
    }
}

export async function genMap(jsonPath, pixelSize, width = 1000) {
    
    let lonlatwidth = Constants.MAX_LONG - Constants.MIN_LONG;
    let lonlatheight = Constants.MAX_LAT - Constants.MIN_LAT;
    let height = Math.floor(width * lonlatheight/lonlatwidth);

    let mapDetails = await readJsonAsDict(jsonPath);
    // console.log(mapDetails);
    let polySeries = mapDetails.data["editor.polygonSeries"];
    // console.log(poly_series);
    let countryAbbreviationMap = new Map();

    // save country abbreviations and country names in a map
    polySeries.forEach((value, index) => {
        countryAbbreviationMap.set([value["id"]], value["name"]);
    });

    
    let num_points = 0;
    let duplicate_count = 0;
    let num_countries = 0;

    // map storing {country abbreviation: color code}
    // let countryColorCode = new Map();
    
    // initialize a grid of pixels with default value of water
    let worldMapMatrix = initWorldMatrix(Math.floor(width / pixelSize) + 1, Math.floor(height / pixelSize) + 1);
    
    // assign a random color to each country
    let countries = new Map();
    countryAbbreviationMap.forEach((name, abbrev) => {
        let cColor = [randomInRange(0, 255), randomInRange(0, 255), randomInRange(0, 255)];
        countries.set(abbrev, new Country(
            name,
            abbrev,
            cColor
        ));
        // countryColorCode.set(abbrev, cColor);
    })

    Filter.resetPoints();
    countryAbbreviationMap.forEach((name, abbrev) => {
        let s = mapDetails["data"]["editor.pixelCountrySeries." + abbrev];
        // console.log(name, s);
        ++num_countries;
        if (s !== undefined)
            s.forEach((point, index) => {
                ++num_points;

                
                let x = Number(point['longitude']);
                let y = Number(point['latitude']);

                let scaledX = Math.floor(scale(0, width, 0, 2 * Constants.MAX_LONG * Constants.COORD_SCALING_MAGNITUDE, (x + Constants.MAX_LONG) * Constants.COORD_SCALING_MAGNITUDE));
                let scaledY = Math.floor(scale(0, height, 0, 2 * Constants.MAX_LAT * Constants.COORD_SCALING_MAGNITUDE, (-y + Constants.MAX_LAT) * Constants.COORD_SCALING_MAGNITUDE));

                // Remove overlapping pixels
                let result = Filter.gridScale(scaledX, scaledY, pixelSize, pixelSize);
                // console.log(x, y, scaledX, scaledY, ...result);

                let mapX = result[0];
                let mapY = result[1];

                if (mapX !== -1) {
                    // changed to smaller grid
                    let newX = Math.floor(mapX / pixelSize);
                    let newY = Math.floor(mapY / pixelSize);

                    // remove extraneous pixels
                    if (newX <= width/pixelSize && newY <= height/pixelSize) {
                        worldMapMatrix[newY][newX] = new Pixel(newX, newY, countries.get(abbrev), [], countries.get(abbrev).power);
                    }
                }
                else {
                    ++duplicate_count;
                }
            });
    });
    
    applyAdjacency(worldMapMatrix);
    return {worldMapMatrix, countries}
}
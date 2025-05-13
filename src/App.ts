import {genMap, applyAdjacency} from './utils/PixelMapGenerator';
import Constants, {abs} from './utils/Utils'
import Country from './models/Country'
import Pixel from './models/Pixel'
import Boat from './models/Boat'
import Directions from './models/Directions'

var conqueredCount = 0;
var matrixOneIsMain = true;

let width = 501;
let height = 251;
const gamePixelWidth = 3;
const pixelWidthChoice = 2;
// const gamePixelHeight = 3;

function timeStep(
    newMap: Pixel[][],
    oldMap: Pixel[][],
    countries: Record<string, Country>,
    boats: Boat[]
): void {
    for (const countryName in countries) {
        const country = countries[countryName];
        const numConflicts = country.conflicts.size;
        country.conflictsTracker = numConflicts < 1 ? 1 : numConflicts;
        country.conflicts.clear();
    }
  
    for (let y = 0; y < oldMap.length; y++) {
        for (let x = 0; x < oldMap[y].length; x++) {
            const originalPixel = oldMap[y][x];
            originalPixel.cooldown -= 1;

            if (originalPixel.cooldown > 0) {
                newMap[y][x].updateWith(originalPixel);
                continue;
            }
            else {
                originalPixel.cooldown = originalPixel.cooldownCap;
            }

            const countryRef = originalPixel.country;
            if (!countryRef || countryRef.abbreviation === "") {
                newMap[y][x].updateWith(originalPixel);
            }
            else {
                const powerDivisor = countryRef.conflictsTracker > 0 ? countryRef.conflictsTracker : 1;
                let power = countryRef.power * powerDivisor;

                const ds = [Directions.UP, Directions.RIGHT, Directions.DOWN, Directions.LEFT];
                for (const pix of originalPixel.adjacentPixels) {
                    const pixCountryRef = pix.country;
                    if (!pixCountryRef || pixCountryRef.abbreviation === "") {
                        if (originalPixel.canBuildBoat && Math.random() < 0.001) {
                            boats.push(new Boat(countryRef, ds[Math.floor(Math.random() * ds.length)], power, pix.x, pix.y, 50));
                            originalPixel.canBuildBoat = false;
                        }
                        continue;
                    }
                    if (countryRef.abbreviation === pixCountryRef.abbreviation) {
                        power += countryRef.connectionPower;
                    }
                }

                let pixlChoice: Pixel | null = null;
                for (const pix of originalPixel.adjacentPixels) {
                    const pixCountryRef = pix.country;
                    if (!pixCountryRef || pixCountryRef.abbreviation === "")
                        continue;
                    if (countryRef.abbreviation !== pixCountryRef.abbreviation) {
                            power -= pixCountryRef.power;
                            if (power <= 0) {
                            pixlChoice = pix;
                            break;
                        }
                    }
                }

                if (pixlChoice !== null) {
                    const powerDiff = countryRef.power - pixlChoice.country?.power;
                    const absPowerDiff = abs(powerDiff);
                    if (Math.random() * absPowerDiff > absPowerDiff / 2) {
                        countryRef.power = Math.max(1, countryRef.power - 1);
                        pixlChoice.country.power += 1;
                        newMap[y][x].country = pixlChoice.country;
                        conqueredCount++;
                    }
                    else {
                        newMap[y][x].updateWith(originalPixel);
                    }
                }
                else {
                    newMap[y][x].updateWith(originalPixel);
                }
            }
        }
    }

    const xInc = [0, 1, 0, -1];
    const yInc = [-1, 0, 1, 0];

    for (const b of boats) {
        b.x += xInc[b.direction - 1];
        b.y += yInc[b.direction - 1];
        if (b.y < newMap.length && b.x < newMap[b.y].length) {
        const pixelOccupiedByBoat = newMap[b.y][b.x];
        const abbv = pixelOccupiedByBoat.country?.abbreviation ?? "";
        if (abbv === "") {
            b.lifespan -= 1;
        } else if (abbv === b.country.abbreviation) {
            b.lifespan = 0;
        } else {
            pixelOccupiedByBoat.country = b.country;
            b.lifespan = 0;
        }
        } else {
        b.lifespan = 0;
        }
    }

    boats = boats.filter(b => b.lifespan > 0);
}

function drawMap() {

}



(window as any).setup = () => {
    let result = genMap("assets/maps_2.json", pixelWidthChoice);
    const {world_map_matrix_one, countries} = result;

    createCanvas(width * gamePixelWidth, height * gamePixelWidth);
    background(0);
}

(window as any).draw = () => {
    if (matrixOneIsMain) {
        // timeStep(world_map_matrix_two, world_map_matrix_one, countries, boats);
        background(0);
        // drawMap(screen, world_map_matrix_two, boats, False, old_world_map_matrix=world_map_matrix_one);
        matrixOneIsMain = false;
    }
    else {
        // timeStep(world_map_matrix_one, world_map_matrix_two, countries, boats);
        background(0);
        // drawMap(screen, world_map_matrix_one, boats, False, old_world_map_matrix=world_map_matrix_two);
        matrixOneIsMain = true;
    }
}
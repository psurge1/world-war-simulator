import {genMap, applyAdjacency} from './utils/PixelMapGenerator.js';
import Constants, {abs, randomInRange} from './utils/Utils.js'
import Country from './models/Country.js'
import Pixel from './models/Pixel.js'
import Boat from './models/Boat.js'
import Directions from './models/Directions.js'
import Filter from './utils/Filter.js';

var conqueredCount = 0;
var matrixOneIsMain = true;

async function timeStep(newMap, oldMap, countries, boats) {
    const startTime = performance.now();
    let pixelsProcessed = 0;
    let conflictsFound = 0;
    let waterPixel = 0;
    
    countries.forEach((country, abbrev) => {
        const numConflicts = country.conflicts.size;
        country.conflictsTracker = numConflicts < 1 ? 1 : numConflicts;
        country.conflicts.clear();
    });
    
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
            pixelsProcessed++;
            
            const countryRef = originalPixel.country;
            // if pixel is water
            if (!countryRef || countryRef.abbreviation === "") {
                newMap[y][x].updateWith(originalPixel);
                waterPixel++;
            }
            // pixel is land (belongs to a country)
            else {
                const powerDivisor = countryRef.conflictsTracker > 0 ? countryRef.conflictsTracker : 1;
                let power = countryRef.power - powerDivisor;
                if (power <= 0) {
                    power = 1;
                }

                const ds = [Directions.UP, Directions.RIGHT, Directions.DOWN, Directions.LEFT];
                for (const pix of originalPixel.adjacentPixels) {
                    const pixCountryRef = pix.country;
                    // BOAT LOGIC
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

                let pixlChoice = null;
                for (const pix of originalPixel.adjacentPixels) {
                    const pixCountryRef = pix.country;
                    if (!pixCountryRef || pixCountryRef.abbreviation === "")
                        continue;
                    if (countryRef.abbreviation !== pixCountryRef.abbreviation) {
                        countryRef.conflicts.add(pixCountryRef);
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
                        conflictsFound++;
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
    
    // BOAT LOGIC
    const xInc = [0, 1, 0, -1];
    const yInc = [-1, 0, 1, 0];

    for (const b of boats) {
        b.x += xInc[b.direction - 1];
        b.y += yInc[b.direction - 1];
        if (b.y >= 0 && b.x >= 0 && b.y < newMap.length && b.x < newMap[b.y].length) {
            const pixelOccupiedByBoat = newMap[b.y][b.x];
            const abbv = pixelOccupiedByBoat.country?.abbreviation ?? "";
            if (abbv === "") {
                b.lifespan -= 1;
            } else if (abbv === b.country.abbreviation) {
                b.lifespan = 0;
            } else {
                pixelOccupiedByBoat.country = b.country;
                console.log(pixelOccupiedByBoat, pixelOccupiedByBoat.adjacentPixels);
                b.lifespan = 0;
            }
        }
        else {
            b.lifespan = 0;
        }
    }

    boats.splice(0, boats.length, ...boats.filter(b => b.lifespan > 0));
}

function drawMap(newMap, boats, drawWater, pixWidth, oldMap=undefined, pixHeight=pixWidth) {
    for (let y = 0, h = newMap.length; y < h; ++y) {
        for (let x = 0, w = newMap[y].length; x < w; ++x) {
            let pxl = newMap[y][x];

            if (!drawWater && (pxl.country === undefined || pxl.country.abbreviation === ""))
                continue;
            if (oldMap != undefined && pxl.country.abbreviation == oldMap[y][x].country.abbreviation)
                continue;

            // TODO: pxl.x and pxl.y have faulty values! Fix them!
            // TODO: format print newMap and use it in python to validate its correctness
            let rectX = pxl.x * pixWidth;
            let rectY = pxl.y * pixHeight;
            let countryColor = (pxl.country == undefined || pxl.country.abbreviation == "") ? [0, 0, 0] : pxl.country.color;
            push();
            let c = color(countryColor);
            fill(c);
            noStroke();
            rect(rectX, rectY, pixWidth, pixHeight);
            pop();
        }
    }
    
    for (const b of boats) {
        if (b.lifespan > 0) {
            let rectX = b.x * gamePixelWidth;
            let rectY = b.y * gamePixelWidth;
            let c = color(255, 255, 255);
            // let c = color(b.country.color);
            push();
            fill(c);
            noStroke();
            rect(rectX, rectY, gamePixelWidth, gamePixelWidth);
            pop();
        }
    }
}


let worldMapMatrix, worldMapMatrixTwo, countries;
let boats;

// const gamePixelWidth = 100;
// const pixelWidthChoice = 25;
// const pixelScale = 100;
// const pixelScale = pixelWidthChoice;

// larger number makes each pixel larger on the screen
const gamePixelWidth = 4;
// resolution of the pixels on the screen (smaller number = more pixels on the screen)
const pixelScale = 3;
// json file to use (usually the same as or smaller than pixelScale)
const pixelWidthChoice = 3;


export const setup = async () => {
    ({worldMapMatrix, countries} = await genMap(`public/assets/maps_${pixelWidthChoice}.json`, pixelScale));

    let h = worldMapMatrix.length;
    let w = worldMapMatrix[0].length;

    let powers = {
        India: 5000,
        Japan: 12500
    }

    countries.forEach((country, abbrev) => {
        if (powers[country.name] !== undefined) {
            countries.get(abbrev).power = powers[country.name];
        }
        else {
            // countries.get(abbrev).power = len(country_points[country]);
            // countries.get(abbrev).power = (randomInRange(0, len(country_points[country])) + 1);
            // countries.get(abbrev).power = randomInRange(0, 1000);
            countries.get(abbrev).power = 100 + randomInRange(0, 25);
            // countries.get(abbrev).power = abs(1000 - randomInRange(0, len(country_points[country])));
        }
    });

    worldMapMatrixTwo = [];
    for (let y = 0, oneH = worldMapMatrix.length; y < oneH; ++y) {
        let matrixRow = [];
        for (let x = 0, oneW = worldMapMatrix[y].length; x < oneW; ++x) {
            matrixRow.push(Pixel.copyPixel(worldMapMatrix[y][x]));
        }
        worldMapMatrixTwo.push(matrixRow);
    }
    applyAdjacency(worldMapMatrixTwo);

    boats = [];

    createCanvas(w * gamePixelWidth, h * gamePixelWidth);
    // frameRate(2);
    background(0);

    console.log(width, height);
    console.log("MAIN: " , w, h);
    drawMap(worldMapMatrix, boats, false, gamePixelWidth);
}

const waitForMatrices = async () => {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (worldMapMatrix !== undefined && worldMapMatrixTwo !== undefined) {
                clearInterval(interval);
                resolve();
            }
            else {
                console.log("Waiting for matrices to be defined...");
            }
        }, 50);
    });
};

export const draw = async () => {
    await waitForMatrices();
    
    if (matrixOneIsMain) {
        await timeStep(worldMapMatrixTwo, worldMapMatrix, countries, boats);
        background(0);
        drawMap(worldMapMatrixTwo, boats, false, gamePixelWidth);
        matrixOneIsMain = false;
    }
    else {
        await timeStep(worldMapMatrix, worldMapMatrixTwo, countries, boats);
        background(0);
        drawMap(worldMapMatrix, boats, false, gamePixelWidth);
        matrixOneIsMain = true;
    }
}
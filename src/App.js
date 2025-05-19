import {genMap, applyAdjacency} from './utils/PixelMapGenerator.js';
import Constants, {abs, randomInRange} from './utils/Utils.js'
import Country from './models/Country.js'
import Pixel from './models/Pixel.js'
import Boat from './models/Boat.js'
import Directions from './models/Directions.js'
import Filter from './utils/Filter.js';

var conqueredCount = 0;
var matrixOneIsMain = true;

let customPowers = {};
let updatePowersBasedOnLand = true;
let boatsEnabled = true;
let customPixelScale = 3;
let customGamePixelWidth = 4;
let customPixelWidthChoice = 3;
let gameStarted = false;
let countryListContainer;

let canvasWidth;
let canvasHeight;

const colorScheme = {
    background: 'rgba(30, 30, 30, 0.95)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    inputBackground: 'rgba(255, 255, 255, 0.1)',
    inputBorder: 'rgba(255, 255, 255, 0.2)',
    buttonBackground: 'rgba(148, 137, 121, 1)',
    buttonBackgroundHover: 'rgba(223, 208, 184, 0.9)',
    titleColor: 'rgba(255, 255, 255, 1)',
    checkBoxAccentColor: 'rgba(148, 137, 121, 1)',
    selectColor: 'rgba(30, 30, 30, 1)',
};

async function timeStep(newMap, oldMap, countries, boats) {
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
                    if (boatsEnabled) {
                        if (!pixCountryRef || pixCountryRef.abbreviation === "") {
                            if (originalPixel.canBuildBoat && Math.random() < 0.001) {
                                boats.push(new Boat(countryRef, ds[Math.floor(Math.random() * ds.length)], power, pix.x, pix.y, 50));
                                originalPixel.canBuildBoat = false;
                            }
                            continue;
                        }
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
                    // pixel is conquered
                    if (Math.random() * absPowerDiff > absPowerDiff / 2) {
                        countryRef.power = Math.max(1, countryRef.power - 1);
                        pixlChoice.country.power += 1;
                        --newMap[y][x].country.numPixels;
                        newMap[y][x].country = pixlChoice.country;
                        ++newMap[y][x].country.numPixels;
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
    if (boatsEnabled) {
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
                    --pixelOccupiedByBoat.country.numPixels;
                    pixelOccupiedByBoat.country = b.country;
                    ++pixelOccupiedByBoat.country.numPixels;
                    b.lifespan = 0;
                }
            }
            else {
                b.lifespan = 0;
            }
        }

        boats.splice(0, boats.length, ...boats.filter(b => b.lifespan > 0));
    }
}

function drawMap(newMap, boats, drawWater, pixWidth, oldMap=undefined, pixHeight=pixWidth) {
    for (let y = 0, h = newMap.length; y < h; ++y) {
        for (let x = 0, w = newMap[y].length; x < w; ++x) {
            let pxl = newMap[y][x];

            if (!drawWater && (pxl.country === undefined || pxl.country.abbreviation === ""))
                continue;
            if (oldMap != undefined && pxl.country.abbreviation == oldMap[y][x].country.abbreviation)
                continue;

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
    
    if (boatsEnabled) {
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
}


let worldMapMatrix, worldMapMatrixTwo, countries;
let boats;


// let gamePixelWidth = 100;
// let pixelWidthChoice = 25;
// let pixelScale = 100;
// let pixelScale = pixelWidthChoice;

// larger number makes each pixel larger on the screen
let gamePixelWidth = 3.5;
// resolution of the pixels on the screen (smaller number = more pixels on the screen)
let pixelScale = 3;
// json file to use (usually the same as or smaller than pixelScale), only options are [1, 2, 3, 4, 8, 25]
let pixelWidthChoice = 3;


export const setup = async () => {
    /*
    Inputs:
     - powers (custom country powers or preselect function)
     - option to update countries powers based on land gained
     - option to toggle boats on and off
     - pixelScale, gamePixelWidth, pixelWidthChoice?
    */
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;

    createCanvas(windowWidth, windowHeight);
    background(0);

    let container = createDiv('');
    container.position(windowWidth/2-250, 50);
    container.style('background-color', colorScheme.background);
    container.style('padding', '40px');
    container.style('width', '500px');
    container.style('box-shadow', '0 8px 32px ' + colorScheme.shadow);
    container.style('backdrop-filter', 'blur(10px)');

    let title = createElement('h1', 'World War Simulator');
    title.parent(container);
    title.style('color', colorScheme.titleColor);
    title.style('text-align', 'center');
    title.style('margin-bottom', '40px');
    title.style('font-size', '32px');
    title.style('font-weight', '300');
    title.style('letter-spacing', '1px');

    let gridContainer = createDiv('');
    gridContainer.parent(container);
    gridContainer.style('display', 'grid');
    gridContainer.style('grid-template-columns', '1fr 1fr');
    gridContainer.style('gap', '24px');
    gridContainer.style('margin-bottom', '32px');

    let leftColumn = createDiv('');
    leftColumn.parent(gridContainer);
    leftColumn.style('display', 'flex');
    leftColumn.style('flex-direction', 'column');
    leftColumn.style('gap', '24px');

    let rightColumn = createDiv('');
    rightColumn.parent(gridContainer);
    rightColumn.style('display', 'flex');
    rightColumn.style('flex-direction', 'column');
    rightColumn.style('gap', '24px');
    rightColumn.style('width', '90%');

    let powersContainer = createDiv('');
    powersContainer.parent(container);
    powersContainer.style('margin-bottom', '32px');

    let powersLabel = createElement('label', 'Custom Country Powers');
    powersLabel.parent(powersContainer);
    powersLabel.style('color', colorScheme.titleColor);
    powersLabel.style('display', 'block');
    powersLabel.style('margin-bottom', '8px');
    powersLabel.style('font-size', '14px');
    powersLabel.style('opacity', '0.8');

    let powersLabelHelper = createElement('label', 'Example: {"India": 5000, "Japan": 12500}');
    powersLabelHelper.parent(powersContainer);
    powersLabelHelper.style('color', colorScheme.titleColor);
    powersLabelHelper.style('display', 'block');
    powersLabelHelper.style('margin-bottom', '8px');
    powersLabelHelper.style('font-size', '14px');
    powersLabelHelper.style('opacity', '0.8');

    let powersInput = createElement('textarea');
    powersInput.parent(powersContainer);
    powersInput.style('width', '95%');
    powersInput.style('height', '80px');
    powersInput.style('background-color', colorScheme.inputBackground);
    powersInput.style('border', '1px solid ' + colorScheme.inputBorder);
    powersInput.style('color', colorScheme.titleColor);
    powersInput.style('padding', '12px');
    powersInput.style('font-family', 'monospace');
    powersInput.style('resize', 'none');
    powersInput.value('{}');

    const createInputGroup = (parent, label, type, defaultValue, min = 0) => {
        let group = createDiv('');
        group.parent(parent);
        group.style('display', 'flex');
        group.style('flex-direction', 'column');
        group.style('gap', '8px');

        let labelElement = createElement('label', label);
        labelElement.parent(group);
        labelElement.style('color', colorScheme.titleColor);
        labelElement.style('font-size', '14px');
        labelElement.style('opacity', '0.8');

        let input;
        if (type === 'checkbox') {
            input = createCheckbox('', defaultValue);
            input.parent(group);
            input.style('width', '20px');
            input.style('height', '20px');
            input.style('accent-color', colorScheme.checkBoxAccentColor);
        } else if (type === 'select') {
            input = createSelect();
            input.parent(group);
            input.style('width', '100%');
            input.style('height', '36px');
            input.style('background-color', colorScheme.inputBackground);
            input.style('border', '1px solid ' + colorScheme.inputBorder);
            input.style('color', colorScheme.titleColor);
            input.style('padding', '0 12px');
            input.style('appearance', 'none');
            input.style('cursor', 'pointer');
            
            const options = [2, 3, 4, 8, 25];
            options.forEach(value => {
                let option = createElement('option', value.toString());
                option.value(value.toString());
                option.style('background-color', colorScheme.inputBackground);
                option.style('color', colorScheme.selectColor);
                option.parent(input);
            });
            
            input.value(defaultValue.toString());
        } else {
            input = createInput(defaultValue.toString(), 'number');
            input.parent(group);
            input.style('width', '100%');
            input.style('height', '36px');
            input.style('background-color', colorScheme.inputBackground);
            input.style('border', '1px solid ' + colorScheme.inputBorder);
            input.style('color', colorScheme.titleColor);
            input.style('padding', '0 12px');
            input.attribute('min', min);
        }

        return input;
    };

    // let updatePowersCheckbox = createInputGroup(leftColumn, 'Update power level based on land size', 'checkbox', true);
    let boatsCheckbox = createInputGroup(leftColumn, 'Enable boats', 'checkbox', true);
    let pixelScaleInput = createInputGroup(rightColumn, 'Pixel scale (recommended to be equal to map resolution)', 'number', pixelScale, 1);
    let gamePixelWidthInput = createInputGroup(rightColumn, 'Game pixel width (makes map larger or smaller)', 'number', gamePixelWidth, 1);
    let pixelWidthChoiceInput = createInputGroup(rightColumn, 'Map resolution (larger number means fewer pixels but higher performance', 'select', pixelWidthChoice);

    pixelWidthChoiceInput.changed(() => {
        const mapRes = parseInt(pixelWidthChoiceInput.value());
        const currentScale = parseInt(pixelScaleInput.value());
        if (currentScale < mapRes) {
            pixelScaleInput.value(mapRes);
        }
        pixelScaleInput.attribute('min', mapRes);
    });

    let button = createButton("Start Simulation");
    button.parent(container);
    button.style('width', '100%');
    button.style('height', '48px');
    button.style('background-color', colorScheme.buttonBackground);
    button.style('color', colorScheme.titleColor);
    button.style('border', 'none');
    button.style('cursor', 'pointer');
    button.style('font-size', '16px');
    button.style('font-weight', '500');
    button.style('transition', 'background-color 0.2s');
    button.mouseOver(() => button.style('background-color', colorScheme.buttonBackgroundHover));
    button.mouseOut(() => button.style('background-color', colorScheme.buttonBackground));

    button.mousePressed(() => {
        try {
            const mapRes = parseInt(pixelWidthChoiceInput.value());
            const scale = parseInt(pixelScaleInput.value());
            const pixelWidth = Number(gamePixelWidthInput.value());

            if (scale < mapRes) {
                throw new Error(`Pixel scale (${scale}) must be at least as large as map resolution (${mapRes})`);
            }
            if (scale <= 0 || pixelWidth <= 0) {
                throw new Error('Pixel scale and game pixel width must be greater than 0');
            }
            try {
                customPowers = JSON.parse(powersInput.value());
            } catch (error) {
                console.log('Invalid JSON input. Defaulting to empty powers.');
                customPowers = {};
            }
            // updatePowersBasedOnLand = updatePowersCheckbox.checked();
            boatsEnabled = boatsCheckbox.checked();
            customPixelScale = scale;
            customGamePixelWidth = pixelWidth;
            customPixelWidthChoice = mapRes;

            console.log("IN: ", customPixelScale, customGamePixelWidth, customPixelWidthChoice);
            console.log("DEFAULT: ", pixelScale, gamePixelWidth, pixelWidthChoice);

            pixelScale = customPixelScale;
            gamePixelWidth = customGamePixelWidth;
            pixelWidthChoice = customPixelWidthChoice;

            gameStarted = true;
            container.remove();
            initGame();
        } catch (error) {
            alert(error.message || 'Input error. Please check your input.');
            console.log(error);
        }
    });
}


async function initGame() {
    ({worldMapMatrix, countries} = await genMap(`public/assets/maps_${pixelWidthChoice}.json`, pixelScale));

    let h = worldMapMatrix.length;
    let w = worldMapMatrix[0].length;

    let powers = customPowers;

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
            const pixC = worldMapMatrix[y][x];
            if (pixC.country) {
                pixC.country.numPixels += 1;
            }
            matrixRow.push(Pixel.copyPixel(pixC));
        }
        worldMapMatrixTwo.push(matrixRow);
    }
    applyAdjacency(worldMapMatrixTwo);

    boats = [];

    console.log(width, height);
    console.log("MAIN: " , w, h);
    drawMap(worldMapMatrix, boats, false, gamePixelWidth);
    // countries.forEach((country, abbrev) => {
    //     console.log(country.name, country.numPixels);
    // });
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

function checkAndResizeCanvas() {
    const worldWidth = worldMapMatrix[0].length * gamePixelWidth;
    const worldHeight = worldMapMatrix.length * gamePixelWidth;
    const listWidth = 300; // Width of country list container
    const listHeight = 200; // Height of country list container
    const padding = 20; // Padding from edges

    const requiredWidth = Math.max(worldWidth + listWidth + padding * 3, windowWidth);
    const requiredHeight = Math.max(worldHeight + padding * 2, windowHeight);

    if (requiredWidth > canvasWidth || requiredHeight > canvasHeight) {
        canvasWidth = requiredWidth;
        canvasHeight = requiredHeight;
        resizeCanvas(canvasWidth, canvasHeight);
    }
}

function drawCountryList() {
    const countryArray = Array.from(countries.entries())
        .map(([abbrev, country]) => ({ abbrev, ...country }))
        .sort((a, b) => b.numPixels - a.numPixels);

    const worldWidth = worldMapMatrix[0].length * gamePixelWidth;
    const worldHeight = worldMapMatrix.length * gamePixelWidth;

    if (!countryListContainer) {
        countryListContainer = createDiv('');
        countryListContainer.position(worldWidth + 20, 20);
        countryListContainer.style('width', '300px');
        countryListContainer.style('height', '200px');
        countryListContainer.style('background-color', colorScheme.background);
        countryListContainer.style('padding', '15px');
        countryListContainer.style('overflow-y', 'auto');
        countryListContainer.style('color', 'white');
        countryListContainer.style('font-family', 'Arial, sans-serif');
    }

    let content = '<div style="font-size: 16px; margin-bottom: 10px; font-weight: bold;">Countries by Territory Size:</div>';
    
    countryArray.forEach(country => {
        content += `
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div style="width: 15px; height: 15px; background-color: rgb(${country.color.join(',')}); margin-right: 10px;"></div>
                <div style="font-size: 14px;">${country.name} (${country.abbrev}): ${country.numPixels >= 0 ? country.numPixels : 0} pixels | Power: ${country.power}</div>
            </div>
        `;
    });

    countryListContainer.html(content);
}

export const draw = async () => {
    if (!gameStarted) {
        return;
    }

    await waitForMatrices();
    checkAndResizeCanvas();

    const worldWidth = worldMapMatrix[0].length*gamePixelWidth;
    const worldHeight = worldMapMatrix.length*gamePixelWidth;
    background(0);
    push();
    fill(0, 0, 0, 0);
    stroke(255, 255, 255);
    rect(0, 0, worldWidth, worldHeight);
    pop();

    if (matrixOneIsMain) {
        await timeStep(worldMapMatrixTwo, worldMapMatrix, countries, boats);
        drawMap(worldMapMatrixTwo, boats, false, gamePixelWidth);
        matrixOneIsMain = false;
    }
    else {
        await timeStep(worldMapMatrix, worldMapMatrixTwo, countries, boats);
        drawMap(worldMapMatrix, boats, false, gamePixelWidth);
        matrixOneIsMain = true;
    }

    drawCountryList();
}
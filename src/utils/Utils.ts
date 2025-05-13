// from enum import Enum
// import json


const Constants = Object.freeze({
    MIN_LAT: -90,
    MAX_LAT: 90,
    MIN_LONG: -180,
    MAX_LONG: 180,
    COORD_SCALING_MAGNITUDE: 10**5,
    PIXEL_WIDTH: 2,
    OCEAN_COLOR: [29, 162, 216]
});

function abs(v: number): number {
    if (v < 0)
        return -v
    return v
}


function scale(scaleMin: number, scaleMax: number, valueMin: number, valueMax: number, value: number): number {
    /*
    Akin to the cpp map function.
    */
    return (value - valueMin) / (valueMax - valueMin) * (scaleMax - scaleMin) + scaleMin;
}

function readJsonAsDict(filePath: string): Object | null {
    /*
    Read json from a file and convert it into a python dict.
    */
    fetch('http://localhost:5500/' + filePath)
        .then((response) => response.json())
        .then((data) => {
            return data;
        })
        .catch((err) => console.error('Error loading JSON:', err));
    return null;
}

function random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default Constants;
export {abs, scale, readJsonAsDict, random};

console.log(readJsonAsDict("assets/maps_2.json"));
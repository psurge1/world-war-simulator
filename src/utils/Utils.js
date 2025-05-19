const Constants = Object.freeze({
    MIN_LAT: -90,
    MAX_LAT: 90,
    MIN_LONG: -180,
    MAX_LONG: 180,
    COORD_SCALING_MAGNITUDE: 10**5,
    PIXEL_WIDTH: 2,
    OCEAN_COLOR: [29, 162, 216]
});

function abs(v) {
    if (v < 0)
        return -v
    return v
}


function scale(scaleMin, scaleMax, valueMin, valueMax, value) {
    /*
    Akin to the cpp map function.
    */
    return ((value - valueMin) / (valueMax - valueMin) * (scaleMax - scaleMin)) + scaleMin;
}

async function readJsonAsDict(filePath) {
    /*
    Read json from a file and convert it into a python dict.
    */
    try {
        let response = await fetch(filePath);
        if (!response.ok) {
            response = await fetch(window.location.origin + '/' + filePath);
        }
        let data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading JSON file:', error);
        throw error;
    }
}

function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default Constants;
export {abs, scale, readJsonAsDict, randomInRange};
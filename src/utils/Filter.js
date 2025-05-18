class Filter {
    // static griddedPoints: Map<number, Set<number>> = new Map();
    static griddedPoints = new Map();
    static duplicates = 0;

    static resetPoints() {
        Filter.griddedPoints = new Map();
        Filter.duplicates = 0;
    }

    static gridScale(xValue, yValue, xOffset = 1, yOffset = 1) {
        // convert values to integers
        let xV = Math.floor(xValue / xOffset) * xOffset; // xOffset * xOffset
        let yV = Math.floor(yValue / yOffset) * yOffset; // yOffset * yOffset

        // round numbers to the nearest offset resolution (multiples of offset)
        // ex: If xOffset = 4, all x coords will be scaled to multiples of 4
        if (xValue % xOffset >= xOffset / 2)
            xV += xOffset;
        if (yValue % yOffset >= yOffset / 2)
            yV += yOffset;

        // add set if it doesn't exist yet for corresponding xV
        if (!Filter.griddedPoints.has(xV)) {
            Filter.griddedPoints.set(xV, new Set());
        }

        // check if scaled points are duplicate before adding them to gridded_points
        let retVal = [-1, -1];
        if (!Filter.griddedPoints.get(xV).has(yV)) {
            let s = Filter.griddedPoints.get(xV);
            s.add(yV);
            retVal = [xV, yV];
        }
        else {
            ++Filter.duplicates;
        }
        // if (xV == 575 && yV == 300)
        //     console.log(structuredClone(Filter.griddedPoints.get(575)));

        return retVal;
    }

    static getNumPoints() {
        let numFinalPoints = 0;
        Filter.griddedPoints.forEach((value, key) => {
            numFinalPoints += value.size;
        });
        return numFinalPoints;
    }

    static getNumDuplicates() {
        return Filter.duplicates;
    }
}

export default Filter;
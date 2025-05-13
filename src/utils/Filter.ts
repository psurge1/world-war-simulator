class Filter {
    static griddedPoints: Map<number, Set<number>> = new Map();

    static resetPoints() {
        Filter.griddedPoints = new Map();
    }

    static gridScale(xValue, yValue, xOffset=1, yOffset=1): number[] {
        // convert values to integers
        let xV = xValue; // xOffset * xOffset
        let yV = yValue; // yOffset * yOffset

        // round numbers to the nearest offset resolution (multiples of offset)
        // ex: If xOffset = 4, all x coords will be scaled to multiples of 4
        if (xValue % xOffset >= xOffset / 2)
            xV += xOffset;
        if (yValue % yOffset >= yOffset / 2)
            yV += yOffset;

        // check if scaled points are duplicate before adding them to gridded_points
        if (!Filter.griddedPoints.has(xV)) {
            Filter.griddedPoints.set(xV, new Set());
        }
        if (!Filter.griddedPoints.has(yV)) {
            let s = Filter.griddedPoints.get(xV);
            if (s !== undefined)
                s.add(yV);
            return [xV, yV];
        }
        else
            return [-1, -1];
    }

    static getNumPoints() {
        let numFinalPoints = 0;
        Filter.griddedPoints.forEach((value, key) => {
            numFinalPoints += value.size;
        });
        return numFinalPoints;
    }
}

export default Filter;
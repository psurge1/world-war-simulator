class filter {
    static griddedPoints = Map()

    static resetPoints() {
        filter.griddedPoints = Map()
    }

    static gridScale(x_value, y_value, x_offset=1, y_offset=1) {
        // convert values to integers
        x_v = x_value // x_offset * x_offset
        y_v = y_value // y_offset * y_offset

        // round numbers to the nearest offset resolution (multiples of offset)
        // ex: If x_offset = 4, all x coords will be scaled to multiples of 4
        if (x_value % x_offset >= x_offset / 2)
            x_v += x_offset
        if (y_value % y_offset >= y_offset / 2)
            y_v += y_offset

        // check if scaled points are duplicate before adding them to gridded_points
        if (!griddedPoints.has(x_v))
            filter.griddedPoints[x_v] = set()
        if (!griddedPoints.has(y_v)) {
            filter.griddedPoints[x_v].add(y_v)
            return (x_v, y_v);
        }
        else
            return (-1, -1);
    }

    static getNumPoints() {
        
    }
}
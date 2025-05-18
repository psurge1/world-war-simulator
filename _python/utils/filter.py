class filter:
    """ A support class to filter out duplicate coordinates in a world map grid.
    Duplicate points may occur due to scaling down map data to smaller resolutions.
    Removing duplicate points ensures only one pixel is rendered at a given coordinate.

    Attributes:
        gridded_points: A static dictionary formatted as a matrix. Each entry in this dictionary has key: x value, value: a set of y values.
            It is used to ensure no duplicate coordinates are added to the world map.
    """
    gridded_points: dict[int, set[int]] = dict()
    num_duplicates: int = 0

    @staticmethod
    def reset_points():
        """ Clears the gridded_points dictionary. Prepares the class for another filtering attempt.
        """
        filter.gridded_points = dict()
        filter.num_duplicates = 0

    @staticmethod
    def grid_scale(x_value, y_value, x_offset=1, y_offset=1):
        """ Scale points to multiples of offset (to ensure a proper grid), and remove duplicates.
        """

        # convert values to integers
        x_v = x_value // x_offset * x_offset
        y_v = y_value // y_offset * y_offset

        # round numbers to the nearest offset resolution (multiples of offset)
        # ex: If x_offset = 4, all x coords will be scaled to multiples of 4
        if x_value % x_offset >= x_offset / 2:
            x_v += x_offset
        if y_value % y_offset >= y_offset / 2:
            y_v += y_offset

        # check if scaled points are duplicate before adding them to gridded_points
        if x_v not in filter.gridded_points:
            filter.gridded_points[x_v] = set()
        if y_v not in filter.gridded_points[x_v]:
            filter.gridded_points[x_v].add(y_v)
            return (x_v, y_v)
        else:
            filter.num_duplicates += 1
            return (-1, -1)

    @staticmethod
    def get_num_points():
        """ Returns the number of points currently in the grid (with duplicates filtered out).
        """
        num_final_points = 0
        for key in filter.gridded_points.keys():
            num_final_points += len(filter.gridded_points[key])
        return num_final_points

    @staticmethod
    def get_num_duplicates():
        """ Returns the number of duplicate points that were filtered out.
        """
        return filter.num_duplicates
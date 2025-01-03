class filter:
    gridded_points: dict[int, set[int]] = dict()

    @staticmethod
    def reset_points():
        global gridded_points
        gridded_points = dict()

    @staticmethod
    def grid_scale(x_value, y_value, x_offset=1, y_offset=1):
        global gridded_points
        x_v = x_value // x_offset * x_offset
        y_v = y_value // y_offset * y_offset

        if x_value % x_offset >= x_offset / 2:
            x_v += x_offset
        if y_value % y_offset >= y_offset / 2:
            y_v += y_offset

        if x_v not in gridded_points:
            gridded_points[x_v] = set()
        if y_v not in gridded_points[x_v]:
            gridded_points[x_v].add(y_v)
            return (x_v, y_v)
        else:
            return (-1, -1)

    @staticmethod
    def get_num_points():
        num_final_points = 0
        for key in gridded_points.keys():
            num_final_points += len(gridded_points[key])
        return num_final_points
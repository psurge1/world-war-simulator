# from pixel import Pixel

class Country:
    def __init__(self, name:str, abbreviation:str, color:tuple[int, int, int], power:int=10, connection_power:int=1):
        self._name = name
        self._abbreviation = abbreviation
        self._color = color
        # self._pixels = pixels
        self._power = power
        self._connection_power = connection_power
        self._conflicts: set[Country] = set()
        self._size = 0
        self._conflicts_tracker = 1
    
    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value:str):
        self._name = value
    
    @property
    def abbreviation(self):
        return self._abbreviation
    
    @abbreviation.setter
    def abbreviation(self, value:str):
        self._abbreviation = value
    
    # @property
    # def pixels(self):
    #     return self._pixels
    
    # @pixels.setter
    # def pixels(self, value:list[Pixel]):
    #     self._pixels = value
    @property
    def color(self):
        return self._color
    
    @color.setter
    def color(self, value:tuple[int, int, int]):
        self._color = value

    @property
    def power(self):
        return self._power
    
    @power.setter
    def power(self, value:int):
        self._power = value

    @property
    def connection_power(self):
        return self._connection_power

    @connection_power.setter
    def connection_power(self, value:int):
        self._connection_power = value
    
    @property
    def conflicts(self):
        return self._conflicts
    
    @conflicts.setter
    def conflicts(self, value:set):
        self._conflicts = value
    
    @property
    def conflicts_tracker(self):
        return self._conflicts_tracker
    
    @conflicts_tracker.setter
    def conflicts_tracker(self, value:int):
        self._conflicts_tracker = value
    
    @property
    def size(self):
        return self._size
    
    @size.setter
    def size(self, value:int):
        self._size = value
    
    # def append_adjacent_pixel(self, value:Pixel):
    #     self.pixels.append(value)
    
    # def remove_adjacent_pixel(self, value:Pixel):
    #     try:
    #         self.pixels.remove(value)
    #     except:
    #         print("Pixel not found!")

    def __str__(self):
        return f"[{self.name}, {self.abbreviation}, {self.power}, {self.connection_power}, {self.color}]"
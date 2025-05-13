# import copy
from models.country import Country

class BasePixel:
    def __init__(self, x:int, y:int):
        self._x = x
        self._y = y
    
    @property
    def x(self):
        return self._x
    
    @x.setter
    def x(self, value: int):
        self._x = value
    
    @property
    def y(self):
        return self._y
    
    @y.setter
    def y(self, value: int):
        self._y = value
    
    def __eq__(self, other):
        if isinstance(other, BasePixel):
            return self.x == other.x and self.y == other.y
        return False

class Pixel(BasePixel):
    def __init__(self, x:int, y:int, country:Country = None, adjacent_pixels:list = None, cooldown:int = 0, can_build_boat:bool = True):
        super().__init__(x, y)
        self._country = country
        # self._country_abbreviation = country_abbreviation
        # self._color = color
        self._adjacent_pixels: list[Pixel] = [] if adjacent_pixels is None else adjacent_pixels
        self._cooldown_cap = cooldown
        self._cooldown = cooldown
        self._can_build_boat = can_build_boat
    
    @property
    def country(self):
        return self._country
    
    @country.setter
    def country(self, value:Country):
        self._country = value

    @property
    def cooldown(self):
        return self._cooldown
    
    @cooldown.setter
    def cooldown(self, value:int):
        self._cooldown = value

    @property
    def cooldown_cap(self):
        return self._cooldown_cap
    
    @cooldown_cap.setter
    def cooldown_cap(self, value:int):
        self._cap = value

    # @property
    # def country_abbreviation(self):
    #     return self._country_abbreviation
    
    # @country_abbreviation.setter
    # def country_abbreviation(self, value: str):
    #     self._country_abbreviation = value
    
    # @property
    # def color(self):
    #     return self._color
    
    # @color.setter
    # def color(self, value: tuple[int, int, int]):
    #     self._color = value
    
    @property
    def adjacent_pixels(self):
        return self._adjacent_pixels
    
    @adjacent_pixels.setter
    def adjacent_pixels(self, value: list):
        self._adjacent_pixels = value
    
    @property
    def can_build_boat(self):
        return self._can_build_boat
    
    @can_build_boat.setter
    def can_build_boat(self, value:bool):
        self._can_build_boat = value

    @staticmethod
    def copyPixel(pixel):
        return Pixel(pixel.x, pixel.y, pixel.country, [], pixel.cooldown, pixel.can_build_boat)
    
    def updateWith(self, pixel):
        self.x = pixel.x
        self.y = pixel.y
        self.country = pixel.country
        self.cooldown_cap = pixel.cooldown_cap
        self.cooldown = pixel.cooldown
        self.can_build_boat = pixel.can_build_boat
    
    def add_adjacent_pixel(self, pixel):
        self.adjacent_pixels.append(pixel)
    
    def remove_adjacent_pixel(self, pixel):
        try:
            self.adjacent_pixels.remove(pixel)
        except:
            print("Adjacent pixel not found!")
    
    def __str__(self):
        return f"[\n\tlocation: ({self.x}, {self.y})\n\tcountry: {self.country}\n\tadjacent cells: {self.adjacent_pixels}\n]"
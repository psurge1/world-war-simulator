from models.country import Country
from models.directions import Direction

class Boat:
    def __init__(self, country: Country, direction: Direction, power: int, x: int, y: int, lifespan: int, under_pixel_color: tuple[int, int, int]):
        self._country = country
        self._direction = direction
        self._power = power
        self._x = x
        self._y = y
        self._lifespan = lifespan
        self._under_pixel_color = under_pixel_color
    
    @property
    def country(self) -> Country:
        return self._country
    
    @country.setter
    def country(self, value:Country):
        self._country = value
    
    @property
    def direction(self) -> Direction:
        return self._direction
    
    @direction.setter
    def direction(self, value:Direction):
        self._direction = value
    
    @property
    def power(self) -> int:
        return self._power
    
    @power.setter
    def power(self, value:int):
        self._power = value
    
    @property
    def x(self) -> int:
        return self._x
    
    @x.setter
    def x(self, value:int):
        self._x = value
    
    @property
    def y(self) -> int:
        return self._y

    @y.setter
    def y(self, value:int):
        self._y = value
    
    @property
    def lifespan(self):
        return self._lifespan
    
    @lifespan.setter
    def lifespan(self, value:int):
        self._lifespan = value
    
    @property
    def under_pixel_color(self):
        return self._under_pixel_color
    
    @under_pixel_color.setter
    def under_pixel_color(self, value:tuple[int, int, int]):
        self._under_pixel_color = value
    
    @staticmethod
    def color():
        return (255, 255, 255)
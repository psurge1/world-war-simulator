class Pixel:
    def __init__(self, x:int = 0, y:int = 0, country:str = "NaN", color:tuple[int] = (0, 0, 0)):
        self._x = x
        self._y = y
        self._country = country
        self._color = color
    
    @property
    def x(self):
        return self._x
    
    @x.setter
    def x(self, value):
        self._x = value
    
    @property
    def y(self):
        return self._y
    
    @y.setter
    def y(self, value):
        self._y = value
    
    @property
    def country(self):
        return self._country
    
    @country.setter
    def country(self, value):
        self._country = value
    
    @property
    def color(self):
        return self._color
    
    @color.setter
    def color(self, value):
        self._color = value
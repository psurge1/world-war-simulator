import Country from "./Country";
// import Directions from "./Directions";

class Boat {
    country: Country;
    direction: number;
    power: number;
    x: number;
    y: number;
    lifespan: number;
    static color: number[] = [255, 255, 255];

    constructor(country: Country, direction: number, power: number, x: number, y: number, lifespan: number) {
        this.country = country;
        this.direction = direction;
        this.power = power;
        this.x = x;
        this.y = y;
        this.lifespan = lifespan;
    }
}

export default Boat;
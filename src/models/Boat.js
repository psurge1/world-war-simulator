import Country from "./Country.js";
import Directions from "./Directions.js";

class Boat {
    // country: Country;
    // direction: number;
    // power: number;
    // x: number;
    // y: number;
    // lifespan: number;
    // static color: number[] = [255, 255, 255];

    constructor(country, direction, power, x, y, lifespan) {
        this.country = country;
        this.direction = direction;
        this.power = power;
        this.x = x;
        this.y = y;
        this.lifespan = lifespan;
    }
}

export default Boat;
import Country from "./Country.js";

class BasePixel {
    // x: number;
    // y: number;
    
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Pixel extends BasePixel {
    // country: Country | null;
    // adjacentPixels: Pixel[];
    // cooldownCap: number;
    // cooldown: number;
    // canBuildBoat: boolean;
    
    constructor(x, y, country = null, adjacentPixels = [], cooldown = 0, canBuildBoat = true) {
        super(x, y);
        this.country = country;
        this.adjacentPixels = adjacentPixels;
        this.cooldownCap = cooldown;
        this.cooldown = cooldown
        this.canBuildBoat = canBuildBoat;
    }
    // get country() {
    //     return this.country;
    // }

    updateWith(pixel) {
        this.x = pixel.x;
        this.y = pixel.y;
        this.country = pixel.country;
        this.cooldownCap = pixel.cooldownCap;
        this.cooldown = pixel.cooldown;
        this.canBuildBoat = pixel.canBuildBoat;
    }

    removeAdjacentPixel(pixel) {
        try {
            const index = this.adjacentPixels.indexOf(pixel);
            if (index > -1)
                this.adjacentPixels.splice(index, 1);
        }
        catch {
            console.log("Adjacent pixel not found!");
        }
    }

    addAdjacentPixel(pixel) {
        this.adjacentPixels.push(pixel);
    }

    static copyPixel(pixel) {
        return new Pixel(pixel.x, pixel.y, pixel.country, [], pixel.cooldown, pixel.canBuildBoat);
    }
}


export default Pixel;
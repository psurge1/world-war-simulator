import Country from "./Country";

class BasePixel {
    x: number;
    y: number;
    
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class Pixel extends BasePixel {
    country: Country | null;
    adjacentPixels: Pixel[];
    cooldownCap: number;
    cooldown: number;
    canBuildBoat: boolean;
    
    constructor(x: number, y: number, country: Country | null = null, adjacentPixels: Pixel[] = [], cooldown: number = 0, canBuildBoat: boolean = true) {
        super(x, y);
        this.country = country;
        this.adjacentPixels = adjacentPixels;
        this.cooldownCap = cooldown;
        this.cooldown = cooldown
        this.canBuildBoat = canBuildBoat;
    }

    updateWith(pixel: Pixel) {
        this.x = pixel.x;
        this.y = pixel.y;
        this.country = pixel.country;
        this.cooldownCap = pixel.cooldownCap;
        this.cooldown = pixel.cooldown;
        this.canBuildBoat = pixel.canBuildBoat;
    }

    addAdjacentPixel(pixel: Pixel) {
        this.adjacentPixels.push(pixel);
    }

    removeAdjacentPixel(pixel: Pixel) {
        try {
            const index = this.adjacentPixels.indexOf(pixel);
            if (index > -1)
                this.adjacentPixels.splice(index, 1);
        }
        catch {
            console.log("Adjacent pixel not found!");
        }
    }

    static copyPixel(pixel) {
        return new Pixel(pixel.x, pixel.y, pixel.country, [], pixel.cooldown, pixel.canBuildBoat);
    }
}

export default Pixel;
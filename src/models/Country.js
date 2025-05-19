class Country {
    // name: string;
    // abbreviation: string;
    // color: number[];
    // power: number;
    // connectionPower: number;
    // conflicts: Set<Country>;
    // size: number;
    // conflictsTracker: number;

    constructor(name, abbreviation, color, power, connectionPower=1, numPixels=0) {
        this.name = name;
        this.abbreviation = abbreviation;
        this.color = color;
        // this.pixels = pixels;
        this.power = power;
        this.connectionPower = connectionPower;
        this.conflicts = new Set();
        this.size = 0;
        this.conflictsTracker = 1;
        this.numPixels = numPixels;
    }
}

export default Country;
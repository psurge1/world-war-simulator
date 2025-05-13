class Country {
    name: string;
    abbreviation: string;
    color: number[];
    power: number;
    connectionPower: number;
    conflicts: Set<Country>;
    size: number;
    conflictsTracker: number;

    constructor(name: string, abbreviation: string, color: number[], power: number, connectionPower: number) {
        this.name = name;
        this.abbreviation = abbreviation;
        this.color = color;
        // this.pixels = pixels;
        this.power = power;
        this.connectionPower = connectionPower;
        this.conflicts = new Set();
        this.size = 0;
        this.conflictsTracker = 1;
    }
}

export default Country;
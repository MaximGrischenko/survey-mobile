export class GPSCoordinate {
    latitude: number;
    longitude: number;

    constructor(coordinate: Array<number>) {
        this.latitude = coordinate[1];
        this.longitude = coordinate[0];
    }
}

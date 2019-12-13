import Main from './Main';
import {Geometry} from './Geometry';
import {GPSCoordinate} from "./GPSCoordinate";

export class Parcel extends Main {
    pathList: Array<GPSCoordinate>;
    wojewodztw: string;
    gmina: string;
    numer: string;
    owmership: string;

    static edit_keys: Array<string> = [
        'wojewodztw',
        'numer',
        'gmina',
    ];

    constructor(data: any = {points: new Geometry()}) {

        super(data);
        this.gmina = data.gmina || '';
        this.numer = data.numer || '';
        this.wojewodztw = data.wojewodztw || '';
        this.owmership = data.owmership || '';

        this.pathList = [];
        for (let j = 0; j < this.points.coordinates.length; j++) {
            const _points = this.points.coordinates[j];
            for (let k = 0; k < _points.length; k++) {
                for (let dd = 0; dd < _points[k].length; dd++) {
                    this.pathList.push(new GPSCoordinate(_points[k][dd]));
                }
            }
        }
        if (data instanceof Parcel) return data;
    }

    editKeys() {
        return Parcel.edit_keys
    }

    keys() {
        return [
            ...super.keys(),
            ...this.editKeys()
        ];
    }
}

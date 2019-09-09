import Main from './Main';
import {Pole} from './Pole';
import {GPSCoordinate} from "./GPSCoordinate";

export class Segment extends Main {
    pathList: Array<GPSCoordinate>;

    poles: Array<Pole> = [];
    nazwa_linii: any;
    nazwa_ciagu_id: any;
    NAZWA_TAB: any;
    przeslo: any;
    static edit_keys: Array<string> = [
        'nazwa_linii',
        'NAZWA_TAB',
        'nazwa_ciagu_id',
        'przeslo',
    ];

    constructor(data: any = {poles: []}) {

        super(data);
        this.nazwa_linii = data.nazwa_linii || '';
        this.nazwa_ciagu_id = data.nazwa_ciagu_id || '';
        this.NAZWA_TAB = data.NAZWA_TAB || '';
        this.przeslo = data.przeslo || '';

        this.pathList = [];
        for (let j = 0; j < this.points.coordinates.length; j++) {
            const _points = this.points.coordinates[j];
            for (let k = 0; k < _points.length; k++) {
                this.pathList.push(new GPSCoordinate(_points[k]));
            }
        }
        if (data instanceof Segment) return data;
    }


    editKeys() {
        return Segment.edit_keys;
    }

    keys() {
        return [
            ...super.keys(),
            ...this.editKeys()
        ];
    }
}

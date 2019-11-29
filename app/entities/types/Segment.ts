import Main from './Main';
import {Pole} from './Pole';
import {GPSCoordinate} from "./GPSCoordinate";

export class Segment extends Main {
    pathList: Array<GPSCoordinate>;

    poles: Array<Pole> = [];
    vegetation_status: number = 0;
    distance_bottom: number = 0;
    distance_lateral: number = 0;
    time_for_next_entry: any;
    parcel_number_for_permit: number = 0;
    time_of_operation: number = 1;
    shutdown_time: number = 1;
   // notes: string = '';
    operation_type: any = '';
    track: number = 1;
   // nazwa_linii: any;
    nazwa_ciagu_id: any;
   // NAZWA_TAB: any;
    przeslo: any;
    static edit_keys: Array<string> = [
       // 'nazwa_linii',
       // 'NAZWA_TAB',
        'nazwa_ciagu_id',
        'przeslo',
    ];

    constructor(data: any = {poles: []}) {
        super(data);
        // this.nazwa_linii = data.nazwa_linii || '';
        this.nazwa_ciagu_id = data.nazwa_ciagu_id || '';
        // this.NAZWA_TAB = data.NAZWA_TAB || '';
        this.vegetation_status = data.vegetation_status || 0;
        this.distance_lateral = data.distance_lateral || 0;
        this.time_of_operation = data.time_of_operation || 1;
        this.distance_bottom = data.distance_bottom || 0;
        this.parcel_number_for_permit = data.parcel_number_for_permit || 0;
        this.time_for_next_entry = data.time_for_next_entry||"";
        this.operation_type = data.operation_type || '';
        this.operation_type = this.operation_type && (typeof this.operation_type === 'string') ? this.operation_type.split(", ") : [];
        this.track = data.track || 1;
        this.shutdown_time = data.shutdown_time || 1;
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

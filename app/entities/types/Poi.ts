import Main from './Main';
import {Geometry} from './Geometry';

export class Poi extends Main {

    constructor(data: any = {points: new Geometry()}) {
        super(data);
        if (data instanceof Poi) return data;
    }


    editKeys() {
        return []
    }

    keys() {
        return [
            ...super.keys(),
            ...this.editKeys()
        ];
    }
}

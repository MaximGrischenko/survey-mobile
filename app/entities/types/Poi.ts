import Main from './Main';
import {Geometry} from './Geometry';

export class Poi extends Main {

    categoryId: number;

    constructor(data: any = {points: new Geometry()}) {
        super(data);
        this.categoryId = data.categoryId || 1;
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

import Main from './Main';
import {Geometry} from './Geometry';

export class Pole extends Main {
    num_slup: string;
    static edit_keys: Array<string> = [
        'num_slup'
    ];

    constructor(data: any) {
        super(data);

        this.num_slup = data.num_slup || '';
        if (data instanceof Pole) return data;
    }

    editKeys() {
        return Pole.edit_keys
    }

    keys() {
        return [
            ...super.keys(),
            ...this.editKeys()
        ];
    }
}

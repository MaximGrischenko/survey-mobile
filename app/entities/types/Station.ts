import Main from './Main';
import {Geometry} from './Geometry';

export class Station extends Main {
    nazw_stac: string;
    num_eksp_s: string;
    static edit_keys: Array<string> = [
        'nazw_stac',
        'num_eksp_s',
    ];

    constructor(data: any = {points: new Geometry()}) {

        super(data);
        this.num_eksp_s = data.num_eksp_s || '';
        this.nazw_stac = data.nazw_stac || '';
        if (data instanceof Station) return data;
    }

    editKeys() {
        return Station.edit_keys
    }

    keys() {
        return [
            ...super.keys(),
            ...this.editKeys()
        ];
    }
}

import MainGlobal from './MainGlobal';
import {API} from '../../config';

export class Upload extends MainGlobal {
    path: string;
    metadata: string;

    constructor(data: any = {}) {

        super(data);
        this.path = API + data.path || '';
        this.metadata = data.metadata || '';
    }
}

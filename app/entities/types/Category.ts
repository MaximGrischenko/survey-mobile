import Main from './Main';

export class Category extends Main {
    constructor(data: any = {}) {
        super(data);

        if(data instanceof Category) return data;
    }
}
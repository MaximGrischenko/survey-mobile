import Main from './Main';

export class Project extends Main {

    constructor(data: any = {}) {
        super(data);
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

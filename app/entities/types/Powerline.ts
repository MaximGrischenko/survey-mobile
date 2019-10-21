import Main from './Main';

export class Powerline extends Main {

    // project_powerline: any;

    constructor(data: any = {}) {
        super(data);
        // this.project_powerline = data.project_powerline;
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

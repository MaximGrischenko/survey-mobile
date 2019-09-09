import Main from './Main';
import {User} from './User';

export class Log extends Main {
    ip: string;
    action: string;
    description: string;
    user: User;

    constructor(data: any = {}) {

        super(data);
        this.ip = data.ip;
        this.action = data.action;
        this.description = data.description;
        this.user = new User(data.user ||{});
        if (data instanceof Log) return data;
    }
}

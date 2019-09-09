import Main from './Main';

export class User extends Main {
    email: string;
    firstName: string;
    secondName: string;
    role: number;

    constructor(data: any = {}) {

        super(data);
        this.email = data.email;
        this.firstName = data.firstName;
        this.secondName = data.secondName;
        this.role = data.role;
        if (data instanceof User) return data;
    }
}

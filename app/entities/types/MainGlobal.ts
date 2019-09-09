export default class MainGlobal {
    id: number;
    key: string;
    createdAt: any;
    updatedAt: any;
    deletedAt: any;
    userId: number = -1;

    constructor(data: any = {}) {
        this.id = data.id;
        this.key = "_" + data.id;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.deletedAt = data.deletedAt;
        this.userId = data.userId;
    }
}

import {Geometry} from "./Geometry";
import MainGlobal from "./MainGlobal";
import {Upload} from "./Upload";


export default class Main extends MainGlobal {
    uploads: Array<any>;
    status: any = 1;
    type: string = '';
    title: string = '';
    comment: string = '';
    description: string = '';
    projectId: number = -1;
    powerLineId: number = -1;
    points: Geometry = new Geometry();
    WKT: string = '';

    constructor(data: any = {points: new Geometry()}) {
        super(data);
        this.status = data.status;
        this.title = data.title;
        this.comment = data.comment;
        this.description = data.description;
        this.projectId = data.projectId;
        this.powerLineId = data.powerLineId || -1;

        if (data.points) {
            const points = typeof data.points === 'string' ? JSON.parse(data.points) : data.points;
            this.points = new Geometry(points.type, points.coordinates);
        }
        this.uploads = [];
        if (Array.isArray(data.uploads)) {
            this.uploads = data.uploads.map((el: any) => new Upload(el))
        }

        this.toWKT();

    }

    keys() {
        return [
            'id',
            'status',
            'comment',
            'type',
            'title',
            'description',
            'createdAt',
            'updatedAt',
            'deletedAt',
        ];
    }

    private toWKT() {
        if (this.points) this.WKT = this.points.toWKT();
    }
}

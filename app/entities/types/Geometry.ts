import {GPSCoordinate} from './GPSCoordinate';
import _ from 'lodash';

export const Geometry_TYPE: any = {
    POINT: 'Point',
    POLYGON: 'Polygon',
    MultiLineString: 'MultiLineString',
    MultiPolygon: 'MultiPolygon',
}

export class Geometry {
    type: string;
    coordinates: Array<any> = [];

    static TYPE = {
        POINT: Geometry_TYPE.POINT,
        POLYGON: Geometry_TYPE.POLYGON,
        MultiLineString: Geometry_TYPE.MultiLineString,
        MultiPolygon: Geometry_TYPE.MultiPolygon,
    };

    constructor(type: string = Geometry_TYPE.POINT, coordinates: Array<any> = []) {
        this.type = type;

        switch (type) {
            case Geometry.TYPE.MultiPolygon: {
                this.coordinates = coordinates;
                break;
            }
            case Geometry.TYPE.MultiLineString: {
                this.coordinates = coordinates;
                break;
            }
            case Geometry.TYPE.POLYGON: {
                this.coordinates = [coordinates];
                break;
            }
            case Geometry.TYPE.POINT: {
                this.coordinates = coordinates;
                break;
            }
        }

    }

    toGPS(): any {
        const coordinate = JSON.parse(JSON.stringify((this.coordinates)));
        switch (this.type) {
            case Geometry_TYPE.POINT: {
                return new GPSCoordinate(coordinate)
            }
            case Geometry_TYPE.MultiLineString: {
                return coordinate.map((els: Array<Array<number>>) => {
                    // return el.map.viewer((els: Array<Array<number>>) => {
                    return els.map((point: any) => new GPSCoordinate(point));
                    // })
                });
            }
            case Geometry_TYPE.POLYGON: {
                return coordinate.map((el: Array<Array<Array<number>>>) => {
                    return el.map((els: Array<Array<number>>) => {
                        return els.map((point: Array<number>) => new GPSCoordinate(point));
                    })
                });
            }
            case Geometry_TYPE.MultiPolygon: {
                return coordinate.map((el: Array<Array<Array<number>>>) => {
                    return el.map((els: Array<Array<number>>) => {
                        return els.map((point: Array<number>) => new GPSCoordinate(point));
                    })
                });
            }
        }
    }
    toWKT(): any {
        const coordinate = JSON.parse(JSON.stringify((this.coordinates)));
        switch (this.type) {
            case Geometry_TYPE.POINT: {
                return `POINT(${coordinate[0]} ${coordinate[1]})`
            }
            case Geometry_TYPE.MultiLineString: {
                let str = `MULTILINESTRING((`;
                let str1 = ``;
                coordinate.forEach((els: Array<Array<number>>) => {
                    return els.forEach((point: Array<number>) => str1 += `${point[0]} ${point[1]},`)
                });
                if (str1.length) str1 = str1.substr(0, str1.length - 1);
                str += str1 + "))";
                return str;
            }
            case Geometry_TYPE.POLYGON: {
                let str = `Polygon(((`;
                let str1 = ``;
                coordinate.forEach((el: Array<Array<Array<number>>>) => {
                    return el.forEach((els: Array<Array<number>>) => {
                        return els.forEach((point: Array<number>) => str1 += `${point[0]} ${point[1]},`)
                    })
                });
                if (str1.length) str1 = str1.substr(0, str1.length - 1);
                str += str1 + ")))";
                return str;
            }
            case Geometry_TYPE.MultiPolygon: {
                let str = `MULTIPOLYGON(((`;
                let str1 = ``;
                coordinate.map((el: Array<Array<Array<number>>>) => {
                    return el.map((els: Array<Array<number>>) => {
                        return els.map((point: Array<number>) => str1 += `${point[0]} ${point[1]},`);
                    })
                });
                if (str1.length) str1 = str1.substr(0, str1.length - 1);
                str += str1 + ")))";
                return str;
            }
        }
    }
}

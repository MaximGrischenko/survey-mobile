import axios from 'react-native-axios';
import {SQLite} from "expo-sqlite";
import {WebSQLDatabase} from "expo-sqlite/build/SQLite";
import {API} from "../config";
import {Powerline, Project} from "../entities";
import PromisePiper from '../../'


// interface Emitter {
//     attach(observer: Observer): void;
//     detach(observer: Observer): void;
//     notify(): void;
// }

// class Emitter implements Emitter {
//     public status: string;
//     private observers: Observer[] = [];
//     public attach(observer: Observer): void {
//         this.observers.push(observer);
//     };
//     public detach(observer: Observer): void {
//         const index = this.observers.indexOf(observer);
//         this.observers.splice(index, 1);
//     };
//     public notify(): void {
//         for(const observer of this.observers) {
//             observer.update(this);
//         }
//     };
//
//     public updateStatus(status: string): void {
//         this.status = status;
//         this.notify();
//     }
// }

interface Observer {
    update(emitter: { isOpen: boolean; isCreated: boolean; isUploaded: boolean }): void;
}

// const emitter = new Emitter();
// emitter.attach(observer);


export interface IDatabase {
   // connect(): Promise<WebSQLDatabase>,
   // close(): Promise<void>,
    initDB(): void;
    dropDB(): void;
    syncBD(): void;
    attach(observer: Observer): void;
    detach(observer: Observer): void;
    notify(): void;
}

export class Database implements IDatabase {
    private readonly database: Promise<WebSQLDatabase>;
    private readonly LIMIT_TO_LOAD: number;
    private projects: Array<Project>;
    private powerlines: Array<Powerline>;

    private state: {
      isOpen: boolean,
      isCreated: boolean,
      isUploaded: boolean,
    };

    public status: string;
    private observers: Observer[] = [];
    public attach(observer: Observer): void {
        this.observers.push(observer);
    };
    public detach(observer: Observer): void {
        const index = this.observers.indexOf(observer);
        this.observers.splice(index, 1);
    };
    public notify(): void {
        for(const observer of this.observers) {
            observer.update(this.state);
        }
    };

    public updateStatus(status: string): void {
        this.status = status;
        this.notify();
    }

    private tables = [
        {
            name: 'projects',
            create: 'CREATE TABLE IF NOT EXISTS projects (cloudId INTEGER, title VARCHAR(255), contractor VARCHAR(255), status INTEGER DEFAULT 1, createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(cloudId));',
            delete: 'DROP TABLE IF EXISTS projects;'
        },
        {
            name: 'powerlines',
            create: 'CREATE TABLE IF NOT EXISTS powerlines (cloudId INTEGER, title VARCHAR(255), status INTEGER DEFAULT 1, comment VARCHAR(255), userId INTEGER, createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(cloudId))',
            delete: 'DROP TABLE IF EXISTS powerlines;'
        },
        {
            name: 'stations',
            create: 'CREATE TABLE IF NOT EXISTS stations (cloudId INTEGER, title VARCHAR(255), description VARCHAR(255), nazw_stac VARCHAR(255), num_eksp_s VARCHAR(255), comment VARCHAR(255), type INTEGER DEFAULT 0, status INTEGER, userId INTEGER, projectId INTEGER, points TEXT, createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(cloudId));',
            delete: 'DROP TABLE IF EXISTS stations;'
        },
        {
            name: 'pois',
            create: 'CREATE TABLE IF NOT EXISTS pois (cloudId INTEGER, title VARCHAR(255), description VARCHAR(255), points TEXT, comment VARCHAR(255), status INTEGER DEFAULT 1, userId INTEGER, projectId INTEGER, categoryId INTEGER, createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(cloudId))',
            delete: 'DROP TABLE IF EXISTS pois;'
        },
        {
            name: 'parcels',
            create: 'CREATE TABLE IF NOT EXISTS parcels(cloudId INTEGER, comment VARCHAR(255), title VARCHAR(255), points TEXT, wojewodztw VARCHAR(255), gmina VARCHAR(255), description VARCHAR(255), numer VARCHAR(255), status INTEGER DEFAULT 1, userId INTEGER, powerLineId INTEGER, projectId INTEGER, createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(cloudId))',
            delete: 'DROP TABLE IF EXISTS parcels'
        },
        {
            name: 'poles',
            create: 'CREATE TABLE IF NOT EXISTS poles (cloudId INTEGER, title VARCHAR(255), description VARCHAR(255), comment VARCHAR(255), type INTEGER, num_slup VARCHAR(255), status INTEGER DEFAULT 1, powerLineId INTEGER, userId INTEGER, projectId INTEGER, points TEXT, createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(cloudId))',
            delete: 'DROP TABLE IF EXISTS poles'
        },
        {
            name: 'segments',
            create: 'CREATE TABLE IF NOT EXISTS segments (cloudId INTEGER, title VARCHAR(255), comment VARCHAR(255), description VARCHAR(255), nazwa_ciagu_id VARCHAR(255), przeslo VARCHAR(255), status VARCHAR(255), vegetation_status INTEGER DEFAULT 0, distance_lateral INTEGER DEFAULT 0, distance_bottom INTEGER DEFAULT 0, shutdown_time INTEGER DEFAULT 0, track INTEGER DEFAULT 0, operation_type VARCHAR(255), time_of_operation INTEGER DEFAULT 0, time_for_next_entry VARCHAR(255), parcel_number_for_permit INTEGER DEFAULT 0, notes VARCHAR(255), powerLineId INTEGER, projectId INTEGER, userId INTEGER, points TEXT, createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(cloudId))',
            delete: 'DROP TABLE IF EXISTS segments'
        }
    ];

    constructor() {
        this.LIMIT_TO_LOAD = 100;
        this.database = this.connect();
    }

    private connect(): Promise<WebSQLDatabase> {
        return new Promise((resolve => SQLite.openDatabase("survey", "1.0", "demo", 1024 * 1000 * 100, resolve)));
    }

    // public close(): Promise<void> {
    //     if(this.database === undefined) {
    //         return Promise.reject("[db] Database was not open; unable to close.");
    //     }
    //
    //     return this.database.close().then(status => {
    //         this.database = undefined;
    //     })
    // }

    private convertToTimeStamp = date => {
        return date ? Date.parse(date) : null;
    };

    public initDB() {
        if(this.database !== undefined) {
            Promise.all(this.tables.map((table) => this.createTable(table)))
                .then(resolve => {
                    this.updateStatus('Initialized');
                    console.log('Created Success', resolve);
                })
                .catch(reject => {
                    this.updateStatus('Created Error');
                    console.log('Created Error', reject)
                });
        }
        return this.connect();
    }

    public dropDB() {
        if(this.database !== undefined) {
            Promise.all(this.tables.map((table) => this.deleteTable(table)))
                .then(resolve => console.log('Deleted Success', resolve))
                .catch(reject => console.log('Deleted Error', reject));
        }
        return this.connect();
    }

    public syncBD (): void {
        if(this.database !== undefined) {
            const syncPipe = new PromisePiper();
            this.tables.map((table) => {
                syncPipe.pipe((resolve, reject) => {
                    this.syncTable(table).then((syncResult)  => {
                        resolve(syncResult);
                    }, (syncReason) => {
                        reject( syncReason );
                    });
                });
            });

            syncPipe.finally( (resolveResult) => {
                console.log('Sync Success', resolveResult);
            }, (rejectReason) => {
                console.log('Sync Error', rejectReason);
            });
        }
    }

    private createTable = (table) => {
        return new Promise((resolve, reject) => {
            this.database.then((connect: any) => {
                connect.transaction((txn) => {
                    txn.executeSql(
                        table.create,
                        [],
                        (tx, res) => {
                            this.updateStatus(`Create table ${table.name} Success`);
                            console.log(`Create table ${table.name} Success`, res);
                            resolve({tx, res})
                        },
                        (error) => reject({error})
                    )
                })
            })
        })
    };

    private deleteTable = (table) => {
        return new Promise((resolve, reject) => {
            this.database.then((connect: any) => {
                connect.transaction((txn) => {
                    txn.executeSql(
                        table.delete,
                        [],
                        (tx, res) => {
                            // console.log(`Delete table ${table.name} Success`, res);
                            resolve({tx, res})
                        },
                        (error) => reject({error})
                    )
                })
            })
        })
    };

    private syncTable = (table) => {
         return new Promise((resolve, reject) => {
            let url = '';
            let query = '';
            switch (table.name) {
                case 'projects': {
                    console.log('INSERT PROJECTS');
                    url = `${API}api/projects?limit=${this.LIMIT_TO_LOAD}`;
                    query = `INSERT OR IGNORE INTO projects (cloudId, title, contractor, status, createdAt, updatedAt, deletedAt) VALUES`;
                } break;
                case 'powerlines': {
                    console.log('INSERT POWERLINES');
                    const projectIds = [];
                    this.projects.forEach((project) => {
                        projectIds.push(project.id);
                    });
                    url = `${API}api/projects/${projectIds[0]}/powerlines?limit=${this.LIMIT_TO_LOAD}&projectsList=${JSON.stringify(projectIds)}`;
                    query = `INSERT OR IGNORE INTO powerlines (cloudId, title, status, comment, userId, createdAt, updatedAt, deletedAt) VALUES`;
                } break;
                case 'stations': {
                    console.log('INSERT STATIONS');
                    const projectIds = [];
                    this.projects.forEach((project) => {
                        projectIds.push(project.id);
                    });
                    url = `${API}api/projects/${projectIds[0]}/stations?limit=${this.LIMIT_TO_LOAD}&projectsList=${JSON.stringify(projectIds)}`;
                    query = `INSERT OR IGNORE INTO stations (cloudId, title, description, nazw_stac, num_eksp_s, comment, type, status, userId, projectId, points, createdAt, updatedAt, deletedAt) VALUES`;
                } break;
                case 'pois': {
                    const projectIds = [];
                    this.projects.forEach((project) => {
                        projectIds.push(project.id);
                    });
                    url = `${API}api/projects/${projectIds[0]}/poi?limit=${this.LIMIT_TO_LOAD}&projectsList=${JSON.stringify(projectIds)}`;
                    query = `INSERT OR IGNORE INTO pois (cloudId, title, description, points, comment, status, userId, projectId, categoryId, createdAt, updatedAt, deletedAt) VALUES`;
                } break;
                case 'parcels': {
                    console.log('INSERT PARCELS');
                    const powerlineIds = [];
                    this.powerlines.forEach((powerline) => {
                        powerlineIds.push(powerline.id);
                    });
                    url = `${API}api/projects/${this.projects[0].id}/powerlines/${powerlineIds[0]}/parcels?limit=${this.LIMIT_TO_LOAD}&powerlinesList=${JSON.stringify(powerlineIds)}`;
                    query = `INSERT OR IGNORE INTO parcels (cloudId, comment, title, points, wojewodztw, gmina, description, numer, status, userId, powerLineId, projectId, createdAt, updatedAt, deletedAt) VALUES`
                } break;
                case 'poles': {
                    console.log('INSERT POLES');
                    const powerlineIds = [];
                    this.powerlines.forEach((powerline) => {
                        powerlineIds.push(powerline.id);
                    });
                    url = `${API}api/projects/${this.projects[0].id}/powerlines/${powerlineIds[0]}/poles?limit=${this.LIMIT_TO_LOAD}&powerlinesList=${JSON.stringify(powerlineIds)}`;
                    query = `INSERT OR IGNORE INTO poles (cloudId, title, description, comment, type, num_slup, status, powerLineId, userId, projectId, points, createdAt, updatedAt, deletedAt) VALUES`
                } break;
                case 'segments': {
                    console.log('INSERT SEGMENTS');
                    const powerlineIds = [];
                    this.powerlines.forEach((powerline) => {
                        powerlineIds.push(powerline.id);
                    });
                    url = `${API}api/projects/${this.projects[0].id}/powerlines/${powerlineIds[0]}/segments?limit=${this.LIMIT_TO_LOAD}&powerlinesList=${JSON.stringify(powerlineIds)}`;
                    query = `INSERT OR IGNORE INTO segments (cloudId, title, comment, description, nazwa_ciagu_id, przeslo, status, vegetation_status, distance_lateral, distance_bottom, shutdown_time, track, operation_type, time_of_operation, time_for_next_entry, parcel_number_for_permit, notes, powerLineId, projectId, userId, points, createdAt, updatedAt, deletedAt) VALUES`
                } break;
            }
        axios.get(url)
            .then((response: any) => {
                let queryValues = '';
                if(response.data) {
                    switch (table.name) {
                        case 'projects': {
                            const list = response.data;
                            this.projects = response.data;
                            list.forEach((item, key) => {
                                queryValues += `(
                                ${item.id}, 
                                "${item.title}", 
                                "${item.contractor}", 
                                ${item.status}, 
                                ${this.convertToTimeStamp(item.createdAt)}, 
                                ${this.convertToTimeStamp(item.updatedAt)}, 
                                ${this.convertToTimeStamp(item.deletedAt)}
                                )`;
                                queryValues += key === list.length-1 ? "; " : ", ";
                            })
                        } break;
                        case 'powerlines': {
                            const list = response.data.rows;
                            console.log('POWERLINES', response.data.rows);
                            this.powerlines = response.data.rows;
                            list.forEach((item, key)=>{
                                queryValues += `(
                                ${item.id}, 
                                "${escape(item.title)}",
                                ${item.status},
                                "${escape(item.comment)}",
                                ${item.userId},
                                ${this.convertToTimeStamp(item.createdAt)}, 
                                ${this.convertToTimeStamp(item.updatedAt)}, 
                                ${this.convertToTimeStamp(item.deletedAt)}
                                )`;
                                queryValues += key === list.length-1 ? "; " : ", ";
                            });
                        } break;
                        case 'stations': {
                            const list = response.data.rows;
                            list.forEach((item, key)=>{
                                queryValues += `(
                                ${item.id}, 
                                "${escape(item.title)}", 
                                "${escape(item.description)}", 
                                "${escape(item.nazw_stac)}", 
                                "${escape(item.num_eksp_s)}", 
                                "${escape(item.comment)}", 
                                ${item.type || 1}, 
                                ${item.status}, 
                                ${item.userId}, 
                                ${item.projectId}, 
                                "${escape(JSON.stringify(item.points))}", 
                                ${this.convertToTimeStamp(item.createdAt)}, 
                                ${this.convertToTimeStamp(item.updatedAt)}, 
                                ${this.convertToTimeStamp(item.deletedAt)}
                                )`;
                                queryValues += key === list.length-1 ? "; " : ", ";
                            });
                        } break;
                        case 'pois': {
                            const list = response.data.rows;
                            list.forEach((item, key)=>{
                                queryValues += `(
                                ${item.id}, 
                                "${escape(item.title)}", 
                                "${escape(item.description)}", 
                                "${escape(JSON.stringify(item.points))}",
                                "${escape(item.comment)}",
                                ${item.status}, 
                                ${item.userId}, 
                                ${item.projectId}, 
                                ${item.categoryId},
                                ${this.convertToTimeStamp(item.createdAt)}, 
                                ${this.convertToTimeStamp(item.updatedAt)}, 
                                ${this.convertToTimeStamp(item.deletedAt)}
                                )`;
                                queryValues += key === list.length-1 ? "; " : ", ";
                            });
                        } break;
                        case 'parcels': {
                            const list = response.data.rows;
                            list.forEach((item, key) => {
                                queryValues += `(
                                ${item.id},
                                "${escape(item.comment)}",
                                "${escape(item.title)}",
                                "${escape(JSON.stringify(item.points))}",
                                "${escape(item.wojewodztw)}",
                                "${escape(item.gmina)}",
                                "${escape(item.description)}",
                                "${escape(item.numer)}",
                                ${item.status},
                                ${item.userId},
                                ${item.powerLineId},
                                ${item.projectId},
                                ${this.convertToTimeStamp(item.createdAt)}, 
                                ${this.convertToTimeStamp(item.updatedAt)}, 
                                ${this.convertToTimeStamp(item.deletedAt)}
                                )`;
                                queryValues += key === list.length-1 ? "; " : ", ";
                            })
                        } break;
                        case 'poles': {
                            const list = response.data.rows;
                            list.forEach((item, key) => {
                                queryValues += `(
                                ${item.id},
                                "${escape(item.title)}",
                                "${escape(item.description)}",
                                "${escape(item.comment)}",
                                ${item.type},
                                "${escape(item.num_slup)}",
                                ${item.status},
                                ${item.powerLineId},
                                ${item.userId},
                                ${item.projectId},
                                "${escape(JSON.stringify(item.points))}",
                                ${this.convertToTimeStamp(item.createdAt)}, 
                                ${this.convertToTimeStamp(item.updatedAt)}, 
                                ${this.convertToTimeStamp(item.deletedAt)}
                                )`;
                                queryValues += key === list.length-1 ? "; " : ", ";
                            })
                        } break;
                        case 'segments': {
                            const list = response.data.rows;
                            list.forEach((item, key) => {
                                queryValues += `(
                                ${item.id},
                                "${escape(item.title)}",
                                "${escape(item.comment)}",
                                "${escape(item.description)}",
                                "${escape(item.nazwa_ciagu_id)}",
                                "${escape(item.przeslo)}",
                                "${escape(item.status)}",
                                ${item.vegetation_status},
                                ${item.distance_lateral},
                                ${item.distance_bottom},
                                ${item.shutdown_time},
                                ${item.track},
                                "${escape(item.operation_type)}",
                                ${item.time_of_operation},
                                "${escape(item.time_for_next_entry)}",
                                ${item.parcel_number_for_permit},
                                "${escape(item.notes)}",
                                ${item.powerLineId},
                                ${item.projectId},
                                ${item.userId},
                                "${escape(JSON.stringify(item.points))}",
                                ${this.convertToTimeStamp(item.createdAt)},
                                ${this.convertToTimeStamp(item.updatedAt)},
                                ${this.convertToTimeStamp(item.deletedAt)}
                                )`;
                                queryValues += key === list.length-1 ? "; " : ", ";
                            })
                        } break;
                    }

                    query += queryValues;

                    this.database.then((connect: any) => {
                        connect.transaction(function (txn) {
                            txn.executeSql(
                                query,
                                [],
                                (tx, res) => {
                                    console.log(`Insert data in ${table.name} Success`, res);
                                    resolve({tx, res});
                                },
                                (tx, error) => reject({tx, error})
                            );
                        });
                    })
                }
            })
            .catch(error => reject(error));
        })
    }
}
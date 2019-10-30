import {AsyncStorage} from "react-native";
import axios from 'react-native-axios';
import {SQLite} from "expo-sqlite";
import {WebSQLDatabase} from "expo-sqlite/build/SQLite";
import {API} from "../../config";
import {Powerline, Project} from "../../entities";
import PromisePiper from '../../utils/promise.piper/index';
import {Observer, Emitter} from "../../utils/interfaces";

export interface IAdapter {
    initDB(): void;
    dropDB(): void;
    syncDB(): void;
    attach(observer: Observer): void;
    detach(observer: Observer): void;
    notify(): void;
}

export class DBAdapter implements IAdapter {
    static database: Promise<WebSQLDatabase>;
    private readonly LIMIT_TO_LOAD: number;
    private projects: Array<Project>;
    private powerlines: Array<Powerline>;

    constructor() {
        this.LIMIT_TO_LOAD = 5000;
        DBAdapter.database = this.connect();
        this.projects = [];
    }

    private state: Emitter = {
        pending: false,
        logger: '',
    };

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

    public updateState(emitter: Emitter): void {
        this.state = emitter;
        this.notify();
    }

    private tables = [
        {
            name: 'categories',
            create: 'CREATE TABLE IF NOT EXISTS categories (id INTEGER, title VARCHAR(255), comment VARCHAR(255), userId INTEGER, createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(id));',
            delete: 'DROP TABLE IF EXISTS categories;'
        },
        {
            name: 'projects',
            create: 'CREATE TABLE IF NOT EXISTS projects (id INTEGER, title VARCHAR(255), contractor VARCHAR(255), status INTEGER DEFAULT 1, createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(id));',
            delete: 'DROP TABLE IF EXISTS projects;'
        },
        {
            name: 'powerlines',
            create: 'CREATE TABLE IF NOT EXISTS powerlines (id INTEGER, title VARCHAR(255), status INTEGER DEFAULT 1, comment VARCHAR(255), userId INTEGER, projectId INTEGER, project_powerline TEXT, createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(id))',
            delete: 'DROP TABLE IF EXISTS powerlines;'
        },
        {
            name: 'stations',
            create: 'CREATE TABLE IF NOT EXISTS stations (id INTEGER, title VARCHAR(255), description VARCHAR(255), nazw_stac VARCHAR(255), num_eksp_s VARCHAR(255), comment VARCHAR(255), type INTEGER DEFAULT 0, status INTEGER, userId INTEGER, projectId INTEGER, points TEXT, createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(id));',
            delete: 'DROP TABLE IF EXISTS stations;'
        },
        {
            name: 'pois',
            create: 'CREATE TABLE IF NOT EXISTS pois (id INTEGER, title VARCHAR(255), description VARCHAR(255), points TEXT, comment VARCHAR(255), status INTEGER DEFAULT 1, userId INTEGER, projectId INTEGER, categoryId INTEGER, createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(id))',
            delete: 'DROP TABLE IF EXISTS pois;'
        },
        {
            name: 'parcels',
            create: 'CREATE TABLE IF NOT EXISTS parcels(id INTEGER, comment VARCHAR(255), title VARCHAR(255), points TEXT, wojewodztw VARCHAR(255), gmina VARCHAR(255), description VARCHAR(255), numer VARCHAR(255), status INTEGER DEFAULT 1, userId INTEGER, powerLineId INTEGER, projectId INTEGER, createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(id))',
            delete: 'DROP TABLE IF EXISTS parcels'
        },
        {
            name: 'poles',
            create: 'CREATE TABLE IF NOT EXISTS poles (id INTEGER, title VARCHAR(255), description VARCHAR(255), comment VARCHAR(255), type INTEGER, num_slup VARCHAR(255), status INTEGER DEFAULT 1, powerLineId INTEGER, userId INTEGER, projectId INTEGER, points TEXT, createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(id))',
            delete: 'DROP TABLE IF EXISTS poles'
        },
        {
            name: 'segments',
            create: 'CREATE TABLE IF NOT EXISTS segments (id INTEGER, title VARCHAR(255), comment VARCHAR(255), description VARCHAR(255), nazwa_ciagu_id VARCHAR(255), przeslo VARCHAR(255), status VARCHAR(255), vegetation_status INTEGER DEFAULT 0, distance_lateral INTEGER DEFAULT 0, distance_bottom INTEGER DEFAULT 0, shutdown_time INTEGER DEFAULT 0, track INTEGER DEFAULT 0, operation_type VARCHAR(255), time_of_operation INTEGER DEFAULT 0, time_for_next_entry VARCHAR(255), parcel_number_for_permit INTEGER DEFAULT 0, notes VARCHAR(255), powerLineId INTEGER, projectId INTEGER, userId INTEGER, points TEXT, createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(id))',
            delete: 'DROP TABLE IF EXISTS segments'
        }
    ];

    private connect(): Promise<WebSQLDatabase> {
        return new Promise((resolve => SQLite.openDatabase("survey", "1.0", "demo", 1024 * 1000 * 1000, resolve)));
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



    static getRows (query) {
        return new Promise( async (resolve, reject) => {
            await DBAdapter.database.then((connect: any) => {
                connect.transaction(function (txn) {
                    txn.executeSql(
                        query,
                        [],
                        (tx, resp) => {
                            resolve(resp);
                        },
                        (txn, error) => {
                            reject(error);
                        }
                    )
                })
            })
        })
    };

    static setRows (update, select) {
        return new Promise( async (resolve, reject) => {
            await DBAdapter.database.then((connect: any) => {
                connect.transaction(function (txn) {
                    txn.executeSql(
                        update,
                        [],
                        (txn) => {
                            txn.executeSql(
                                select,
                                [],
                                (tx, resp) => {
                                    resolve(resp);
                                }
                            )
                        },
                        (txn, error) => {
                            reject(error);
                        }
                    )
                })
            })
        })
    }

    private convertToTimeStamp = date => {
        return date ? Date.parse(date) : null;
    };

    public initDB() {
        if(DBAdapter.database !== undefined) {
            Promise.all(this.tables.map((table) => this.createTable(table)))
                .then(async (resolve) => {
                    await AsyncStorage.setItem('db_status', 'exist');
                    this.updateState({...this.state, pending: false, logger: `Local DB initialized`});
                    console.log('Created Success', resolve);
                })
                .catch(async (reject) => {
                    this.updateState({...this.state, pending: false, logger: `Initialization Error`});
                    await AsyncStorage.setItem('db_status', 'error');
                    console.log('Created Error', reject)
                });
        }
        return this.connect();
    }

    public dropDB() {
        if(DBAdapter.database !== undefined) {
            Promise.all(this.tables.map((table) => this.deleteTable(table)))
                .then(async (resolve) => {
                    await AsyncStorage.removeItem('db_status');
                    console.log('Deleted Success', resolve)
                })
                .catch(async (reject) => {
                    await AsyncStorage.setItem('db_status', 'error');
                    console.log('Deleted Error', reject)
                });
        }
        return this.connect();
    }

    public syncDB (): void {
        if(DBAdapter.database !== undefined) {
            const syncPiper = new PromisePiper();
            this.tables.map((table) => {
                syncPiper.pipe((resolve, reject) => {
                    this.sync(table).then((syncResult)  => {
                        resolve(syncResult);
                    }, (syncReason) => {
                        reject(syncReason);
                    });
                });
            });

            syncPiper.finally( async (resolveResult) => {
                await AsyncStorage.setItem('db_status', 'updated');
                this.updateState({...this.state, pending: false, logger: `Local DB synchronized`});
                console.log('Sync Success', resolveResult);
            }, async (rejectReason) => {
                await AsyncStorage.setItem('db_status', 'error');
                this.updateState({...this.state, pending: false, logger: `Synchronization Error`});
                console.log('Sync Error', rejectReason);
            });
        }
    }

    private createTable = (table) => {
        return new Promise((resolve, reject) => {
            DBAdapter.database.then((connect: any) => {
                connect.transaction((txn) => {
                    txn.executeSql(
                        table.create,
                        [],
                        (tx, res) => {
                            this.updateState({...this.state, pending: true, logger: `Create table ${table.name}`});
                            console.log(`Create table ${table.name} Success`, res);
                            resolve({tx, res})
                        },
                        (error) => reject(error)
                    )
                })
            })
        })
    };

    private deleteTable = (table) => {
        return new Promise((resolve, reject) => {
            DBAdapter.database.then((connect: any) => {
                connect.transaction((txn) => {
                    txn.executeSql(
                        table.delete,
                        [],
                        (tx, res) => {
                            // console.log(`Delete table ${table.name} Success`, res);
                            resolve({tx, res})
                        },
                        (error) => reject(error)
                    )
                })
            })
        })
    };

    private fillRows = (query, name) => {
        return new Promise((resolve, reject) => {
            this.updateState({...this.state, pending: false, logger: `Save data in ${name} table`});
            DBAdapter.database.then((connect: any) => {
                connect.transaction(function (txn) {
                    txn.executeSql(
                        query,
                        [],
                        (tx, res) => {
                            console.log(`Insert data in ${name} Success`, res);
                            resolve({tx, res});
                        },
                        (tx, error) => reject({tx, error})
                    );
                });
            })
        })
    };

    private requestData = (offset, table) => {
        return new Promise( (resolve, reject) => {
            let api = '';
            let query = '';
            this.updateState({...this.state, pending: true, logger: `Fetching ${table.name} data`});
            console.log('PROJECTS', this.projects);
            switch (table.name) {
                case 'categories': {
                    api = `${API}api/category`;
                } break;
                case 'projects': {
                    api = `${API}api/projects?limit=1000`;
                } break;
                case 'powerlines': {
                    const projectIds = [];
                    this.projects.forEach((project) => {
                        projectIds.push(project.id);
                    });
                    api = `${API}api/projects/${projectIds[0]}/powerlines?limit=1000&projectsList=${JSON.stringify(projectIds)}offset=${offset}`;
                } break;
                case 'stations': {
                    const projectIds = [];
                    this.projects.forEach((project) => {
                        projectIds.push(project.id);
                    });
                    api = `${API}api/projects/${projectIds[0]}/stations?limit=1000&projectsList=${JSON.stringify(projectIds)}offset=${offset}`;
                } break;
                case 'pois': {
                    const projectIds = [];
                    this.projects.forEach((project) => {
                        projectIds.push(project.id);
                    });
                    api = `${API}api/projects/${projectIds[0]}/poi?limit=1000&projectsList=${JSON.stringify(projectIds)}offset=${offset}`;
                } break;
                case 'parcels': {
                    const powerlineIds = [];
                    this.powerlines.forEach((powerline) => {
                        powerlineIds.push(powerline.id);
                    });
                    api = `${API}api/projects/${this.projects[0].id}/powerlines/${powerlineIds[0]}/parcels?limit=1000&powerlinesList=${JSON.stringify(powerlineIds)}offset=${offset}`;
                } break;
                case 'poles': {
                    const powerlineIds = [];
                    this.powerlines.forEach((powerline) => {
                        powerlineIds.push(powerline.id);
                    });
                    api = `${API}api/projects/${this.projects[0].id}/powerlines/${powerlineIds[0]}/poles?limit=1000&powerlinesList=${JSON.stringify(powerlineIds)}offset=${offset}`;
                } break;
                case 'segments': {
                    const powerlineIds = [];
                    this.powerlines.forEach((powerline) => {
                        powerlineIds.push(powerline.id);
                    });
                    api = `${API}api/projects/${this.projects[0].id}/powerlines/${powerlineIds[0]}/segments?limit=1000&powerlinesList=${JSON.stringify(powerlineIds)}offset=${offset}`;
                } break;
            }

            axios.get(api).then( (response: any) => {
                let queryValues = '';
                const limit = 200;
                if(response.data.count) {
                    switch (table.name) {
                        case 'categories': {
                            query = `INSERT OR IGNORE INTO categories (id, title, comment, userId, createdAt, updatedAt, deletedAt) VALUES`;
                            const list = response.data.rows;
                            const chunksPiper = new PromisePiper();
                            while (list.length) {
                                const offset = list.length > limit ? limit : list.length;
                                const chunk = list.splice(0, offset);
                                chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
                                    chunk.forEach((item, key) => {
                                        queryValues += `(
                                        ${item.id}, 
                                        "${escape(item.title)}", 
                                        "${escape(item.comment)}",
                                        ${item.userId}, 
                                        ${this.convertToTimeStamp(item.createdAt)}, 
                                        ${this.convertToTimeStamp(item.updatedAt)}, 
                                        ${this.convertToTimeStamp(item.deletedAt)}
                                        )`;
                                        queryValues += key === chunk.length-1 ? "; " : ", ";
                                    });
                                    query += queryValues;
                                    this.fillRows(query, table.name).then((resolveFillResult) => {
                                        resolveChunkWorker(resolveFillResult);

                                    }, (rejectFillReason) => {
                                        rejectChunkWorker(rejectFillReason);
                                    });
                                });
                            }

                            chunksPiper.finally( (resolveResult) => {
                                resolve(resolveResult);
                            }, (rejectReason) => {
                                reject(rejectReason);
                            });
                        } break;
                        case 'projects': {
                            query = `INSERT OR IGNORE INTO projects (id, title, contractor, status, createdAt, updatedAt, deletedAt) VALUES`;
                            const list = response.data;
                            console.log('PROJ RESPONSE', list);
                            this.projects = [...response.data];
                            const chunksPiper = new PromisePiper();
                            while (list.length) {
                                const offset = list.length > limit ? limit : list.length;
                                const chunk = list.splice(0, offset);
                                chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
                                    chunk.forEach((item, key) => {
                                        queryValues += `(
                                        ${item.id}, 
                                        "${escape(item.title)}", 
                                        "${escape(item.contractor)}",
                                        ${item.status}, 
                                        ${this.convertToTimeStamp(item.createdAt)}, 
                                        ${this.convertToTimeStamp(item.updatedAt)}, 
                                        ${this.convertToTimeStamp(item.deletedAt)}
                                        )`;
                                        queryValues += key === chunk.length-1 ? "; " : ", ";
                                    });
                                    query += queryValues;
                                    this.fillRows(query, table.name).then((resolveFillResult) => {
                                        resolveChunkWorker(resolveFillResult);
                                    }, (rejectFillReason) => {
                                        rejectChunkWorker(rejectFillReason);
                                    });
                                });
                            }

                            chunksPiper.finally( (resolveResult) => {
                                resolve(resolveResult);
                            }, (rejectReason) => {
                                reject(rejectReason);
                            });
                        } break;
                        case 'powerlines': {
                            query = `INSERT OR IGNORE INTO powerlines (id, title, status, comment, userId, projectId, project_powerline, createdAt, updatedAt, deletedAt) VALUES`;
                            const list = response.data.rows;
                            console.log('POWERLINES', list.length);
                            this.powerlines = [...response.data.rows];
                            const chunksPiper = new PromisePiper();
                            while (list.length) {
                                const offset = list.length > limit ? limit : list.length;
                                const chunk = list.splice(0, offset);
                                chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
                                    chunk.forEach((item, key) => {
                                        queryValues += `(
                                        ${item.id}, 
                                        "${escape(item.title)}",
                                        ${item.status},
                                        "${escape(item.comment)}",
                                        ${item.userId},
                                        ${item.ProjectPowerline[0].project_powerline.projectId},
                                        "${escape(JSON.stringify(item.ProjectPowerline[0].project_powerline))}",
                                        ${this.convertToTimeStamp(item.createdAt)}, 
                                        ${this.convertToTimeStamp(item.updatedAt)}, 
                                        ${this.convertToTimeStamp(item.deletedAt)}
                                        )`;
                                        queryValues += key === chunk.length-1 ? "; " : ", ";
                                    });
                                    query += queryValues;
                                    this.fillRows(query, table.name).then((resolveFillResult) => {
                                        resolveChunkWorker(resolveFillResult);
                                    }, (rejectFillReason) => {
                                        rejectChunkWorker(rejectFillReason);
                                    });
                                });
                            }

                            chunksPiper.finally( (resolveResult) => {
                                resolve(resolveResult);
                            }, (rejectReason) => {
                                reject(rejectReason);
                            });
                        } break;
                        case 'stations': {
                            query = `INSERT OR IGNORE INTO stations (id, title, description, nazw_stac, num_eksp_s, comment, type, status, userId, projectId, points, createdAt, updatedAt, deletedAt) VALUES`;
                            const list = response.data.rows;
                            const chunksPiper = new PromisePiper();
                            while (list.length) {
                                const offset = list.length > limit ? limit : list.length;
                                const chunk = list.splice(0, offset);
                                chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
                                    chunk.forEach((item, key) => {
                                        queryValues += `(
                                        ${item.id}, 
                                        "${escape(item.title)}", 
                                        "${escape(item.description)}", 
                                        "${escape(item.nazw_stac)}", 
                                        "${escape(item.num_eksp_s)}", 
                                        "${escape(item.comment)}", 
                                        ${item.type}, 
                                        ${item.status}, 
                                        ${item.userId}, 
                                        ${item.projectId}, 
                                        "${escape(JSON.stringify(item.points))}", 
                                        ${this.convertToTimeStamp(item.createdAt)}, 
                                        ${this.convertToTimeStamp(item.updatedAt)}, 
                                        ${this.convertToTimeStamp(item.deletedAt)}
                                        )`;
                                        queryValues += key === chunk.length-1 ? "; " : ", ";
                                    });
                                    query += queryValues;
                                    this.fillRows(query, table.name).then((resolveFillResult) => {
                                        resolveChunkWorker(resolveFillResult);
                                    }, (rejectFillReason) => {
                                        rejectChunkWorker(rejectFillReason);
                                    });
                                });
                            }

                            chunksPiper.finally( (resolveResult) => {
                                resolve(resolveResult);
                            }, (rejectReason) => {
                                reject(rejectReason);
                            });
                        } break;
                        case 'pois': {
                            query = `INSERT OR IGNORE INTO pois (id, title, description, points, comment, status, userId, projectId, categoryId, createdAt, updatedAt, deletedAt) VALUES`;
                            const list = response.data.rows;
                            const chunksPiper = new PromisePiper();
                            while (list.length) {
                                const offset = list.length > limit ? limit : list.length;
                                const chunk = list.splice(0, offset);
                                chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
                                    chunk.forEach((item, key) => {
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
                                        queryValues += key === chunk.length-1 ? "; " : ", ";
                                    });
                                    query += queryValues;
                                    this.fillRows(query, table.name).then((resolveFillResult) => {
                                        resolveChunkWorker(resolveFillResult);
                                    }, (rejectFillReason) => {
                                        rejectChunkWorker(rejectFillReason);
                                    });
                                });
                            }

                            chunksPiper.finally( (resolveResult) => {
                                resolve(resolveResult);
                            }, (rejectReason) => {
                                reject(rejectReason);
                            });
                        } break;
                        case 'parcels': {
                            query = `INSERT OR IGNORE INTO parcels (id, comment, title, points, wojewodztw, gmina, description, numer, status, userId, powerLineId, projectId, createdAt, updatedAt, deletedAt) VALUES`;
                            const list = response.data.rows;
                            const chunksPiper = new PromisePiper();
                            while (list.length) {
                                const offset = list.length > limit ? limit : list.length;
                                const chunk = list.splice(0, offset);
                                chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
                                    chunk.forEach((item, key) => {
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
                                        queryValues += key === chunk.length-1 ? "; " : ", ";
                                    });
                                    query += queryValues;
                                    this.fillRows(query, table.name).then((resolveFillResult) => {
                                        resolveChunkWorker(resolveFillResult);
                                    }, (rejectFillReason) => {
                                        rejectChunkWorker(rejectFillReason);
                                    });
                                });
                            }

                            chunksPiper.finally( (resolveResult) => {
                                resolve(resolveResult);
                            }, (rejectReason) => {
                                reject(rejectReason);
                            });
                        } break;
                        case 'poles': {
                            query = `INSERT OR IGNORE INTO poles (id, title, description, comment, type, num_slup, status, powerLineId, userId, projectId, points, createdAt, updatedAt, deletedAt) VALUES`;
                            const list = response.data.rows;
                            const chunksPiper = new PromisePiper();
                            while (list.length) {
                                const offset = list.length > limit ? limit : list.length;
                                const chunk = list.splice(0, offset);
                                chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
                                    chunk.forEach((item, key) => {
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
                                        queryValues += key === chunk.length-1 ? "; " : ", ";
                                    });
                                    query += queryValues;
                                    this.fillRows(query, table.name).then((resolveFillResult) => {
                                        resolveChunkWorker(resolveFillResult);
                                    }, (rejectFillReason) => {
                                        rejectChunkWorker(rejectFillReason);
                                    });
                                });
                            }

                            chunksPiper.finally( (resolveResult) => {
                                resolve(resolveResult);
                            }, (rejectReason) => {
                                reject(rejectReason);
                            });
                        } break;
                        case 'segments': {
                            query = `INSERT OR IGNORE INTO segments (id, title, comment, description, nazwa_ciagu_id, przeslo, status, vegetation_status, distance_lateral, distance_bottom, shutdown_time, track, operation_type, time_of_operation, time_for_next_entry, parcel_number_for_permit, notes, powerLineId, projectId, userId, points, createdAt, updatedAt, deletedAt) VALUES`;
                            const list = response.data.rows;
                            const chunksPiper = new PromisePiper();
                            while (list.length) {
                                const offset = list.length > limit ? limit : list.length;
                                const chunk = list.splice(0, offset);
                                chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
                                    chunk.forEach((item, key) => {
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
                                        queryValues += key === chunk.length-1 ? "; " : ", ";
                                    });
                                    query += queryValues;
                                    this.fillRows(query, table.name).then((resolveFillResult) => {
                                        resolveChunkWorker(resolveFillResult);
                                    }, (rejectFillReason) => {
                                        rejectChunkWorker(rejectFillReason);
                                    });
                                });
                            }

                            chunksPiper.finally( (resolveResult) => {
                                resolve(resolveResult);
                            }, (rejectReason) => {
                                reject(rejectReason);
                            });
                        } break;
                    }
                } else {
                    resolve();
                }
            }).catch((error) => {
                console.log('ERROR', error);
                this.updateState({...this.state, pending: false, logger: error});
                reject(error)
            });
        });
    };

    private sync = (table) => {
        return new Promise((resolve, reject) => {
            const offsets = [];
            for(let i = 0; i < 500; i+=100) {
                offsets.push(i);
            }
            console.log(offsets);
            const axiosPiper = new PromisePiper();
            offsets.map((offset) => {
                axiosPiper.pipe((resolveAxiosWorker, rejectAxiosWorker) => {
                    this.requestData(offset, table).then((resolveRequestResult) => {
                        resolveAxiosWorker(resolveRequestResult);
                    }, (rejectRequestReason) => {
                        rejectAxiosWorker(rejectRequestReason);
                    })
                });
            });

            axiosPiper.finally( (resolveResult) => {
                resolve(resolveResult);
            }, (rejectReason) => {
                reject(rejectReason);
            });
        });


        // return new Promise( (resolve, reject) => {
        //     let api = '';
        //     let query = '';
        //     this.updateState({...this.state, pending: true, logger: `Fetching ${table.name} data`});
        //
        //     switch (table.name) {
        //         case 'categories': {
        //             api = `${API}api/category`;
        //         } break;
        //         case 'projects': {
        //             api = `${API}api/projects?limit=${this.LIMIT_TO_LOAD}`;
        //         } break;
        //         case 'powerlines': {
        //             const projectIds = [];
        //             this.projects.forEach((project) => {
        //                 projectIds.push(project.id);
        //             });
        //             api = `${API}api/projects/${projectIds[0]}/powerlines?limit=${this.LIMIT_TO_LOAD}&projectsList=${JSON.stringify(projectIds)}`;
        //         } break;
        //         case 'stations': {
        //             const projectIds = [];
        //             this.projects.forEach((project) => {
        //                 projectIds.push(project.id);
        //             });
        //             api = `${API}api/projects/${projectIds[0]}/stations?limit=${this.LIMIT_TO_LOAD}&projectsList=${JSON.stringify(projectIds)}`;
        //         } break;
        //         case 'pois': {
        //             const projectIds = [];
        //             this.projects.forEach((project) => {
        //                 projectIds.push(project.id);
        //             });
        //             api = `${API}api/projects/${projectIds[0]}/poi?limit=${this.LIMIT_TO_LOAD}&projectsList=${JSON.stringify(projectIds)}`;
        //         } break;
        //         case 'parcels': {
        //             const powerlineIds = [];
        //             this.powerlines.forEach((powerline) => {
        //                 powerlineIds.push(powerline.id);
        //             });
        //             api = `${API}api/projects/${this.projects[0].id}/powerlines/${powerlineIds[0]}/parcels?limit=${this.LIMIT_TO_LOAD}&powerlinesList=${JSON.stringify(powerlineIds)}`;
        //         } break;
        //         case 'poles': {
        //             const powerlineIds = [];
        //             this.powerlines.forEach((powerline) => {
        //                 powerlineIds.push(powerline.id);
        //             });
        //             api = `${API}api/projects/${this.projects[0].id}/powerlines/${powerlineIds[0]}/poles?limit=${this.LIMIT_TO_LOAD}&powerlinesList=${JSON.stringify(powerlineIds)}`;
        //         } break;
        //         case 'segments': {
        //             const powerlineIds = [];
        //             this.powerlines.forEach((powerline) => {
        //                 powerlineIds.push(powerline.id);
        //             });
        //             api = `${API}api/projects/${this.projects[0].id}/powerlines/${powerlineIds[0]}/segments?limit=${this.LIMIT_TO_LOAD}&powerlinesList=${JSON.stringify(powerlineIds)}`;
        //         } break;
        //     }
        //
        //     axios.get(api).then( (response: any) => {
        //         let queryValues = '';
        //         const limit = 500;
        //         if(response.data) {
        //             switch (table.name) {
        //                 case 'categories': {
        //                     query = `INSERT OR IGNORE INTO categories (id, title, comment, userId, createdAt, updatedAt, deletedAt) VALUES`;
        //                     const list = response.data.rows;
        //                     const chunksPiper = new PromisePiper();
        //                     while (list.length) {
        //                         const offset = list.length > limit ? limit : list.length;
        //                         const chunk = list.splice(0, offset);
        //                         chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
        //                             chunk.forEach((item, key) => {
        //                                 queryValues += `(
        //                                 ${item.id},
        //                                 "${escape(item.title)}",
        //                                 "${escape(item.comment)}",
        //                                 ${item.userId},
        //                                 ${this.convertToTimeStamp(item.createdAt)},
        //                                 ${this.convertToTimeStamp(item.updatedAt)},
        //                                 ${this.convertToTimeStamp(item.deletedAt)}
        //                                 )`;
        //                                 queryValues += key === chunk.length-1 ? "; " : ", ";
        //                             });
        //                             query += queryValues;
        //                             this.fillRows(query, table.name).then((resolveFillResult) => {
        //                                 setTimeout(() => {resolveChunkWorker(resolveFillResult);}, 10);
        //
        //                             }, (rejectFillReason) => {
        //                                 rejectChunkWorker(rejectFillReason);
        //                             });
        //                         });
        //                     }
        //
        //                     chunksPiper.finally( (resolveResult) => {
        //                         resolve(resolveResult);
        //                     }, (rejectReason) => {
        //                         reject(rejectReason);
        //                     });
        //                 } break;
        //                 case 'projects': {
        //                     query = `INSERT OR IGNORE INTO projects (id, title, contractor, status, createdAt, updatedAt, deletedAt) VALUES`;
        //                     const list = response.data;
        //                     console.log('PROJECTS', list.length);
        //                     console.log('PROJECTS ======', list);
        //                     this.projects = [...response.data];
        //                     const chunksPiper = new PromisePiper();
        //                     while (list.length) {
        //                         const offset = list.length > limit ? limit : list.length;
        //                         const chunk = list.splice(0, offset);
        //                         chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
        //                             chunk.forEach((item, key) => {
        //                                 queryValues += `(
        //                                 ${item.id},
        //                                 "${escape(item.title)}",
        //                                 "${escape(item.contractor)}",
        //                                 ${item.status},
        //                                 ${this.convertToTimeStamp(item.createdAt)},
        //                                 ${this.convertToTimeStamp(item.updatedAt)},
        //                                 ${this.convertToTimeStamp(item.deletedAt)}
        //                                 )`;
        //                                 queryValues += key === chunk.length-1 ? "; " : ", ";
        //                             });
        //                             query += queryValues;
        //                             this.fillRows(query, table.name).then((resolveFillResult) => {
        //                                 resolveChunkWorker(resolveFillResult);
        //                             }, (rejectFillReason) => {
        //                                 rejectChunkWorker(rejectFillReason);
        //                             });
        //                         });
        //                     }
        //
        //                     chunksPiper.finally( (resolveResult) => {
        //                         resolve(resolveResult);
        //                     }, (rejectReason) => {
        //                         reject(rejectReason);
        //                     });
        //                 } break;
        //                 case 'powerlines': {
        //                     query = `INSERT OR IGNORE INTO powerlines (id, title, status, comment, userId, projectId, project_powerline, createdAt, updatedAt, deletedAt) VALUES`;
        //                     const list = response.data.rows;
        //                     console.log('POWERLINES', list.length);
        //                     this.powerlines = [...response.data.rows];
        //                     const chunksPiper = new PromisePiper();
        //                     while (list.length) {
        //                         const offset = list.length > limit ? limit : list.length;
        //                         const chunk = list.splice(0, offset);
        //                         chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
        //                             chunk.forEach((item, key) => {
        //                                 queryValues += `(
        //                                 ${item.id},
        //                                 "${escape(item.title)}",
        //                                 ${item.status},
        //                                 "${escape(item.comment)}",
        //                                 ${item.userId},
        //                                 ${item.ProjectPowerline[0].project_powerline.projectId},
        //                                 "${escape(JSON.stringify(item.ProjectPowerline[0].project_powerline))}",
        //                                 ${this.convertToTimeStamp(item.createdAt)},
        //                                 ${this.convertToTimeStamp(item.updatedAt)},
        //                                 ${this.convertToTimeStamp(item.deletedAt)}
        //                                 )`;
        //                                 queryValues += key === chunk.length-1 ? "; " : ", ";
        //                             });
        //                             query += queryValues;
        //                             this.fillRows(query, table.name).then((resolveFillResult) => {
        //                                 resolveChunkWorker(resolveFillResult);
        //                             }, (rejectFillReason) => {
        //                                 rejectChunkWorker(rejectFillReason);
        //                             });
        //                         });
        //                     }
        //
        //                     chunksPiper.finally( (resolveResult) => {
        //                         resolve(resolveResult);
        //                     }, (rejectReason) => {
        //                         reject(rejectReason);
        //                     });
        //                 } break;
        //                 case 'stations': {
        //                     query = `INSERT OR IGNORE INTO stations (id, title, description, nazw_stac, num_eksp_s, comment, type, status, userId, projectId, points, createdAt, updatedAt, deletedAt) VALUES`;
        //                     const list = response.data.rows;
        //                     const chunksPiper = new PromisePiper();
        //                     while (list.length) {
        //                         const offset = list.length > limit ? limit : list.length;
        //                         const chunk = list.splice(0, offset);
        //                         chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
        //                             chunk.forEach((item, key) => {
        //                                 queryValues += `(
        //                                 ${item.id},
        //                                 "${escape(item.title)}",
        //                                 "${escape(item.description)}",
        //                                 "${escape(item.nazw_stac)}",
        //                                 "${escape(item.num_eksp_s)}",
        //                                 "${escape(item.comment)}",
        //                                 ${item.type},
        //                                 ${item.status},
        //                                 ${item.userId},
        //                                 ${item.projectId},
        //                                 "${escape(JSON.stringify(item.points))}",
        //                                 ${this.convertToTimeStamp(item.createdAt)},
        //                                 ${this.convertToTimeStamp(item.updatedAt)},
        //                                 ${this.convertToTimeStamp(item.deletedAt)}
        //                                 )`;
        //                                 queryValues += key === chunk.length-1 ? "; " : ", ";
        //                             });
        //                             query += queryValues;
        //                             this.fillRows(query, table.name).then((resolveFillResult) => {
        //                                 resolveChunkWorker(resolveFillResult);
        //                             }, (rejectFillReason) => {
        //                                 rejectChunkWorker(rejectFillReason);
        //                             });
        //                         });
        //                     }
        //
        //                     chunksPiper.finally( (resolveResult) => {
        //                         resolve(resolveResult);
        //                     }, (rejectReason) => {
        //                         reject(rejectReason);
        //                     });
        //                 } break;
        //                 case 'pois': {
        //                     query = `INSERT OR IGNORE INTO pois (id, title, description, points, comment, status, userId, projectId, categoryId, createdAt, updatedAt, deletedAt) VALUES`;
        //                     const list = response.data.rows;
        //                     const chunksPiper = new PromisePiper();
        //                     while (list.length) {
        //                         const offset = list.length > limit ? limit : list.length;
        //                         const chunk = list.splice(0, offset);
        //                         chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
        //                             chunk.forEach((item, key) => {
        //                                 queryValues += `(
        //                                 ${item.id},
        //                                 "${escape(item.title)}",
        //                                 "${escape(item.description)}",
        //                                 "${escape(JSON.stringify(item.points))}",
        //                                 "${escape(item.comment)}",
        //                                 ${item.status},
        //                                 ${item.userId},
        //                                 ${item.projectId},
        //                                 ${item.categoryId},
        //                                 ${this.convertToTimeStamp(item.createdAt)},
        //                                 ${this.convertToTimeStamp(item.updatedAt)},
        //                                 ${this.convertToTimeStamp(item.deletedAt)}
        //                                 )`;
        //                                 queryValues += key === chunk.length-1 ? "; " : ", ";
        //                             });
        //                             query += queryValues;
        //                             this.fillRows(query, table.name).then((resolveFillResult) => {
        //                                 resolveChunkWorker(resolveFillResult);
        //                             }, (rejectFillReason) => {
        //                                 rejectChunkWorker(rejectFillReason);
        //                             });
        //                         });
        //                     }
        //
        //                     chunksPiper.finally( (resolveResult) => {
        //                         resolve(resolveResult);
        //                     }, (rejectReason) => {
        //                         reject(rejectReason);
        //                     });
        //                 } break;
        //                 case 'parcels': {
        //                     query = `INSERT OR IGNORE INTO parcels (id, comment, title, points, wojewodztw, gmina, description, numer, status, userId, powerLineId, projectId, createdAt, updatedAt, deletedAt) VALUES`;
        //                     const list = response.data.rows;
        //                     const chunksPiper = new PromisePiper();
        //                     while (list.length) {
        //                         const offset = list.length > limit ? limit : list.length;
        //                         const chunk = list.splice(0, offset);
        //                         chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
        //                             chunk.forEach((item, key) => {
        //                                 queryValues += `(
        //                                 ${item.id},
        //                                 "${escape(item.comment)}",
        //                                 "${escape(item.title)}",
        //                                 "${escape(JSON.stringify(item.points))}",
        //                                 "${escape(item.wojewodztw)}",
        //                                 "${escape(item.gmina)}",
        //                                 "${escape(item.description)}",
        //                                 "${escape(item.numer)}",
        //                                 ${item.status},
        //                                 ${item.userId},
        //                                 ${item.powerLineId},
        //                                 ${item.projectId},
        //                                 ${this.convertToTimeStamp(item.createdAt)},
        //                                 ${this.convertToTimeStamp(item.updatedAt)},
        //                                 ${this.convertToTimeStamp(item.deletedAt)}
        //                                 )`;
        //                                 queryValues += key === chunk.length-1 ? "; " : ", ";
        //                             });
        //                             query += queryValues;
        //                             this.fillRows(query, table.name).then((resolveFillResult) => {
        //                                 resolveChunkWorker(resolveFillResult);
        //                             }, (rejectFillReason) => {
        //                                 rejectChunkWorker(rejectFillReason);
        //                             });
        //                         });
        //                     }
        //
        //                     chunksPiper.finally( (resolveResult) => {
        //                         resolve(resolveResult);
        //                     }, (rejectReason) => {
        //                         reject(rejectReason);
        //                     });
        //                 } break;
        //                 case 'poles': {
        //                     query = `INSERT OR IGNORE INTO poles (id, title, description, comment, type, num_slup, status, powerLineId, userId, projectId, points, createdAt, updatedAt, deletedAt) VALUES`;
        //                     const list = response.data.rows;
        //                     const chunksPiper = new PromisePiper();
        //                     while (list.length) {
        //                         const offset = list.length > limit ? limit : list.length;
        //                         const chunk = list.splice(0, offset);
        //                         chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
        //                             chunk.forEach((item, key) => {
        //                                 queryValues += `(
        //                                 ${item.id},
        //                                 "${escape(item.title)}",
        //                                 "${escape(item.description)}",
        //                                 "${escape(item.comment)}",
        //                                 ${item.type},
        //                                 "${escape(item.num_slup)}",
        //                                 ${item.status},
        //                                 ${item.powerLineId},
        //                                 ${item.userId},
        //                                 ${item.projectId},
        //                                 "${escape(JSON.stringify(item.points))}",
        //                                 ${this.convertToTimeStamp(item.createdAt)},
        //                                 ${this.convertToTimeStamp(item.updatedAt)},
        //                                 ${this.convertToTimeStamp(item.deletedAt)}
        //                                 )`;
        //                                 queryValues += key === chunk.length-1 ? "; " : ", ";
        //                             });
        //                             query += queryValues;
        //                             this.fillRows(query, table.name).then((resolveFillResult) => {
        //                                 resolveChunkWorker(resolveFillResult);
        //                             }, (rejectFillReason) => {
        //                                 rejectChunkWorker(rejectFillReason);
        //                             });
        //                         });
        //                     }
        //
        //                     chunksPiper.finally( (resolveResult) => {
        //                         resolve(resolveResult);
        //                     }, (rejectReason) => {
        //                         reject(rejectReason);
        //                     });
        //                 } break;
        //                 case 'segments': {
        //                     query = `INSERT OR IGNORE INTO segments (id, title, comment, description, nazwa_ciagu_id, przeslo, status, vegetation_status, distance_lateral, distance_bottom, shutdown_time, track, operation_type, time_of_operation, time_for_next_entry, parcel_number_for_permit, notes, powerLineId, projectId, userId, points, createdAt, updatedAt, deletedAt) VALUES`;
        //                     const list = response.data.rows;
        //                     const chunksPiper = new PromisePiper();
        //                     while (list.length) {
        //                         const offset = list.length > limit ? limit : list.length;
        //                         const chunk = list.splice(0, offset);
        //                         chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
        //                             chunk.forEach((item, key) => {
        //                                 queryValues += `(
        //                                 ${item.id},
        //                                 "${escape(item.title)}",
        //                                 "${escape(item.comment)}",
        //                                 "${escape(item.description)}",
        //                                 "${escape(item.nazwa_ciagu_id)}",
        //                                 "${escape(item.przeslo)}",
        //                                 "${escape(item.status)}",
        //                                 ${item.vegetation_status},
        //                                 ${item.distance_lateral},
        //                                 ${item.distance_bottom},
        //                                 ${item.shutdown_time},
        //                                 ${item.track},
        //                                 "${escape(item.operation_type)}",
        //                                 ${item.time_of_operation},
        //                                 "${escape(item.time_for_next_entry)}",
        //                                 ${item.parcel_number_for_permit},
        //                                 "${escape(item.notes)}",
        //                                 ${item.powerLineId},
        //                                 ${item.projectId},
        //                                 ${item.userId},
        //                                 "${escape(JSON.stringify(item.points))}",
        //                                 ${this.convertToTimeStamp(item.createdAt)},
        //                                 ${this.convertToTimeStamp(item.updatedAt)},
        //                                 ${this.convertToTimeStamp(item.deletedAt)}
        //                                 )`;
        //                                 queryValues += key === chunk.length-1 ? "; " : ", ";
        //                             });
        //                             query += queryValues;
        //                             this.fillRows(query, table.name).then((resolveFillResult) => {
        //                                 resolveChunkWorker(resolveFillResult);
        //                             }, (rejectFillReason) => {
        //                                 rejectChunkWorker(rejectFillReason);
        //                             });
        //                         });
        //                     }
        //
        //                     chunksPiper.finally( (resolveResult) => {
        //                         resolve(resolveResult);
        //                     }, (rejectReason) => {
        //                         reject(rejectReason);
        //                     });
        //                 } break;
        //             }
        //         }
        //     }).catch((error) => {
        //         console.log('ERROR', error);
        //         this.updateState({...this.state, pending: false, logger: error});
        //         reject(error)
        //     });
        // });
    };

    private syncTable = (table) => {
        return new Promise((resolve, reject) => {
            let api = '';
            let query = '';
            this.updateState({...this.state, pending: true, logger: `Fetching ${table.name} data`});
            switch (table.name) {
                case 'categories': {
                    console.log('INSERT CATEGORIES');
                    api = `${API}api/category`;
                    query = `INSERT OR IGNORE INTO categories (id, title, comment, userId, createdAt, updatedAt, deletedAt) VALUES`;
                } break;
                case 'projects': {
                    console.log('INSERT PROJECTS');
                    api = `${API}api/projects?limit=${this.LIMIT_TO_LOAD}`;
                    query = `INSERT OR IGNORE INTO projects (id, title, contractor, status, createdAt, updatedAt, deletedAt) VALUES`;
                } break;
                case 'powerlines': {
                    console.log('INSERT POWERLINES');
                    const projectIds = [];
                    this.projects.forEach((project) => {
                        projectIds.push(project.id);
                    });
                    api = `${API}api/projects/${projectIds[0]}/powerlines?limit=${this.LIMIT_TO_LOAD}&projectsList=${JSON.stringify(projectIds)}`;
                    query = `INSERT OR IGNORE INTO powerlines (id, title, status, comment, userId, projectId, project_powerline, createdAt, updatedAt, deletedAt) VALUES`;
                } break;
                case 'stations': {
                    console.log('INSERT STATIONS');
                    const projectIds = [];
                    this.projects.forEach((project) => {
                        projectIds.push(project.id);
                    });
                    api = `${API}api/projects/${projectIds[0]}/stations?limit=${this.LIMIT_TO_LOAD}&projectsList=${JSON.stringify(projectIds)}`;
                    query = `INSERT OR IGNORE INTO stations (id, title, description, nazw_stac, num_eksp_s, comment, type, status, userId, projectId, points, createdAt, updatedAt, deletedAt) VALUES`;
                } break;
                case 'pois': {
                    console.log('INSERT POIS');
                    const projectIds = [];
                    this.projects.forEach((project) => {
                        projectIds.push(project.id);
                    });
                    api = `${API}api/projects/${projectIds[0]}/poi?limit=${this.LIMIT_TO_LOAD}&projectsList=${JSON.stringify(projectIds)}`;
                    query = `INSERT OR IGNORE INTO pois (id, title, description, points, comment, status, userId, projectId, categoryId, createdAt, updatedAt, deletedAt) VALUES`;
                } break;
                case 'parcels': {
                    console.log('INSERT PARCELS');
                    const powerlineIds = [];
                    this.powerlines.forEach((powerline) => {
                        powerlineIds.push(powerline.id);
                    });
                    api = `${API}api/projects/${this.projects[0].id}/powerlines/${powerlineIds[0]}/parcels?limit=${this.LIMIT_TO_LOAD}&powerlinesList=${JSON.stringify(powerlineIds)}`;
                    query = `INSERT OR IGNORE INTO parcels (id, comment, title, points, wojewodztw, gmina, description, numer, status, userId, powerLineId, projectId, createdAt, updatedAt, deletedAt) VALUES`;
                } break;
                case 'poles': {
                    console.log('INSERT POLES');
                    const powerlineIds = [];
                    this.powerlines.forEach((powerline) => {
                        powerlineIds.push(powerline.id);
                    });
                    api = `${API}api/projects/${this.projects[0].id}/powerlines/${powerlineIds[0]}/poles?limit=${this.LIMIT_TO_LOAD}&powerlinesList=${JSON.stringify(powerlineIds)}`;
                    query = `INSERT OR IGNORE INTO poles (id, title, description, comment, type, num_slup, status, powerLineId, userId, projectId, points, createdAt, updatedAt, deletedAt) VALUES`;
                } break;
                case 'segments': {
                    console.log('INSERT SEGMENTS');
                    const powerlineIds = [];
                    this.powerlines.forEach((powerline) => {
                        powerlineIds.push(powerline.id);
                    });
                    api = `${API}api/projects/${this.projects[0].id}/powerlines/${powerlineIds[0]}/segments?limit=${this.LIMIT_TO_LOAD}&powerlinesList=${JSON.stringify(powerlineIds)}`;
                    query = `INSERT OR IGNORE INTO segments (id, title, comment, description, nazwa_ciagu_id, przeslo, status, vegetation_status, distance_lateral, distance_bottom, shutdown_time, track, operation_type, time_of_operation, time_for_next_entry, parcel_number_for_permit, notes, powerLineId, projectId, userId, points, createdAt, updatedAt, deletedAt) VALUES`;
                } break;
            }
            axios.get(api, {
                progress: function (progressEvent) {
                    console.log('EVENT', progressEvent);
                    const completed = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    this.updateState({...this.state, progress: completed, pending: true, logger: `Upload data on ${table.name}`});
                }.bind(this)})
                .then((response: any) => {
                    let queryValues = '';
                    if(response.data) {
                        switch (table.name) {
                            case 'categories': {
                                const list = response.data.rows;
                                list.forEach((item, key) => {
                                    queryValues += `(
                                ${item.id}, 
                                "${escape(item.title)}", 
                                "${escape(item.comment)}",
                                ${item.userId}, 
                                ${this.convertToTimeStamp(item.createdAt)}, 
                                ${this.convertToTimeStamp(item.updatedAt)}, 
                                ${this.convertToTimeStamp(item.deletedAt)}
                                )`;
                                    queryValues += key === list.length-1 ? "; " : ", ";
                                })
                            } break;
                            case 'projects': {
                                const list = response.data;
                                this.projects = response.data;
                                list.forEach((item, key) => {
                                    queryValues += `(
                                ${item.id}, 
                                "${escape(item.title)}", 
                                "${escape(item.contractor)}",
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
                                console.log('LIST', response);
                                this.powerlines = response.data.rows;
                                list.forEach((item, key)=>{
                                    queryValues += `(
                                ${item.id}, 
                                "${escape(item.title)}",
                                ${item.status},
                                "${escape(item.comment)}",
                                ${item.userId},
                                ${item.ProjectPowerline[0].project_powerline.projectId},
                                "${escape(JSON.stringify(item.ProjectPowerline[0].project_powerline))}",
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
                                ${item.type}, 
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
                        this.updateState({...this.state, pending: true, logger: `Save data in ${table.name} table`});
                        DBAdapter.database.then((connect: any) => {
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
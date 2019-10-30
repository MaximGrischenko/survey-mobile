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
    resetDB(): void;
    updateDB(): void;
    attach(observer: Observer): void;
    detach(observer: Observer): void;
    notify(): void;
}

export class DBAdapter implements IAdapter {
    static database: Promise<WebSQLDatabase>;
    private static instance: DBAdapter;
    private readonly LIMIT_TO_LOAD: number;
    private projects: Array<Project>;
    private powerlines: Array<Powerline>;

    constructor() {
        this.LIMIT_TO_LOAD = 200000;
        DBAdapter.database = this.connect();
        this.projects = [];
        this.powerlines = [];
    }

    private state: Emitter = {
        pending: false,
        logger: '',
    };

    public static getInstance(): DBAdapter {
        if(!DBAdapter.instance) {
            DBAdapter.instance = new DBAdapter();
        }
        return DBAdapter.instance;
    }

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

    private notifier(emitter: Emitter): void {
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
            create: 'CREATE TABLE IF NOT EXISTS powerlines (id INTEGER, title VARCHAR(255), status INTEGER DEFAULT 1, comment VARCHAR(255), userId INTEGER, projectId INTEGER, createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(id))',
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

    // private createRows = (table) => {
    //     return new Promise(async(resolve, reject) => {
    //         await this.executeSQL(table.create).then((result) => {
    //             this.notifier({...this.state, pending: true, logger: `Create table ${table.name}`});
    //             resolve(result);
    //         }).catch((error) => reject(error));
    //     })
    // };

    public insert = async (insert, select) => {
        return new Promise(async (resolve, reject) => {
            await this.executeSQL(insert)
            .then(async (response)=> {
                if(response) {
                    this.select(select).then((response) => {
                        resolve(response);
                    }).catch(error => {
                        reject(error)
                    });
                    await AsyncStorage.setItem('db_status', 'updated');
                }
            }).catch(async (error) => {
                await AsyncStorage.setItem('db_status', 'error');
                reject(error)
            });
        });
    };

    public select = async (select) => {
        return new Promise(async (resolve, reject) => {
            await this.executeSQL(select).then((result) => {
                resolve(result);
            }).catch((error) => {
                reject(error);
            });
        });
    };

    public clear = async (clear) => {
        return new Promise(async (resolve, reject) => {
            await this.executeSQL(clear).then(async (result) => {
                resolve(result);
                await AsyncStorage.setItem('db_status', 'updated');
            }).catch(async (error) => {
                reject(error);
                await AsyncStorage.setItem('db_status', 'error');
            });
        });
    };

    // static getRows (query) {
    //     return new Promise( async (resolve, reject) => {
    //         await DBAdapter.database.then((connect: any) => {
    //             connect.transaction(function (txn) {
    //                 txn.executeSql(
    //                     query,
    //                     [],
    //                     (tx, resp) => {
    //                         resolve(resp);
    //                     },
    //                     (txn, error) => {
    //                         reject(error);
    //                     }
    //                 )
    //             })
    //         })
    //     })
    // };
    //
    // static setRows (update, select) {
    //     return new Promise( async (resolve, reject) => {
    //         await DBAdapter.database.then((connect: any) => {
    //             connect.transaction( function (txn) {
    //                 txn.executeSql(
    //                     update,
    //                     [],
    //                     (txn) => {
    //                         txn.executeSql(
    //                             select,
    //                             [],
    //                             async (tx, resp) => {
    //                                 await AsyncStorage.setItem('db_status', 'update');
    //                                 resolve(resp);
    //                             }
    //                         )
    //                     },
    //                     (txn, error) => {
    //                         reject(error);
    //                     }
    //                 )
    //             })
    //         })
    //     })
    // }

    private convertToTimeStamp = date => {
        return date ? Date.parse(date) : null;
    };

    public initDB() {
        if(DBAdapter.database !== undefined) {
            Promise.all(this.tables.map((table) => this.createRows(table)))
                .then(async (resolve) => {
                    await AsyncStorage.setItem('db_status', 'exist');
                    this.notifier({...this.state, pending: false, logger: `Local DB initialized`});
                    console.log('Created Success', resolve);
                })
                .catch(async (reject) => {
                    this.notifier({...this.state, pending: false, logger: `Initialization Error`});
                    await AsyncStorage.setItem('db_status', 'error');
                    console.log('Created Error', reject)
                });
        }
        return this.connect();
    }

    public resetDB() {
        if(DBAdapter.database !== undefined) {
            Promise.all(this.tables.map((table) => this.deleteRows(table)))
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

    public updateDB (): void {
        if(DBAdapter.database !== undefined) {
            const syncPiper = new PromisePiper();
            this.tables.map((table) => {
                syncPiper.pipe((resolve, reject) => {
                    this.download(table).then((syncResult)  => {
                        resolve(syncResult);
                    }, (syncReason) => {
                        reject(syncReason);
                    });
                });
            });

            syncPiper.finally( async (resolveResult) => {
                await AsyncStorage.setItem('db_status', 'synced');
                this.notifier({...this.state, pending: false, logger: `Local DB is up-to-date`});
                console.log('Sync Success', resolveResult);
            }, async (rejectReason) => {
                await AsyncStorage.setItem('db_status', 'error');
                this.notifier({...this.state, pending: false, logger: `Synchronization Error`});
                console.log('Sync Error', rejectReason);
            });
        }
    }

    private createRows = (table) => {
        return new Promise(async(resolve, reject) => {
            await this.executeSQL(table.create).then((result) => {
                this.notifier({...this.state, pending: true, logger: `Create table ${table.name}`});
                resolve(result);
            }).catch((error) => reject(error));
        })
    };

    private deleteRows = (table) => {
        return new Promise(async (resolve, reject) => {
            await this.executeSQL(table.delete).then((result) => {
                resolve(result);
            }).catch((error) => reject(error));
        })
    };

    private executeSQL = async (sql) => {
        return new Promise((resolve, reject) => {
            return DBAdapter.database.then((connect: any) => {
                connect.transaction(tx => {
                    tx.executeSql(sql, [],
                        (tx, res) => {
                            setTimeout(() => {resolve(res)}, 100);
                        },
                        (tx, error) => {
                            reject(error);
                        }
                    )
                })
            });
        })
    };


    private fillRows =  (query, name) => {
        return new Promise(async (resolve, reject) => {
            this.notifier({...this.state, pending: false, logger: `Save data in ${name} table`});
            await this.executeSQL(query).then((result) => resolve(result)).catch((error) => reject(error));
        })
    };

    private download = (table) => {
        return new Promise( (resolve, reject) => {
            let api = '';
            this.notifier({...this.state, pending: true, logger: `Fetching ${table.name} data`});

            switch (table.name) {
                case 'categories': {
                    api = `${API}api/category`;
                } break;
                case 'projects': {
                    api = `${API}api/projects?limit=${this.LIMIT_TO_LOAD}`;
                } break;
                case 'powerlines': {
                    const projectIds = [];
                    this.projects.forEach((project) => {
                        projectIds.push(project.id);
                    });
                    api = `${API}api/projects/${projectIds[0]}/powerlines?limit=${this.LIMIT_TO_LOAD}&projectsList=${JSON.stringify(projectIds)}`;
                } break;
                case 'stations': {
                    const projectIds = [];
                    this.projects.forEach((project) => {
                        projectIds.push(project.id);
                    });
                    api = `${API}api/projects/${projectIds[0]}/stations?limit=${this.LIMIT_TO_LOAD}&projectsList=${JSON.stringify(projectIds)}`;
                } break;
                case 'pois': {
                    const projectIds = [];
                    this.projects.forEach((project) => {
                        projectIds.push(project.id);
                    });
                    api = `${API}api/projects/${projectIds[0]}/poi?limit=${this.LIMIT_TO_LOAD}&projectsList=${JSON.stringify(projectIds)}`;
                } break;
                case 'parcels': {
                    const powerlineIds = [];
                    this.powerlines.forEach((powerline) => {
                        powerlineIds.push(powerline.id);
                    });
                    api = `${API}api/projects/${this.projects[0].id}/powerlines/${powerlineIds[0]}/parcels?limit=${this.LIMIT_TO_LOAD}&powerlinesList=${JSON.stringify(powerlineIds)}`;
                } break;
                case 'poles': {
                    const powerlineIds = [];
                    this.powerlines.forEach((powerline) => {
                        powerlineIds.push(powerline.id);
                    });
                    api = `${API}api/projects/${this.projects[0].id}/powerlines/${powerlineIds[0]}/poles?limit=${this.LIMIT_TO_LOAD}&powerlinesList=${JSON.stringify(powerlineIds)}`;
                } break;
                case 'segments': {
                    const powerlineIds = [];
                    this.powerlines.forEach((powerline) => {
                        powerlineIds.push(powerline.id);
                    });
                    api = `${API}api/projects/${this.projects[0].id}/powerlines/${powerlineIds[0]}/segments?limit=${this.LIMIT_TO_LOAD}&powerlinesList=${JSON.stringify(powerlineIds)}`;
                } break;
            }

            let query = '';
            axios.get(api).then( (response: any) => {
                let queryValues = '';
                const limit = 2000;

                if(response.data) {
                    switch (table.name) {
                        case 'categories': {
                            if(response.data.rows.length) {
                                query = `INSERT OR IGNORE INTO categories (id, title, comment, userId, createdAt, updatedAt, deletedAt) VALUES`;
                                const list = response.data.rows;
                                const chunksPiper = new PromisePiper();

                                while (list.length) {
                                    const offset = list.length > limit ? limit : list.length;
                                    const chunk = list.splice(0, offset);
                                    chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
                                        let _query = query + '';
                                        let _values = '';
                                        chunk.forEach((item, key) => {
                                            _values += `(
                                            ${item.id}, 
                                            "${escape(item.title)}", 
                                            "${escape(item.comment)}",
                                            ${item.userId}, 
                                            ${this.convertToTimeStamp(item.createdAt)}, 
                                            ${this.convertToTimeStamp(item.updatedAt)}, 
                                            ${this.convertToTimeStamp(item.deletedAt)}
                                            )`;
                                            _values += key === chunk.length-1 ? "; " : ", ";
                                        });
                                        _query += _values;
                                        this.fillRows(_query, table.name).then((resolveFillResult) => {
                                            resolveChunkWorker(resolveFillResult)
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
                            } else {
                                resolve({result: 'No categories data provided'});
                            }
                        } break;
                        case 'projects': {
                            if(response.data.length) {
                                query = `INSERT OR IGNORE INTO projects (id, title, contractor, status, createdAt, updatedAt, deletedAt) VALUES`;
                                const list = response.data;
                                this.projects = [...response.data];
                                const chunksPiper = new PromisePiper();
                                while (list.length) {
                                    const offset = list.length > limit ? limit : list.length;
                                    const chunk = list.splice(0, offset);

                                    chunksPiper.pipe( (resolveChunkWorker, rejectChunkWorker) => {
                                        let _query = query + '';
                                        let _values = '';
                                        chunk.forEach((item, key) => {
                                            _values += `(
                                            ${item.id},
                                            "${escape(item.title)}",
                                            "${escape(item.contractor)}",
                                            ${item.status},
                                            ${this.convertToTimeStamp(item.createdAt)},
                                            ${this.convertToTimeStamp(item.updatedAt)},
                                            ${this.convertToTimeStamp(item.deletedAt)}
                                            )`;
                                            _values += key === chunk.length-1 ? "; " : ", ";
                                        });
                                        _query += _values;

                                        this.fillRows(_query, table.name).then((resolveFillResult) => {
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
                            } else {
                                reject({result: 'No projects data provided'});
                            }
                        } break;
                        case 'powerlines': {
                            if(response.data.rows.length) {
                                query = `INSERT OR IGNORE INTO powerlines (id, title, status, comment, userId, projectId, createdAt, updatedAt, deletedAt) VALUES`;
                                const list = response.data.rows;
                                this.powerlines = [...response.data.rows];
                                const chunksPiper = new PromisePiper();
                                while (list.length) {
                                    const offset = list.length > limit ? limit : list.length;
                                    const chunk = list.splice(0, offset);
                                    chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
                                        let _query = query + '';
                                        let _values = '';
                                        chunk.forEach((item, key) => {
                                            _values += `(
                                            ${item.id}, 
                                            "${escape(item.title)}",
                                            ${item.status},
                                            "${escape(item.comment)}",
                                            ${item.userId},
                                            ${item.projectId},
                                            ${this.convertToTimeStamp(item.createdAt)}, 
                                            ${this.convertToTimeStamp(item.updatedAt)}, 
                                            ${this.convertToTimeStamp(item.deletedAt)}
                                            )`;
                                            _values += key === chunk.length-1 ? "; " : ", ";
                                        });
                                        _query += _values;
                                        this.fillRows(_query, table.name).then((resolveFillResult) => {
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
                            } else {
                                reject({result: 'No powerlines data provided'});
                            }
                        } break;
                        case 'stations': {
                            if(response.data.rows.length) {
                                query = `INSERT OR IGNORE INTO stations (id, title, description, nazw_stac, num_eksp_s, comment, type, status, userId, projectId, points, createdAt, updatedAt, deletedAt) VALUES`;
                                const list = response.data.rows;
                                const chunksPiper = new PromisePiper();
                                while (list.length) {
                                    const offset = list.length > limit ? limit : list.length;
                                    const chunk = list.splice(0, offset);
                                    chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
                                        let _query = query + '';
                                        let _values = '';
                                        chunk.forEach((item, key) => {
                                            _values += `(
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
                                            _values += key === chunk.length-1 ? "; " : ", ";
                                        });
                                        _query += _values;
                                        this.fillRows(_query, table.name).then((resolveFillResult) => {
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
                            } else {
                                resolve({result: 'No stations data provided'});
                            }
                        } break;
                        case 'pois': {
                            if(response.data.rows.length) {
                                query = `INSERT OR IGNORE INTO pois (id, title, description, points, comment, status, userId, projectId, categoryId, createdAt, updatedAt, deletedAt) VALUES`;
                                const list = response.data.rows;
                                const chunksPiper = new PromisePiper();
                                while (list.length) {
                                    const offset = list.length > limit ? limit : list.length;
                                    const chunk = list.splice(0, offset);
                                    chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
                                        let _query = query + '';
                                        let _values = '';
                                        chunk.forEach((item, key) => {
                                            _values += `(
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
                                                _values += key === chunk.length-1 ? "; " : ", ";
                                            });
                                        _query += _values;
                                        this.fillRows(_query, table.name).then((resolveFillResult) => {
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
                            } else {
                                resolve({result: 'No pois data provided'});
                            }
                        } break;
                        case 'parcels': {
                            if(response.data.rows.length) {
                                query = `INSERT OR IGNORE INTO parcels (id, comment, title, points, wojewodztw, gmina, description, numer, status, userId, powerLineId, projectId, createdAt, updatedAt, deletedAt) VALUES`;
                                const list = response.data.rows;
                                const chunksPiper = new PromisePiper();
                                while (list.length) {
                                    const offset = list.length > limit ? limit : list.length;
                                    const chunk = list.splice(0, offset);
                                    chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
                                        let _query = query + '';
                                        let _values = '';
                                        chunk.forEach((item, key) => {
                                            _values += `(
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
                                            _values += key === chunk.length-1 ? "; " : ", ";
                                        });
                                        _query += _values;
                                        this.fillRows( _query, table.name).then((resolveFillResult) => {
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
                            } else {
                                resolve({result: 'No parcels data provided'});
                            }
                        } break;
                        case 'poles': {
                            if(response.data.rows.length) {
                                query = `INSERT OR IGNORE INTO poles (id, title, description, comment, type, num_slup, status, powerLineId, userId, projectId, points, createdAt, updatedAt, deletedAt) VALUES`;
                                const list = response.data.rows;
                                const chunksPiper = new PromisePiper();
                                while (list.length) {
                                    const offset = list.length > limit ? limit : list.length;
                                    const chunk = list.splice(0, offset);
                                    chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
                                        let _query = query + '';
                                        let _values = '';
                                        chunk.forEach((item, key) => {
                                            _values += `(
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
                                                _values += key === chunk.length-1 ? "; " : ", ";
                                            });
                                        _query += _values;
                                        this.fillRows(_query, table.name).then((resolveFillResult) => {
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
                            } else {
                                resolve({result: 'No poles data provided'});
                            }
                        } break;
                        case 'segments': {
                            if(response.data.rows.length) {
                                query = `INSERT OR IGNORE INTO segments (id, title, comment, description, nazwa_ciagu_id, przeslo, status, vegetation_status, distance_lateral, distance_bottom, shutdown_time, track, operation_type, time_of_operation, time_for_next_entry, parcel_number_for_permit, notes, powerLineId, projectId, userId, points, createdAt, updatedAt, deletedAt) VALUES`;
                                const list = response.data.rows;
                                const chunksPiper = new PromisePiper();
                                while (list.length) {
                                    const offset = list.length > limit ? limit : list.length;
                                    const chunk = list.splice(0, offset);
                                    chunksPiper.pipe( ( resolveChunkWorker, rejectChunkWorker ) => {
                                        let _query = query + '';
                                        let _values = '';
                                        chunk.forEach((item, key) => {
                                            _values += `(
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
                                            _values += key === chunk.length-1 ? "; " : ", ";
                                        });
                                        _query += _values;
                                        this.fillRows(_query, table.name).then((resolveFillResult) => {
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
                            } else {
                                resolve({result: 'No segments data provided'});
                            }
                        } break;
                    }
                } else {
                    resolve({finished: true});
                }
            }).catch((error) => {
                this.notifier({...this.state, pending: false, logger: error});
                reject(error)
            });
        });
    };
}

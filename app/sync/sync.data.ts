import axios from 'react-native-axios';
import {db} from './connect';
import {TABLES} from "./tables";
import {API} from "../config";
import SqlString from 'sqlstring';
import {LOADED_PROJECT_DATA} from "../redux/modules/map";
import {Database} from "../database";
const LIMIT_TO_LOAD = 100000;

let projectsList = [];

export const dropTables = () => {
    return new Promise((resolve, reject) => {
        db().then((connect: any) => {

            connect.transaction((txn) => {
                txn.executeSql(
                    `DROP TABLE IF EXISTS projects;`,
                    [],
                    (tx, res) => {
                        console.log(' -- DROP PROJECTS TABLE Success -- ');
                        txn.executeSql(
                            `DROP TABLE IF EXISTS stations;`,
                            [],
                            (tx, res) => {
                                console.log(' -- DROP STATIONS TABLE Success -- ');
                                resolve({tx, res})
                            },
                            (tx, res) => {
                                console.log('DROP Err', tx, res);
                                reject({tx, res})
                            }
                        )
                        // resolve({tx, res})
                    },
                    (tx, res) => {
                        console.log('DROP Err', tx, res);
                        reject({tx, res})
                    }
                )
            })
        })
    })
};

const queries = [
    `CREATE TABLE IF NOT EXISTS projects (cloudId INTEGER, title VARCHAR(255), contractor VARCHAR(255), status INTEGER DEFAULT 1, createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(cloudId));`,
    `CREATE TABLE IF NOT EXISTS stations (cloudId INTEGER, title VARCHAR(255), description VARCHAR(255), nazw_stac VARCHAR(255), num_eksp_s VARCHAR(255), comment VARCHAR(255), type INTEGER DEFAULT 0, status INTEGER, userId INTEGER, projectId INTEGER, points VARCHAR(255), createdAt TIMESTAMP WITH TIME ZONE NOT NULL, updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, deletedAt TIMESTAMP WITH TIME ZONE, UNIQUE(cloudId));`
];

export const createTable = (query) => {
    return new Promise((resolve, reject) => {
        db().then((connect: any) => {
            connect.transaction((txn) => {
                txn.executeSql(
                    query,
                    [],
                    (tx, res) => {
                        console.log(' -- CREATE STATIONS TABLE SUCCESS -- ', res);
                        resolve({tx, res})
                    },
                    (tx, res) => reject({tx, res})
                )
            })
        })
    })
};

export const createTables = () => {
    Promise.all(queries.map((query) => createTable(query)))
        .then(res => console.log('TABLES CREATED'));
};

// export const createTables = () => {
//     return new Promise((resolve, reject) => {
//         db().then((connect: any) => {
//
//             connect.transaction((txn) => {
//                 txn.executeSql(
//                     `
// CREATE TABLE IF NOT EXISTS projects (
// cloudId INTEGER,
// title VARCHAR(255),
// contractor VARCHAR(255),
// status INTEGER DEFAULT 1,
// createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
// updatedAt TIMESTAMP WITH TIME ZONE NOT NULL,
// deletedAt TIMESTAMP WITH TIME ZONE,
// UNIQUE(cloudId));`,
//                     [],
//                     (tx, res) => {
//                         console.log(' -- CREATE PROJECTS TABLE SUCCESS -- ', res);
//
//                         connect.transaction((txn) => {
//                             txn.executeSql(
//                                 `
// CREATE TABLE IF NOT EXISTS stations (
// cloudId INTEGER,
// title VARCHAR(255),
// description VARCHAR(255),
// nazw_stac VARCHAR(255),
// num_eksp_s VARCHAR(255),
// comment VARCHAR(255),
// type INTEGER DEFAULT 0,
// status INTEGER,
// userId INTEGER,
// projectId INTEGER,
// points VARCHAR(255),
// createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
// updatedAt TIMESTAMP WITH TIME ZONE NOT NULL,
// deletedAt TIMESTAMP WITH TIME ZONE,
// UNIQUE(cloudId));
// `,
//                                 [],
//                                 (tx, res) => {
//                                     console.log(' -- CREATE STATIONS TABLE SUCCESS -- ', res);
//                                     resolve({tx, res})
//                                 },
//                                 (tx, res) => reject({tx, res})
//                             )
//                         })
//
//                     },
//                     (tx, res) => reject({tx, res})
//                 )
//             });
//
//
//         });
//
//     })
// };

let toTimestamp = strDate => {
    return strDate ? Date.parse(strDate) : null;
}


export const globalSync = async () => {


    return new Promise(async (resolve, reject) => {
        // ---- SYNC PROJECT LIST

        await syncProjects();

        // ---- END SYNC PROJECT LIST

        // ---- SYNC STATIONS FOR ALL PROJECTS

        let projectIdsList = []
        projectsList.forEach( async (project, key)=>{
            projectIdsList.push(project.id);
        })
        await syncStationsByProject(projectIdsList)

        resolve();
        // if(key === projectsList.length -1) {
        //     resolve();
        // }

        // ---- END SYNC STATIONS FOR ALL PROJECTS
    });


};

export const syncProjects = async () => {
    return new Promise(async (resolve, reject) => {
        axios.get(`${API}api/projects?limit=${LIMIT_TO_LOAD}`)
            .then((res: any) => {

                let queryValues = "";
                if(res.data.length) {
                    projectsList = res.data;

                    let query = `INSERT OR IGNORE INTO projects 
    (cloudId, title, contractor, status, createdAt, updatedAt, deletedAt) 
    VALUES`;

                    projectsList.forEach((item, key)=>{
                        queryValues += `(
                            ${item.id}, 
                            "${item.title}", 
                            "${item.contractor}", 
                            ${item.status}, 
                            ${toTimestamp(item.createdAt)}, 
                            ${toTimestamp(item.updatedAt)}, 
                            ${toTimestamp(item.deletedAt)}
                            )`;
                        queryValues += key === projectsList.length-1 ? "; " : ", ";
                    });
                    query += queryValues;

                    db().then((connect: any) => {
                        connect.transaction(function (txn) {
                            txn.executeSql(
                                query,
                                [],
                                (tx, resp) => {
                                    console.log(" -- INSERT PROJECT SUCCESS -- ");
                                    resolve(resp);
                                },
                                (tx, error) => reject({tx, error})
                            );
                        });
                    })
                } else {
                    projectsList = [];
                }
            });
    })
}

export const syncStationsByProject = (projectIdsList) => {
    return new Promise(async (resolve, reject) => {
        axios.get(`${API}api/projects/${projectIdsList[0]}/stations?limit=${LIMIT_TO_LOAD}&projectsList=${JSON.stringify(projectIdsList)}`).then((res)=>{

            // console.log('RESP', res);
            //
            // return;

            const stations = res.data.rows;

            if(stations.length){
                let queryValues = "";

                let query = `INSERT OR IGNORE INTO stations 
(cloudId, 
 title,
 description,
 nazw_stac,
 num_eksp_s,
 comment,
 type,
 status,
 userId,
 projectId,
 points, 
 createdAt, 
 updatedAt, 
 deletedAt) 
VALUES`;


                stations.forEach((item, key)=>{
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
                        "qwe", 
                        ${toTimestamp(item.createdAt)}, 
                        ${toTimestamp(item.updatedAt)}, 
                        ${toTimestamp(item.deletedAt)}
                        )`;
                    queryValues += key === stations.length-1 ? "; " : ", ";
                });
                query += queryValues;

                console.log('---- STATIONS QUERY', query);
                db().then((connect: any) => {
                    connect.transaction(function (txn) {
                        txn.executeSql(
                            query,
                            [],
                            (tx, resp) => {
                                console.log(" -- INSERT STATION SUCCESS -- ");
                                resolve(resp);
                            },
                            (tx, error) => {
                                console.log('ERROR', error);
                                reject({tx, error})
                            }
                        );
                    });
                })

            }
        });
    });
}

export const getValues = () => {
    return new Promise(async (resolve, reject) => {
        const query = "select ROWID, title from stations";
        db().then((connect: any) => {
            connect.transaction(function (txn) {
                txn.executeSql(
                    query,
                    [],
                    (tx, resp) => {
                        console.log('STATIONS TABLE CONTAIN: ', JSON.stringify(resp.rows));
                        resolve(tx);
                    },
                    (tx, error) => reject({tx, error})
                );
            });
        })
    })
};

interface Observer {
    update(emitter: { isOpen: boolean; isCreated: boolean; isUploaded: boolean }): void;
}

export const sync = async () => {
    console.log('database started');

    class Observable implements Observer {
        public update(emitter: { isOpen: boolean; isCreated: boolean; isUploaded: boolean }): void {
            console.log('emitter', emitter);
        }
    }

    const observer = new Observable();

    const db = new Database();

    db.attach(observer);

    try {
        await db.initDB();
        // await db.dropDB();
        await db.syncBD();
    } catch (e) {

    } finally {
        console.log('finished');
    }


    // try{
    //     await dropTables();
    //     await createTables();
    //     await globalSync();
    //     await getValues();
    // } catch (e) {
    //     console.log('Error', e);
    // } finally {
    //     console.log('finished');
    // }
};
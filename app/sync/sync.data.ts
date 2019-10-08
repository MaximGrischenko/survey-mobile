import axios from 'react-native-axios';
import {db} from './connect';
import {TABLES} from "./tables";
import {API} from "../config";
import SqlString from 'sqlstring';
const LIMIT_TO_LOAD = 1;

export const dropTables = () => {
    return new Promise((resolve, reject) => {
        db().then((connect: any) => {
            console.log('Create tables');

            connect.transaction((txn) => {
                txn.executeSql(
                    `DROP TABLE IF EXISTS projects;`,
                    [],
                    (tx, res) => {
                        console.log(' -- DROP TABLE Success -- ');
                        resolve({tx, res})
                    },
                    (tx, res) => {
                        console.log('DROP Err', tx, res);
                        reject({tx, res})
                    }
                )
            })
        })
    })
}
export const createTables = () => {
    return new Promise((resolve, reject) => {
        db().then((connect: any) => {

            connect.transaction((txn) => {
                txn.executeSql(
                    `
CREATE TABLE IF NOT EXISTS projects (
id SERIAL,
title VARCHAR(255), 
contractor VARCHAR(255), 
status INTEGER DEFAULT 1, 
createdAt TIMESTAMP WITH TIME ZONE NOT NULL, 
updatedAt TIMESTAMP WITH TIME ZONE NOT NULL, 
deletedAt TIMESTAMP WITH TIME ZONE, 
PRIMARY KEY (id));`,
                    [],
                    (tx, res) => {
                        console.log(' -- CREATE TABLE SUCCESS -- ', res);
                        resolve({tx, res})
                    },
                    (tx, res) => reject({tx, res})
                )
            })
        })
    })
};

let toTimestamp = strDate => {
    return strDate ? Date.parse(strDate) : null;
}


export const loadAndStore = () => {
    return new Promise(async (resolve, reject) => {
        axios.get(`${API}api/projects?limit=${LIMIT_TO_LOAD}`)
            .then((res: any) => {
                const list = res.data;
                if(list.length) {
                    const item = list[0];
                    const query = `INSERT INTO projects 
    (id, title, contractor, status, createdAt, updatedAt, deletedAt) 
    VALUES
    (${item.id}, "${item.title}", "${item.contractor}", ${item.status}, ${toTimestamp(item.createdAt)}, ${toTimestamp(item.updatedAt)}, ${toTimestamp(item.deletedAt)})`;

                    console.log('item', item, query);
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

                }
            });


        // const query = 'INSERT INTO projects (id, title, contractor, status, createdAt, updatedAt, deletedAt) VALUES (3209, "KWIATKI", "URZĄD MIASTA ZAKOPANE UTZRYMANIE ZIELENI", 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)';
        // db().then((connect: any) => {
        //     console.log('QUERY', query);
        //     connect.transaction(function (txn) {
        //         txn.executeSql(
        //             query,
        //             [],
        //             (tx, resp) => {
        //                 console.log("---------", resp);
        //                 resolve(resp);
        //             },
        //             (tx, error) => reject({tx, error})
        //         );
        //     });
        // })
    })
  // return new Promise(async (resolve, reject) => {
  //     axios.get(`${API}api/projects?limit=${LIMIT_TO_LOAD}`)
  //         .then((res: any) => {
  //             const list = res.data;
  //             const headers = [];
  //             // console.log('List', list);
  //             if (list.length) {
  //                 let query = 'INSERT INTO projects (';
  //
  //                 const keys = Object.keys(list[0]);
  //                 console.log('keys', keys);
  //
  //                 for(let i = 0; i < keys.length; i++) {
  //                    // headers.push(keys[i]);
  //                     // console.log('i', i, 'i>=keys.length', i>=keys.length);
  //                     // query += keys[i] + (i >= keys.length-1 ? ") VALUES(" : ",");
  //                     for(let j = 0; j < keys.length; j++) {
  //                         console.log('value', list[i][keys[j]]);
  //
  //                         if(list[i][keys[j]] instanceof Object) {
  //                             return;
  //                         }
  //                     }
  //                 }
  //
  //                 console.log('HEADERS', headers);
  //
  //                 // for (let i = 0; i < keys.length; i++) {
  //                 //     query += keys[i] + (i >= keys.length-1 ? ") VALUES(" : ",");
  //                 // }
  //                 // for (let i = 0; i < list.length; i++) {
  //                 //     for (let j = 0; j < keys.length; j++) {
  //                 //         const val = list[i][keys[j]];
  //                 //         let _val = typeof val === 'string' ? `"${val}"` : val;
  //                 //         query += _val + (j >= keys.length ? "),(" : ",");
  //                 //     }
  //                 // }
  //                 console.log('QUERY', query);
  //                 // db().then((connect: any) => {
  //                 //     console.log('QUERY', query);
  //                 //     connect.transaction(function (txn) {
  //                 //         txn.executeSql(
  //                 //             query,
  //                 //             [],
  //                 //             (tx, resp) => {
  //                 //                 console.log("---------", resp);
  //                 //                 resolve(res.data);
  //                 //             },
  //                 //             (tx, error) => reject({tx, error})
  //                 //         );
  //                 //     });
  //                 // })
  //             }
  //         })
  //         .catch(reject)
  // })
};

export const getValues = () => {
    return new Promise(async (resolve, reject) => {
        const query = "select * from projects";
        db().then((connect: any) => {
            connect.transaction(function (txn) {
                txn.executeSql(
                    query,
                    [],
                    (tx, resp) => {
                        console.log('PROJECT TABLE CONTAIN: ', JSON.stringify(resp.rows));
                        resolve(tx);
                    },
                    (tx, error) => reject({tx, error})
                );
            });
        })
    })
};

export const sync = async () => {
    console.log('sync started');

    try{
        await dropTables();
        await createTables();
        await loadAndStore();
        await getValues();
    } catch (e) {
        console.log('Error', e);
    } finally {
        console.log('finished');
    }
};
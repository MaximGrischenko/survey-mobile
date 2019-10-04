import {db} from './connect';
import {TABLES} from './sql/create.tables';
import {API} from "../config";
import Projects from "./models/projects";
import axios from "react-native-axios";

const LIMIT_TO_LOAD = 100000;

export const createTables = function () {
    return new Promise((resolve, reject) => {
        db().then((connect: any) => {
            console.log("Create tables");
            connect.transaction(function (txn) {
                txn.executeSql(
                    TABLES,
                    [],
                    (tx, res) => {
                        console.log("Success", res);
                        resolve({tx, res})
                    },
                    (tx, res) => reject({tx, res})
                );
            });
        })
    })
}
export const loadAndStore = async function () {
    try {
        const projects = await loadAndStoreProjects();
    } catch (e) {
        console.log(e);
        throw e;
    }
}
export const loadAndStoreProjects = function () {
    return new Promise(async (resolve, reject) => {

        /*db().then((connect: any) => {
            connect.transaction(function (txn) {
                txn.executeSql(
                    "Select count(*) from projects",
                    [],
                    (tx, res) => {
                        console.log(res);
                    }, (tx, res) => {
                        console.log("Errror", tx, res);
                    }
                );
            });
        })
        return;*/

        axios.get(`${API}api/projects?limit=${LIMIT_TO_LOAD}`)
            .then((res: any) => {
                const list = res.data;
                if (list.length) {
                    let query = 'INSERT INTO projects (';
                    const keys = list[0];
                    console.log(keys);
                    for (let i = 0; i < keys.length; i++) {
                        query += keys[i] + (i >= keys.length ? ") VALUES(" : ",");
                    }
                    for (let i = 0; i < list.length; i++) {
                        for (let j = 0; j < keys.length; j++) {
                            const val = list[i][keys[j]];
                            let _val = typeof val === 'string' ? `"${val}"` : val;
                            query += _val + (j >= keys.length ? "),(" : ",");
                        }
                    }
                    db().then((connect: any) => {
                        connect.transaction(function (txn) {
                            txn.executeSql(
                                query,
                                [],
                                (tx, resp) => {
                                    console.log("---------", resp);
                                    resolve(res.data);
                                },
                                (tx, error) => reject({tx, error})
                            );
                        });
                    })

                }

            })
            .catch(reject)
    })
}

export const sync = async function () {
    console.log("sync started");
    try {
        await createTables();
        await loadAndStore();
    } catch (e) {
        console.log("ERROR----------", e);
    } finally {
        console.log("sync finished");
    }
}

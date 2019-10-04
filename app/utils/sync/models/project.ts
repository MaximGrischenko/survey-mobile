import {SQLite} from 'expo-sqlite'
import {BaseModel, types} from 'expo-sqlite-orm'
import {db} from '../connect'

export default class Projects extends BaseModel {
    constructor(obj) {
        super(obj)
    }

    static get database() {
        return async () => db()
    }

    static get tableName() {
        return '_projects'
    }

    static get columnMapping() {
        return {
            id: {type: types.INTEGER, primary_key: true}, // For while only supports id as primary key
            title: {type: types.TEXT},
            contractor: {type: types.TEXT},
            status: {type: types.NUMERIC},

            deletedAt: {type: types.TEXT},
            updatedAt: {type: types.TEXT},
            createdAt: {type: types.TEXT}
        }
    }
}

import {SQLite} from 'expo-sqlite';

export interface IDatabase {
    connect(): Promise<void>,
    close(): Promise<void>,
}

export class Initialization implements IDatabase{
    private database: any;

    public updateTables(database): Promise<void> {

        return database
            .transaction(this.createTables)
    }

    private createTables() {
        const drop = false;
        if(drop) {

        }
    }

    public connect(): Promise<void> {
        return new Promise((resolve => SQLite.openDatabase("survey", "1.0", "demo", 1024 * 1000 * 100, resolve)));
    }

    public close(): Promise<void> {
        return this.database.close().then(status => {

        })
    }
}

import {SQLite} from 'expo-sqlite';
export class Initialization {
    public updateTables(database): Promise<void> {

        return database
            .transaction(this.createTables)
    }

    private createTables() {
        const drop = false;
        if(drop) {

        }
    }
}

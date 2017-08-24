import * as path from "path";

import db = require("sqlite");

export class SqlLiteHelper {
    private database: db.Database;

    public async init(): Promise<void> {
        this.database = await db.open("./preferences.sqllite", { promise: Promise });
        await this.database.migrate({migrationsPath: path.join(__dirname, "./migrations/")});
    }

    public async getSingle<T, TId1, TId2 = void>(tableName: string, columnName1: string, id1: TId1, columnName2?: string, id2?: TId2): Promise<T> {
        if (!columnName2 && !id2) {
            return await this.database.get(`SELECT * FROM ${tableName} WHERE ${columnName1} = '${id1}'`);
        } else if (columnName1 && columnName2) {
            return await this.database.get(`SELECT * FROM ${tableName} WHERE ${columnName1} = '${id1}' AND ${columnName2} = '${id2}'`);
        } else {
            // TODO: Error Handling
            return <T>{};
        }
    }

    public getList<T, TId>(tableName: string, coulmnName: string, id: TId): Promise<T[]> {
        return this.database.all(`SELECT * FROM ${tableName} WHERE ${coulmnName} = '${id}'`);
    }

    public async exec(command: string) : Promise<void> {
        await this.database.exec(command);
    }
}

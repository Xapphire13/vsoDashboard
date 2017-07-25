// import * as db from 'sqlite';
import * as path from "path";
import db = require("sqlite");


export class SqlLiteHelper {
    theDB : db.Database;

    public async init() : Promise<void> {
        this.theDB = await db.open("./preferences.sqllite", <any>{ promise: Promise, cached: true});
        await this.theDB.migrate({ force: "last", migrationsPath: path.join(process.cwd(), "/src/migrations/")});
    }

    public async get<T, TId1, TId2 = void>(tableName: string, coulmnName1: string, id1: TId1, coulmnName2?: string, id2?: TId2) : Promise<T> {
        if (coulmnName2 == undefined && id2 == undefined) {
            return await this.theDB.get(`SELECT * FROM ${tableName} WHERE ${coulmnName1} = '${id1}'`);
        } else if (coulmnName2 != undefined && coulmnName2 != undefined) {
            return await this.theDB.get(`SELECT * FROM ${tableName} WHERE ${coulmnName1} = '${id1}' AND ${coulmnName2} = '${id2}'`);
        } else {
            // TODO: Error Handling
            return <T>{};
        }
    }

    public async exec(command : string) : Promise<any>
    {
        await this.theDB.exec(command);
    }
}
// import * as db from 'sqlite';
import * as path from "path";
import db = require("sqlite");


export class SqlLiteHelper {
    theDB : db.Database;

    public async init() : Promise<void> {
        this.theDB = await db.open("./preferences.sqllite", <any>{ promise: Promise, cached: true});
        await this.theDB.migrate({ force: "last", migrationsPath: path.join(process.cwd(), "/src/migrations/")});
    }

    public async get<T, TId>(tableName : string, coulmnName: string, id : TId) : Promise<T> {
        return await this.theDB.get(`SELECT * FROM ${tableName} WHERE ${coulmnName} = '${id}'`);
    }

    public async exec(command : string) : Promise<any>
    {
        await this.theDB.exec(command);
    }
}
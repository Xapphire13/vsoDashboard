// import * as db from 'sqlite';
import * as path from "path";
import db = require("sqlite");


export class SqlLiteHelper {

    public async init() : Promise<void>
    {
        let theBase = await db.open("./preferences.sqllite", <any>{ Promise });
        await theBase.migrate({ force: "last", migrationsPath: path.join(process.cwd(), "/src/migrations/")});
    }
}
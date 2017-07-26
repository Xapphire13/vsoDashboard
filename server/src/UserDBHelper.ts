import {IPreferences} from "./IPreferences"
import {IRepositoryPreference} from "./IRepositoryPreference"
import {ISortPreference} from "./ISortPreference"
import {SqlLiteHelper} from "./SqlLiteHelper"
import {IDBUser} from "./DB/IDBUser"
import {IDBUserRepoPreference} from "./DB/IDBUserRepoPreference"
import {IDBUserSortPreference} from "./DB/IDBUserSortPreference"

export class UserDBHelper {
    public async getUserPreferences(databaseHelper : SqlLiteHelper, oAuthId : string) : Promise<IPreferences|null> {
        let dbUser = await databaseHelper.getSingle<IDBUser, string>("UserStore", "oAuthId", oAuthId);

        if (dbUser == null) {
            return null;
        }

        let dbUserRepoPrefsTask = databaseHelper.getList<IDBUserRepoPreference, number>("UserPreference", "userId", dbUser.id);
        let dbSortTasks = databaseHelper.getList<IDBUserSortPreference, number>("UserSortPreference", "userId", dbUser.id);

        const result: any[] = await Promise.all([
            await dbUserRepoPrefsTask,
            await dbSortTasks
        ]);

        const dbUserRepoPrefs: IDBUserRepoPreference[] = result[0];
        const dbSort: IDBUserSortPreference[] = result[1];

        let userRepoPrefs : Array<IRepositoryPreference> | undefined;
        if (dbUserRepoPrefs != undefined && dbUserRepoPrefs.length > 0) {
            userRepoPrefs = dbUserRepoPrefs.map(x => <IRepositoryPreference>{
                isMinimised: x.isMinimised === 1,
                justMine: x.justMine === 1,
                repositoryId: x.vsoRepositoryId,
                sortPreferences: dbSort
                    .filter(y => y.userId === x.userId && y.preferenceId === x.id)
                    .map(y => <ISortPreference>{
                        column: y.sortColumn,
                        isAssending: y.isAssending === 1,
                        presidence: y.presidence
                    })
            });
        }

        return <IPreferences> {
            emailOverride: dbUser.emailOverride,
            pollIntervalInSeconds: dbUser.pollIntervalInSecs,
            repositoryPrefrences: userRepoPrefs == null ? null : userRepoPrefs,
            staleThresholdInMinutes: dbUser.staleIntervalInMins
        }
    }

    public async updateUserPreference(databaseHelper : SqlLiteHelper, prefs : IPreferences, oAuthId : string) : Promise<any>
    {
        let query = `INSERT OR REPLACE INTO UserStore (id, oAuthId, emailOverride, pollIntervalInSecs, staleIntervalInMins) VALUES ((SELECT id FROM UserStore WHERE oAuthId = '${oAuthId}'), '${oAuthId}', '${prefs.emailOverride}', '${prefs.pollIntervalInSeconds}', '${prefs.staleThresholdInMinutes}');`;
        databaseHelper.exec(query);
        let dbUser = await databaseHelper.getSingle<IDBUser, string>("UserStore", "oAuthId", oAuthId);

        let dbUserRepoPrefs = await databaseHelper.getList<IDBUserRepoPreference, number>("UserPreference", "userId", dbUser.id);

        let repositoryPrefsToDelete = new Array<number>();
        if (dbUserRepoPrefs != undefined && dbUserRepoPrefs.length > 0) {
            if (prefs.repositoryPrefrences != undefined) {
                repositoryPrefsToDelete.concat(dbUserRepoPrefs.filter(x => !prefs.repositoryPrefrences.some(y => y.repositoryId === x.vsoRepositoryId)).map(x => x.id));
            } else {
                repositoryPrefsToDelete.concat(dbUserRepoPrefs.map(x => x.id));
            }
        }

        if (repositoryPrefsToDelete != undefined && repositoryPrefsToDelete.length > 0) {
            let deleteTasks = new Array<Promise<any>>();
            repositoryPrefsToDelete.forEach(id => {
                query = `DELETE FROM UserPreference WHERE id = '${id}'`;
                deleteTasks.push(databaseHelper.exec(query));
            });

            await Promise.all(deleteTasks);
        }

        let dbSort = await databaseHelper.getList<IDBUserSortPreference, number>("UserSortPreference", "userId", dbUser.id);

        // Just clean these up, we'll recreate in a moment.
        if (dbSort != undefined && dbSort.length > 0) {
            let deleteTasks = new Array<Promise<any>>();
            dbSort.forEach(element => {
                query = `DELETE FROM UserSortPreference WHERE id = '${element.id}'`;
                deleteTasks.push(databaseHelper.exec(query));
            });
            await Promise.all(deleteTasks);
        }

        if (prefs.repositoryPrefrences != undefined && prefs.repositoryPrefrences.length > 0) {
            let sortInsertTasks = new Array<Promise<any>>();
            prefs.repositoryPrefrences.forEach(async element => {
                query = `INSERT OR REPLACE INTO UserPreference (id, userId, vsoRepositoryId, justMine, isMinimised) VALUES ((SELECT id FROM UserPreference WHERE userId = '${dbUser.id}' AND vsoRepositoryId = '${element.repositoryId}'), '${dbUser.id}', '${element.repositoryId}', '${element.justMine ? 1 : 0}', '${element.isMinimised ? 1 : 0}')`;
                await databaseHelper.exec(query);
                if (element.sortPreferences != undefined && element.sortPreferences.length > 0) {
                    let inserted = await databaseHelper.getSingle<IDBUserRepoPreference, number, string>("UserPreference", "userId", dbUser.id, "vsoRepositoryId", element.repositoryId);
                    element.sortPreferences.forEach(element2 => {
                        query = `INSERT INTO UserSortPreference (preferenceId, userId, sortColumn, isAssending, presidence) VALUES ('${inserted.id}', '${dbUser.id}', '${element2.column}', '${element2.isAssending ? 1 : 0}', '${element2.presidence}')`;
                        sortInsertTasks.push(databaseHelper.exec(query));
                    });
                }
            });

            await Promise.all(sortInsertTasks);
        }
    }
}

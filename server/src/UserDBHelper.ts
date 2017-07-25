import {IPreferences} from "../../shared/IPreferences"
import {IRepositoryPreference} from "../../shared/IRepositoryPreference"
import {ISortPreference} from "../../shared/ISortPreference"
import {SqlLiteHelper} from "./SqlLiteHelper"
import {IDBUser} from "./DB/IDBUser"
import {IDBUserRepoPreference} from "./DB/IDBUserRepoPreference"
import {IDBUserSortPreference} from "./DB/IDBUserSortPreference"
import {TS} from "typescript-linq"


export class UserDBHelper {
    public async getUserPreferences(databaseHelper : SqlLiteHelper, oAuthId : string) : Promise<IPreferences|null> {
        let dbUser = await databaseHelper.get<IDBUser, string>("UserStore", "oAuthId", oAuthId);

        if (dbUser == null) {
            return null;
        }

        let dbUserRepoPrefsTask = databaseHelper.get<Array<IDBUserRepoPreference>, number>("UserPreference", "userId", dbUser.id);
        let dbSortTasks = databaseHelper.get<Array<IDBUserSortPreference>, number>("UserSortPreference", "userId", dbUser.id);

        const [dbUserRepoPrefs,dbSort] = await Promise.all([
            await dbUserRepoPrefsTask,
            await dbSortTasks]);

            let sortsEnumerator : TS.Linq.Enumerator<IDBUserSortPreference>;

            if (dbSort != null) {
                sortsEnumerator = new TS.Linq.Enumerator(dbSort);
            }

            let userRepoPrefs : Array<IRepositoryPreference> | undefined;
            if (dbUserRepoPrefs != null)
            {
                userRepoPrefs = new TS.Linq.Enumerator(dbUserRepoPrefs).select(x => <IRepositoryPreference>{
                    isMinimised: x.isMinimised === 1,
                    justMine: x.justMine === 1,
                    repositoryId: x.vsoRepositoryId,
                    sortPreferences: sortsEnumerator == null ? null : sortsEnumerator
                        .where(y => y.userId === x.userId && y.preferenceId === x.id)
                        .select(y => <ISortPreference>{
                            column: y.sortColumn,
                            isAssending: y.isAssending === 1,
                            presidence: y.presidence
                        }).toArray()
                }).toArray();
            }

        return <IPreferences> {
            emailOverride: dbUser.emailOverride,
            pollIntervalInSeconds: dbUser.pollIntervalInSecs,
            repositoryPrefrences: userRepoPrefs == null ? null : userRepoPrefs
        }
    }

    public async updateUserPreference(databaseHelper : SqlLiteHelper, prefs : IPreferences, oAuthId : string) : Promise<any>
    {
        let query = `INSERT OR REPLACE INTO UserStore (id, oAuthId, emailOverride, pollIntervalInSecs) VALUES ((SELECT id FROM UserStore WHERE oAuthId = '${oAuthId}'), '${oAuthId}', '${prefs.emailOverride}', '${prefs.pollIntervalInSeconds}');`;
        databaseHelper.exec(query);
        let dbUser = await databaseHelper.get<IDBUser, string>("UserStore", "oAuthId", oAuthId);

        let dbUserRepoPrefs = await databaseHelper.get<Array<IDBUserRepoPreference>, number>("UserPreference", "userId", dbUser.id);

        let preferencesEnumerator: TS.Linq.Enumerator<IRepositoryPreference> | undefined;
        if (prefs.repositoryPrefrences != null) {
            preferencesEnumerator = new TS.Linq.Enumerator(prefs.repositoryPrefrences);
        }

        let repositoryPrefsToDelete = new Array<number>();
        if (dbUserRepoPrefs != undefined && dbUserRepoPrefs.length > 0) {
            let dbUserRepoEnumerator = new TS.Linq.Enumerator(dbUserRepoPrefs);
            if (preferencesEnumerator != undefined) {
                repositoryPrefsToDelete.concat(dbUserRepoEnumerator.where(x => preferencesEnumerator != undefined && !preferencesEnumerator.any(y => y.repositoryId === x.vsoRepositoryId)).select(x => x.id).toArray());
            } else {
                repositoryPrefsToDelete.concat(dbUserRepoEnumerator.select(x => x.id).toArray());
            }
        }

        if (repositoryPrefsToDelete != undefined && repositoryPrefsToDelete.length > 0) {
            let deleteTasks = new Array<Promise<any>>();
            repositoryPrefsToDelete.forEach(id => {
                query = `DELETE FROM UserPreference WHERE id = ${id}`;
                deleteTasks.push(databaseHelper.exec(query));
            });

            await Promise.all(deleteTasks);
        }

        let dbSort = await databaseHelper.get<Array<IDBUserSortPreference>, number, string>("UserSortPreference", "userId", dbUser.id);

        // Just clean these up, we'll recreate in a moment.
        if (dbSort != undefined && dbSort.length > 0) {
            let deleteTasks = new Array<Promise<any>>();
            dbSort.forEach(element => {
                query = `DELETE FROM UserSortPreference WHERE id = ${element.id}`;
                deleteTasks.push(databaseHelper.exec(query));
            });
            await Promise.all(deleteTasks);
        }

        if (prefs.repositoryPrefrences != undefined && prefs.repositoryPrefrences.length > 0) {
            let sortInsertTasks = new Array<Promise<any>>();
            prefs.repositoryPrefrences.forEach(async element => {
                query = `INSERT OR REPLACE INTO UserPreference (id, userId, vsoRepositoryId, justMine, isMinimised) VALUES ((SELECT id FROM UserPreference WHERE userId = '${dbUser.id}' AND vsoRepositoryId = '${element.repositoryId}'), '${dbUser.id}', '${element.repositoryId}', ${element.justMine ? 1 : 0}, ${element.isMinimised ? 1 : 0})`;
                await databaseHelper.exec(query);
                if (element.sortPreferences != undefined && element.sortPreferences.length > 0) {
                    let inserted = await databaseHelper.get<IDBUserRepoPreference, number, string>("UserPreference", "userId", dbUser.id, "vsoRepositoryId", element.repositoryId);
                    element.sortPreferences.forEach(element2 => {
                        query = `INSERT INTO UserSortPreference (preferenceId, userId, sortColumn, isAssending, presidence) VALUES ${inserted.id}, ${dbUser.id}, ${element2.column}, ${element2.isAssending ? 1 : 0}, ${element2.presidence}`;
                        sortInsertTasks.push(databaseHelper.exec(query));
                    });
                }
            });

            await Promise.all(sortInsertTasks);
        }
    }
}
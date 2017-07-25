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

    public async updateUserPreference(databaseHelper : SqlLiteHelper, prefs : IPreferences, userId : string) : Promise<any>
    {
        let query = `INSERT OR REPLACE INTO UserStore (id, oAuthId, emailOverride, pollIntervalInSecs) VALUES ((SELECT id FROM UserStore WHERE oAuthId = '${userId}'), '${userId}', '${prefs.emailOverride}', '${prefs.pollIntervalInSeconds}');`;
        await databaseHelper.exec(query);
    }
}
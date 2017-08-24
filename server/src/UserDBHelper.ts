import {IDBUserRepoPreference} from "./DB/IDBUserRepoPreference";
import {IDBUserSortPreference} from "./DB/IDBUserSortPreference";
import {IDBUser} from "./DB/IDBUser";
import {IPreferences} from "./IPreferences";
import {IRepositoryPreference} from "./IRepositoryPreference";
import {ISortPreference} from "./ISortPreference";
import {SqlLiteHelper} from "./SqlLiteHelper";

export class UserDBHelper {
  public async getUserPreferences(databaseHelper: SqlLiteHelper, oAuthId: string): Promise<IPreferences> {
    const dbUser = await databaseHelper.getSingle<IDBUser, string>("UserStore", "oAuthId", oAuthId);

    if (!dbUser) {
      // No user preferences, return default
      return {
        pollIntervalInSeconds: 600,
        repositoryPreferences: [],
        staleThresholdInMinutes: 2880
      };
    }

    const dbUserRepoPrefsTask = databaseHelper.getList<IDBUserRepoPreference, number>("UserPreference", "userId", dbUser.id);
    const dbSortTasks = databaseHelper.getList<IDBUserSortPreference, number>("UserSortPreference", "userId", dbUser.id);

    const  [
      dbUserRepoPrefs,
      dbSort
    ] = await Promise.all([
      dbUserRepoPrefsTask,
      dbSortTasks
    ]);

    let userRepoPrefs: IRepositoryPreference[] | undefined;
    if (dbUserRepoPrefs && dbUserRepoPrefs.length > 0) {
      userRepoPrefs = dbUserRepoPrefs.map(x => <IRepositoryPreference>{
        isMinimized: !!x.isMinimized,
        justMine: !!x.justMine,
        repositoryId: x.vsoRepositoryId,
        sortPreferences: dbSort
          .filter(y => y.userId === x.userId && y.preferenceId === x.id)
          .map(y => <ISortPreference>{
            column: y.sortColumn,
            isAscending: !!y.isAscending,
            precedence: y.precedence
          })
      });
    }

    return <IPreferences>{
      emailOverride: dbUser.emailOverride,
      pollIntervalInSeconds: dbUser.pollIntervalInSecs,
      repositoryPreferences: userRepoPrefs,
      staleThresholdInMinutes: dbUser.staleIntervalInMins
    }
  }

  public async updateUserPreference(databaseHelper: SqlLiteHelper, prefs: IPreferences, oAuthId: string): Promise<any> {
    let query = `INSERT OR REPLACE INTO UserStore (id, oAuthId, emailOverride, pollIntervalInSecs, staleIntervalInMins) VALUES ((SELECT id FROM UserStore WHERE oAuthId = '${oAuthId}'), '${oAuthId}', '${prefs.emailOverride}', '${prefs.pollIntervalInSeconds}', '${prefs.staleThresholdInMinutes}');`;
    await databaseHelper.exec(query);

    const dbUser = await databaseHelper.getSingle<IDBUser, string>("UserStore", "oAuthId", oAuthId);
    const dbUserRepoPrefs = await databaseHelper.getList<IDBUserRepoPreference, number>("UserPreference", "userId", dbUser.id);

    if (dbUserRepoPrefs && dbUserRepoPrefs.length > 0) {
      let repositoryPrefsToDelete: number[];
      if (prefs.repositoryPreferences) {
        repositoryPrefsToDelete = dbUserRepoPrefs.filter(x => !prefs.repositoryPreferences.some(y => y.repositoryId === x.vsoRepositoryId)).map(x => x.id);
      } else {
        repositoryPrefsToDelete = dbUserRepoPrefs.map(x => x.id);
      }

      if (repositoryPrefsToDelete.length > 0) {
        const deleteTasks: Promise<any>[] = repositoryPrefsToDelete.map(id =>
          databaseHelper.exec(`DELETE FROM UserPreference WHERE id = '${id}'`)
        );

        await Promise.all(deleteTasks);
      }
    }

    const dbSort = await databaseHelper.getList<IDBUserSortPreference, number>("UserSortPreference", "userId", dbUser.id);

    // Just clean these up, we'll recreate in a moment.
    if (dbSort != undefined && dbSort.length > 0) {
      const deleteTasks: Promise<any>[] = dbSort.map(element =>
        databaseHelper.exec(`DELETE FROM UserSortPreference WHERE id = '${element.id}'`)
      );

      await Promise.all(deleteTasks);
    }

    if (prefs.repositoryPreferences && prefs.repositoryPreferences.length > 0) {
      const sortInsertTasks: Promise<any>[] = prefs.repositoryPreferences.map(async element => {
        let query = `INSERT OR REPLACE INTO UserPreference (id, userId, vsoRepositoryId, justMine, isMinimized) VALUES ((SELECT id FROM UserPreference WHERE userId = '${dbUser.id}' AND vsoRepositoryId = '${element.repositoryId}'), '${dbUser.id}', '${element.repositoryId}', '${element.justMine ? 1 : 0}', '${element.isMinimized ? 1 : 0}')`;
        await databaseHelper.exec(query);

        if (element.sortPreferences && element.sortPreferences.length > 0) {
          const inserted = await databaseHelper.getSingle<IDBUserRepoPreference, number, string>("UserPreference", "userId", dbUser.id, "vsoRepositoryId", element.repositoryId);
          await Promise.all(element.sortPreferences.map(element2 =>
            databaseHelper.exec(`INSERT INTO UserSortPreference (preferenceId, userId, sortColumn, isAscending, precedence) VALUES ('${inserted.id}', '${dbUser.id}', '${element2.column}', '${element2.isAscending ? 1 : 0}', '${element2.precedence}')`)
          ));
        }
      });

      await Promise.all(sortInsertTasks);
    }
  }
}

export interface IDBUserRepoPreference {
    id: number;
    userId: number;
    vsoRepositoryId: string;
    justMine: number;
    isMinimized: number;
}

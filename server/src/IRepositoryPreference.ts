import {ISortPreference} from "./ISortPreference";

export interface IRepositoryPreference {
    repositoryId: string;
    justMine: boolean;
    isMinimised: boolean;
    sortPreferences: ISortPreference[];
}

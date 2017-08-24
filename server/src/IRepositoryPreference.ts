import {ISortPreference} from "./ISortPreference";

/**
 * Per repository preference
 */
export interface IRepositoryPreference {
    repositoryId: string;
    justMine: boolean;
    isMinimized: boolean;
    sortPreferences: ISortPreference[];
}

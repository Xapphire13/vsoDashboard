import {IRepositoryPreference} from "./IRepositoryPreference";

/**
 * User proferences
 */
export interface IPreferences {
    emailOverride?: string;
    repositoryPreferences: Array<IRepositoryPreference>;
    pollIntervalInSeconds: number;
    staleThresholdInMinutes: number;
}

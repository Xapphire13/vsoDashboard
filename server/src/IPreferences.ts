import {IRepositoryPreference} from "./IRepositoryPreference";

export interface IPreferences {
    emailOverride?: string;
    repositoryPreferences: Array<IRepositoryPreference>;
    pollIntervalInSeconds: number;
    staleThresholdInMinutes: number;
}

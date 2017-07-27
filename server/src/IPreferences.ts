import {IRepositoryPreference} from "./IRepositoryPreference";

export interface IPreferences {
    emailOverride?: string;
    repositoryPrefrences: IRepositoryPreference[];
    pollIntervalInSeconds: number;
    staleThresholdInMinutes: number;
}

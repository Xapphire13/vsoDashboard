import {IRepositoryPreference} from "./IRepositoryPreference";

export interface IPreferences {
    emailOverride : string;
    repositoryPrefrences : Array<IRepositoryPreference>;
    pollIntervalInSeconds : number;
}
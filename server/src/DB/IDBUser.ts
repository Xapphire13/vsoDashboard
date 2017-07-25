export interface IDBUser {
    id : number;
    oAuthId : string;
    emailOverride : string;
    pollIntervalInSecs : number;
    staleIntervalInMins : number;
}
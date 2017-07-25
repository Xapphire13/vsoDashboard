import {SortColumns} from "./SortColumns";

export interface ISortPreference {
    column : SortColumns;
    isAssending : boolean;
    presidence : number;
}
import {SortColumns} from "./SortColumns";

/**
 * Sort preference for a repository list
 */
export interface ISortPreference {
    column : SortColumns;
    isAscending : boolean;
    precedence : number;
}

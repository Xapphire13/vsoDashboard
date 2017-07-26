import {IWorkItem} from "./IWorkItem";

export interface IWorkItemQuery {
  asOf: string;
  columns: {name: string, referenceName: string, url: string}[],
  queryResultType: string,
  queryType: string,
  workItems: IWorkItem[]
}

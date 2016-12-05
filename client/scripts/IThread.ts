import {IComment} from "./IComment";

export interface IThread {
  id: number;
  publishedDate: string;
  lastUpdatedDate: string;
  comments: IComment[];
  properties: any;
}

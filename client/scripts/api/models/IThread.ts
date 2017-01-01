import {IComment} from "./IComment";

export interface IThread {
  comments: IComment[];
  id: number;
  lastUpdatedDate: string;
  properties: any;
  publishedDate: string;
}

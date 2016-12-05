import {IUser} from "./IUser";

export interface IComment {
  id: number;
  parentCommentId: number;
  author: IUser;
  content: string;
  publishedDate: string;
  lastUpdatedDate: string;
}

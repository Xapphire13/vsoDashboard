import {IUser} from "./IUser";

export interface IComment {
  author: IUser;
  content: string;
  id: number;
  lastUpdatedDate: string;
  parentCommentId: number;
  publishedDate: string;
}

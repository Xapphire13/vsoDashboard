import {ICommit} from "./ICommit";
import {IUser} from "./IUser";

export interface IIteration {
  id: number;
  description: number;
  author: IUser;
  createdDate: string;
  updatedDate: string;
  sourceRefCommit: ICommit;
  targetRefCommit: ICommit;
  commonRefCommit: ICommit;
  hasMoreCommits: boolean;
}

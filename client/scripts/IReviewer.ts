import {IUser} from "./IUser";

export interface IReviewer
  extends IUser {
    isRequired: boolean;
    vote: number;
}

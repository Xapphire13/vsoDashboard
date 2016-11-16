import {IUser} from "./IUser";

export interface IReviewer
  extends IUser {
    vote: number;
    isRequired: boolean;
}

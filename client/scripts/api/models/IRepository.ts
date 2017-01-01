import {IProject} from "./IProject";

export interface IRepository {
  defaultBranch: string;
  id: string;
  name: string;
  project: IProject;
  remoteUrl: string;
  url: string;
}

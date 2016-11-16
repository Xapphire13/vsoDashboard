import {IProject} from "./IProject";

export interface IRepository {
  name: string;
  id: string;
  url: string;
  project: IProject;
  defaultBranch: string;
  remoteUrl: string;
}

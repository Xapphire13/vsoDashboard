import {ICommit} from "./ICommit";
import {IRepository} from "./IRepository";
import {IReviewer} from "./IReviewer";
import {IUser} from "./IUser";

export interface IPullRequest {
  codeReviewId: number;
  createdBy: IUser;
  creationDate: string;
  description: string;
  lastMergeCommit: ICommit;
  lastMergeSourceCommit: ICommit;
  lastMergeTargetCommit: ICommit;
  mergeId: string;
  mergeStatus: string;
  pullRequestId: number;
  repository: IRepository;
  reviewers: IReviewer[];
  sourceRefName: string;
  status: string;
  supportsIterations: boolean;
  targetRefName: string;
  title: string;
  url: string;
}

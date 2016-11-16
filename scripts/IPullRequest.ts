import {IUser} from "./IUser";
import {IRepository} from "./IRepository";
import {ICommit} from "./ICommit";
import {IReviewer} from "./IReviewer";

export interface IPullRequest {
  repository: IRepository;
  pullRequestId: number;
  codeReviewId: number;
  status: string;
  createdBy: IUser;
  creationDate: string;
  title: string;
  description: string;
  sourceRefName: string;
  targetRefName: string;
  mergeStatus: string;
  mergeId: string;
  lastMergeSourceCommit: ICommit;
  lastMergeTargetCommit: ICommit;
  lastMergeCommit: ICommit;
  reviewers: IReviewer[];
  url: string;
  supportsIterations: boolean;
}

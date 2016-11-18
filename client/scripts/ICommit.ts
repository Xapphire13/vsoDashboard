export interface ICommit {
  commitId: string;
  url: string;
  author: {name: string, email: string; date: string};
  committer: {name: string, email: string; date: string};
  comment: string;
}

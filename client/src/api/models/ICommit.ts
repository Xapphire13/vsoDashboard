export interface ICommit {
  author: {name: string, email: string; date: string};
  comment: string;
  commitId: string;
  committer: {name: string, email: string; date: string};
  url: string;
}

import "../styles/repoList.less";

import * as React from "react";

import {Repo} from './Repo';

export class RepoList extends React.Component {
  public render(): JSX.Element {
    const repos: JSX.Element[] = [];
    repos.push(<Repo key="1" name="Test Repo"/>);
    repos.push(<Repo key="2" name="Super cool repo"/>);

    return <div className="repoList">
      {repos}
    </div>;
  }
}

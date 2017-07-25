import * as React from "react";

import {Repo} from './Repo';

export class RepoList extends React.Component {
  public render(): JSX.Element {
    const repos: JSX.Element[] = [];
    repos.push(<Repo name="Test Repo"/>);
    repos.push(<Repo name="Super cool repo"/>);

    return <div>
      {repos}
    </div>;
  }
}

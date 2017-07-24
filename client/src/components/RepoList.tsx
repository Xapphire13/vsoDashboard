import * as React from "react";

import {Repo} from './Repo';

export class RepoList extends React.Component {
  public render(): JSX.Element {
    const repos: JSX.Element[] = [];
    repos.push(<Repo/>);
    repos.push(<Repo/>);

    return <div>
      {repos}
    </div>;
  }
}
